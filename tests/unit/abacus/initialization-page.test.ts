import { createHash, webcrypto } from 'node:crypto';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { createInitializationPageHandler, INITIALIZATION_HTML, INITIALIZATION_JS } from '../../../src/lib/abacus/initialization-page';

const production = {
  VERCEL: '1', VERCEL_ENV: 'production', ABACUS_ACCESS_MODE: 'admin', ABACUS_STORAGE_ENABLED: 'true',
  ABACUS_PUBLIC_ORIGIN: 'https://www.spnc.cn', ABACUS_INITIALIZATION_SHA256: 'a'.repeat(64), VERCEL_GIT_COMMIT_SHA: 'b'.repeat(40),
};
const request = (asset = 'page', query = '') => new Request('https://synthetic.invalid/abacus/initialize' + (asset === 'script' ? '/client.js' : '') + query);
describe('protected initialization page and script', () => {
  it.each(['page', 'script'] as const)('serves %s only after a current administrator session check with no-store headers', async asset => {
    const requireSession = vi.fn(async () => ({ actor: 'admin:' + '1'.repeat(24), expiresAt: 1 }));
    const handler = createInitializationPageHandler({ env: production, auth: () => ({ requireSession }) });
    const response = await handler(request(asset), asset);
    expect(response.status).toBe(200);
    expect(requireSession).toHaveBeenCalledOnce();
    expect(response.headers.get('cache-control')).toBe('no-store, max-age=0');
    expect(response.headers.get('pragma')).toBe('no-cache');
    expect(response.headers.get('content-security-policy')).toContain("connect-src 'self'");
    expect(response.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
    expect(response.headers.get('content-type')).toContain(asset === 'page' ? 'text/html' : 'text/javascript');
  });
  it.each([
    { ...production, VERCEL_ENV: 'preview' }, { ...production, VERCEL_ENV: 'development' },
    { ...production, VERCEL_ENV: '' }, { ...production, ABACUS_ACCESS_MODE: 'membership-preview' },
    { ...production, ABACUS_STORAGE_ENABLED: 'false' },
    { ...production, ABACUS_INITIALIZATION_SHA256: '' }, { ...production, VERCEL: '' },
  ])('denies other environments/modes before accessing auth or storage', async env => {
    const auth = vi.fn();
    const handler = createInitializationPageHandler({ env, auth });
    expect((await handler(request(), 'page')).status).toBe(503);
    expect(auth).not.toHaveBeenCalled();
  });
  it('redirects only unauthenticated HTML to the real login and gives no script to unauthenticated callers', async () => {
    const auth = () => ({ requireSession: async () => { throw { status: 401 }; } });
    const handler = createInitializationPageHandler({ env: production, auth });
    const page = await handler(request(), 'page');
    expect(page.status).toBe(303);
    expect(page.headers.get('location')).toBe('/abacus/access?next=initialize');
    expect(page.headers.get('cache-control')).toContain('no-store');
    const script = await handler(request('script'), 'script');
    expect(script.status).toBe(401);
    expect(await script.json()).toEqual({ error: 'access_denied' });
  });
  it('rejects a non-administrator actor and never reveals underlying errors', async () => {
    const handler = createInitializationPageHandler({ env: production, auth: () => ({ requireSession: async () => ({ actor: 'membership-preview:synthetic', expiresAt: 1 }) }) });
    expect((await handler(request(), 'page')).status).toBe(403);
    const failure = createInitializationPageHandler({ env: production, auth: () => { throw Error('synthetic-private-store-value'); } });
    const response = await failure(request(), 'page');
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('synthetic-private-store-value');
  });
  it('rejects queries, other paths and methods before asking for a session', async () => {
    const auth = vi.fn();
    const handler = createInitializationPageHandler({ env: production, auth });
    for (const input of [request('page', '?file=untrusted'), request('script'), new Request(request().url, { method: 'POST' })]) {
      expect((await handler(input, 'page')).status).toBe(400);
    }
    expect(auth).not.toHaveBeenCalled();
  });
  it('has no credential fields, business script, inline script or third-party resource', () => {
    expect(INITIALIZATION_HTML).not.toMatch(/type="password"|app\.js|<script[^>]*>\s*[^<\s]|https?:\/\//);
    expect(INITIALIZATION_HTML).toContain('不会自动写回电脑版');
    expect(INITIALIZATION_HTML).toContain('原始浏览器备份须先在本机核验转换');
    expect(INITIALIZATION_JS).not.toMatch(/localStorage|sessionStorage|indexedDB|caches\.|console\.|sendBeacon|createObjectURL|JSON\.stringify|innerHTML/);
    expect(INITIALIZATION_JS).toContain("body:file");
  });
});

type Element = { value: string; textContent: string; disabled: boolean; hidden: boolean; checked: boolean; files: Blob[]; addEventListener: (event: string, callback: () => unknown) => void };
type SyntheticResponse = { status: number; ok: boolean; json: () => Promise<unknown> };
function clientHarness(response?: (body: Blob) => Promise<SyntheticResponse>) {
  const nodes = new Map<string, Element>(), listeners = new Map<string, () => unknown>();
  const windows = new Map<string, (event?: { persisted?: boolean }) => unknown>();
  const requests: { url: string; options: RequestInit }[] = [], navigations: string[] = [];
  const node = (id: string): Element => {
    if (!nodes.has(id)) nodes.set(id, { value: '', textContent: '', disabled: false, hidden: true, checked: false, files: [],
      addEventListener: (event, callback) => { listeners.set(id + ':' + event, callback); } });
    return nodes.get(id)!;
  };
  const context = vm.createContext({ document: { getElementById: node }, Uint8Array, crypto: webcrypto, AbortController,
    location: { replace: (url: string) => { navigations.push(url); } },
    addEventListener: (event: string, callback: (event?: { persisted?: boolean }) => unknown) => { windows.set(event, callback); },
    setTimeout: () => 1, clearTimeout: () => {},
    fetch: async (url: string, options: RequestInit) => {
      requests.push({ url, options });
      if (!response) throw Error('synthetic-network-unavailable');
      return response(options.body as Blob);
    },
  });
  context.window = context;
  vm.runInContext(INITIALIZATION_JS, context);
  return { node, requests, navigations,
    async select(file: Blob) { node('bundle').files = [file]; await listeners.get('bundle:change')!(); },
    async confirm() { node('confirmed').checked = true; await listeners.get('confirmed:change')!(); },
    async upload() { await listeners.get('upload:click')!(); },
    async clear() { await listeners.get('clear:click')!(); },
    async pagehide() { await windows.get('pagehide')!(); },
    async restore() { await windows.get('pageshow')!({ persisted: true }); },
  };
}
const synthetic = new Blob(['{\n  "schema": 1, "synthetic": "not-a-real-ledger"\n}\n'], { type: 'application/json' });
const sha = async (blob: Blob) => createHash('sha256').update(new Uint8Array(await blob.arrayBuffer())).digest('hex');
const successful = async (blob: Blob, status = 'initialized') => {
  const digest = await sha(blob);
  return { status, snapshotSha256: digest, operationId: 'bootstrap-' + digest, receiptSha256: 'a'.repeat(64), revision: 1, currentRevision: status === 'already_initialized' ? 3 : 1 };
};
describe('initialization client with synthetic in-memory files only', () => {
  it('never sends data until both a digest and explicit confirmation exist', async () => {
    const h = clientHarness();
    await h.upload(); expect(h.requests).toHaveLength(0);
    await h.select(synthetic); await h.upload(); expect(h.requests).toHaveLength(0);
    expect(h.node('fingerprint').textContent).toContain(await sha(synthetic));
    expect(h.node('fingerprint').textContent).not.toContain('not-a-real-ledger');
    expect(h.node('upload').disabled).toBe(true);
    await h.confirm(); expect(h.node('upload').disabled).toBe(false);
  });
  it.each(['initialized', 'already_initialized'])('sends exact file bytes and releases them only after a matching %s receipt', async status => {
    const h = clientHarness(async body => ({ status: 200, ok: true, json: async () => successful(body, status) }));
    await h.select(synthetic); await h.confirm(); await h.upload();
    expect(h.requests).toHaveLength(1);
    const { url, options } = h.requests[0];
    expect(url).toBe('/api/abacus/initialize');
    expect(options).toMatchObject({ method: 'POST', cache: 'no-store', redirect: 'error', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' } });
    expect(options.body).toBe(synthetic);
    expect(h.node('status').textContent).toContain('服务端读回核验');
    expect(h.node('receipt').textContent).toContain(await sha(synthetic));
    expect(h.node('receipt').textContent).not.toContain('not-a-real-ledger');
    expect(h.node('complete').hidden).toBe(false);
    expect(h.node('upload').disabled).toBe(true);
    await h.upload(); expect(h.requests).toHaveLength(1);
  });
  it('treats network failures and 503 as unknown outcomes and retries the same immutable File only on a click', async () => {
    for (const response of [undefined, async () => ({ status: 503, ok: false, json: async () => ({ error: 'temporarily_unavailable' }) })]) {
      const h = clientHarness(response);
      await h.select(synthetic); await h.confirm(); await h.upload();
      expect(h.requests).toHaveLength(1);
      expect(h.node('status').textContent).toMatch(/待核验|无法确认/);
      expect(h.node('complete').hidden).toBe(true);
      expect(h.node('upload').disabled).toBe(false);
      await h.upload(); expect(h.requests).toHaveLength(2);
      expect(h.requests[0].options.body).toBe(h.requests[1].options.body);
    }
  });
  it('rejects mismatched digests and malformed success receipts without claiming success or clearing retry data', async () => {
    for (const overrides of [
      { snapshotSha256: 'b'.repeat(64) }, { operationId: 'bootstrap-unrelated' }, { receiptSha256: 'private-value' },
      { revision: 2 }, { currentRevision: 0 }, { status: 'unknown' },
    ]) {
      const h = clientHarness(async body => ({ status: 200, ok: true, json: async () => ({ ...await successful(body), ...overrides }) }));
      await h.select(synthetic); await h.confirm(); await h.upload();
      expect(h.node('status').textContent).toContain('核验凭据不匹配');
      expect(h.node('complete').hidden).toBe(true);
      expect(h.node('upload').disabled).toBe(false);
      expect(h.node('receipt').textContent).toBe('');
    }
  });
  it.each([401, 403])('releases the file and uses the normal login path when authorization fails (%i)', async status => {
    const h = clientHarness(async () => ({ status, ok: false, json: async () => ({ error: 'access_denied' }) }));
    await h.select(synthetic); await h.confirm(); await h.upload();
    expect(h.navigations).toEqual(['/abacus/access?next=initialize']);
    expect(h.node('upload').disabled).toBe(true);
    expect(h.node('fingerprint').textContent).toBe('');
    await h.upload(); expect(h.requests).toHaveLength(1);
  });
  it('gives a conflict stop message without displaying server data or performing any automatic retry', async () => {
    const h = clientHarness(async () => ({ status: 409, ok: false, json: async () => ({ error: 'synthetic-sensitive-error' }) }));
    await h.select(synthetic); await h.confirm(); await h.upload();
    expect(h.node('status').textContent).toContain('停止导入');
    expect(h.node('status').textContent).not.toContain('synthetic-sensitive-error');
    expect(h.requests).toHaveLength(1);
  });
  it('rejects empty and oversized files before upload', async () => {
    const h = clientHarness();
    for (const file of [new Blob([]), new Blob([new Uint8Array(2 * 1024 * 1024 + 1)])]) {
      await h.select(file); await h.confirm(); await h.upload();
      expect(h.requests).toHaveLength(0);
      expect(h.node('status').textContent).toContain('文件大小');
    }
  });
  it('clears the file and any receipt on clear, pagehide and restored pages', async () => {
    const h = clientHarness();
    for (const reset of [h.clear, h.pagehide, h.restore]) {
      await h.select(synthetic); await h.confirm(); await reset(); await h.upload();
      expect(h.requests).toHaveLength(0);
      expect(h.node('fingerprint').textContent).toBe('');
      expect(h.node('receipt').textContent).toBe('');
      expect(h.node('upload').disabled).toBe(true);
    }
  });
  it('prevents double clicks from posting a second request while the first is in flight', async () => {
    let resolve!: (response: SyntheticResponse) => void;
    const h = clientHarness(() => new Promise(result => { resolve = result; }));
    await h.select(synthetic); await h.confirm();
    const first = h.upload(); await h.upload();
    expect(h.requests).toHaveLength(1);
    expect(h.node('bundle').disabled).toBe(true);
    resolve({ status: 503, ok: false, json: async () => ({}) });
    await first;
    expect(h.node('bundle').disabled).toBe(false);
  });
});
