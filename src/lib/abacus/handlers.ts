import { parseStrictJson, validateStores, type Snapshot, type Stores } from './schema';

export interface AuthPort {
  login(request: Request, input: { username?: string; password?: string }): Promise<{ actor: string; expiresAt: number; setCookie: string }>;
  requireSession(request: Request): Promise<{ actor: string; expiresAt: number }>;
  logout(request: Request): Promise<{ setCookie: string }>;
  expiredCookie?(): string;
  assertSameOrigin(request: Request): void;
}

export interface SnapshotPort {
  read(): Promise<Snapshot>;
  update(revision: number, stores: Stores, actor: string, operationId: string): Promise<Snapshot>;
}

const securityHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
};

export function jsonResponse(data: unknown, status = 200, extra?: HeadersInit): Response {
  const headers = new Headers(securityHeaders);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  new Headers(extra).forEach((value, key) => headers.set(key, value));
  return new Response(data === null ? null : JSON.stringify(data), { status, headers });
}

// 错误只给稳定错误码；不得把底层异常、凭据、业务值或私有存储URL返回浏览器。
export function errorResponse(error: unknown): Response {
  const value = error && typeof error === 'object' ? error as { status?: number; code?: string; revision?: number } : {};
  if (value.code === 'conflict') return jsonResponse({ error: 'revision_conflict', ...(Number.isSafeInteger(value.revision) ? { revision: value.revision } : {}) }, 409);
  if (value.status === 401 || value.status === 403 || value.status === 429) return jsonResponse({ error: value.status === 429 ? 'try_later' : 'access_denied' }, value.status);
  if (value.code === 'invalid' || value.status === 400) return jsonResponse({ error: 'invalid_request' }, 400);
  return jsonResponse({ error: 'temporarily_unavailable' }, 503);
}

function badRequest(): never { throw { status: 400 }; }

async function body(request: Request, limit: number): Promise<Record<string, unknown>> {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') badRequest();
  const length = request.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > limit)) badRequest();
  const reader = request.body?.getReader();
  if (!reader) badRequest();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const result = await reader.read();
      if (result.done) break;
      size += result.value.length;
      if (size > limit) { await reader.cancel(); badRequest(); }
      chunks.push(result.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const parsed = parseStrictJson(bytes);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) badRequest();
    return parsed as Record<string, unknown>;
  } catch { badRequest(); }
}

export function createHandlers({ auth, store }: { auth: AuthPort; store: SnapshotPort }) {
  function checkRequest(request: Request) {
    if (new URL(request.url).search) badRequest();
    if (request.method !== 'GET' && request.method !== 'HEAD') auth.assertSameOrigin(request);
  }
  return {
    async access(request: Request) {
      try {
        checkRequest(request);
        const input = await body(request, 4096);
        if (Object.keys(input).some(key => !['username', 'password'].includes(key)) ||
            typeof input.password !== 'string' || (input.username !== undefined && typeof input.username !== 'string')) badRequest();
        const session = await auth.login(request, input as { username?: string; password: string });
        return jsonResponse({ ok: true }, 200, { 'Set-Cookie': session.setCookie });
      } catch (error) { return errorResponse(error); }
    },
    async snapshot(request: Request) {
      try {
        checkRequest(request);
        await auth.requireSession(request);
        return jsonResponse(await store.read());
      } catch (error) { return errorResponse(error); }
    },
    async state(request: Request) {
      try {
        checkRequest(request);
        const session = await auth.requireSession(request);
        const input = await body(request, 2 * 1024 * 1024);
        if (Object.keys(input).sort().join(',') !== 'operationId,revision,stores' ||
            !Number.isSafeInteger(input.revision) || (input.revision as number) < 1 ||
            typeof input.operationId !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/.test(input.operationId)) badRequest();
        try { validateStores(input.stores); } catch { badRequest(); }
        // 校验请求期间若已退出/撤权，提交前再次检查服务端会话。
        const current = await auth.requireSession(request);
        if (current.actor !== session.actor) throw { status: 403 };
        return jsonResponse(await store.update(input.revision as number, input.stores as Stores, session.actor, input.operationId));
      } catch (error) { return errorResponse(error); }
    },
    async logout(request: Request) {
      try {
        checkRequest(request);
        const result = await auth.logout(request);
        // 不使用整站 Clear-Site-Data；前端仅清理黑算盘命名空间。
        return jsonResponse(null, 204, { 'Set-Cookie': result.setCookie });
      } catch (error) {
        const response = errorResponse(error);
        if (auth.expiredCookie) response.headers.set('Set-Cookie', auth.expiredCookie());
        return response;
      }
    },
  };
}
