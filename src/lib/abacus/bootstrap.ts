/** 管理员首次复制独立手机账本。只接受本地核验后冻结、由生产配置绑定摘要的业务快照文件。
 * 不读取旧桌面，不接受 Blob 路径，不在构建时执行，也不需要把服务端秘密搬到本机。
 * 完整来源与核验档案只留在本机；SHA 只绑定已核验字节，不能替代会话和用户授权。
 */
import { createAbacusAuth } from './auth';
import { createBlobObjectStore } from './blob-store';
import { errorResponse, jsonResponse, type AuthPort } from './handlers';
import { MAX_SNAPSHOT_BYTES, parseStrictJson, validateSnapshot, type Snapshot } from './schema';
import { LEDGER_HEAD_PATH, SnapshotStore, StoreError, sha256, type PrivateObjectStore } from './store';

export const MAX_INITIALIZATION_BYTES = MAX_SNAPSHOT_BYTES;
export const INITIALIZATION_TARGET = Object.freeze({
  projectId: 'prj_osqPeX2CaxEgxeFyrT0Zh9bnYmde',
  teamId: 'team_XaABuwojEMmxjZSAp4cUMmH0',
  storeId: 'store_p2hDjyLejw1tg0xs',
  origin: 'https://www.spnc.cn',
  namespace: 'abacus/v1/',
});
type Environment = Readonly<Record<string, string | undefined>>;
const HASH = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const encoder = new TextEncoder();
const unavailable = (): never => { throw new StoreError('unavailable'); };
const invalid = (): never => { throw new StoreError('invalid'); };
const forbidden = (): never => { throw { status: 403 }; };
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (record(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  const output = JSON.stringify(value);
  return output === undefined ? invalid() : output;
}
const encode = (value: unknown) => encoder.encode(canonical(value));
const equal = (a: unknown, b: unknown) => canonical(a) === canonical(b);

/** 缺少冻结文件摘要时默认关闭。只允许真实 Production；Preview 和本地不可走运行时入口。 */
export function assertInitializationEnabled(env: Environment): void {
  if (env.VERCEL !== '1' || env.VERCEL_ENV !== 'production'
      || (env.VERCEL_TARGET_ENV && env.VERCEL_TARGET_ENV !== 'production')
      || env.ABACUS_ACCESS_MODE !== 'admin' || env.ABACUS_STORAGE_ENABLED !== 'true'
      || env.ABACUS_PUBLIC_ORIGIN !== INITIALIZATION_TARGET.origin
      || env.ABACUS_INITIALIZATION_SHA256?.length !== 64 || !HASH.test(env.ABACUS_INITIALIZATION_SHA256 || '')
      || env.VERCEL_GIT_COMMIT_SHA?.length !== 40 || !COMMIT.test(env.VERCEL_GIT_COMMIT_SHA || '')
      || (env.VERCEL_PROJECT_ID && env.VERCEL_PROJECT_ID !== INITIALIZATION_TARGET.projectId)
      || (env.VERCEL_TEAM_ID && env.VERCEL_TEAM_ID !== INITIALIZATION_TARGET.teamId)
      || Object.keys(env).some(key => /^(NEXT_PUBLIC_)?VERCEL_BLOB_(API_URL|API_VERSION_OVERRIDE|PROXY_THROUGH_ALTERNATIVE_API)$/.test(key))
      || env.DEBUG?.includes('blob') || env.NEXT_PUBLIC_DEBUG?.includes('blob')) unavailable();
}

/** 保留原始上传字节作摘要；不能先 JSON 重序列化，也不接受 URL、文件路径或远程下载。 */
async function readBody(request: Request): Promise<Uint8Array> {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json'
      || request.headers.has('content-encoding')) invalid();
  const claimed = request.headers.get('content-length');
  if (claimed !== null && (!/^\d+$/.test(claimed) || Number(claimed) > MAX_INITIALIZATION_BYTES)) invalid();
  const reader = request.body?.getReader();
  if (!reader) return invalid();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      length += next.value.byteLength;
      if (length > MAX_INITIALIZATION_BYTES) { await reader.cancel(); invalid(); }
      chunks.push(next.value);
    }
  } finally { reader.releaseLock(); }
  if (!length || (claimed !== null && Number(claimed) !== length)) invalid();
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

function readSnapshot(bytes: Uint8Array): Snapshot {
  try {
    const value = parseStrictJson(bytes, { maxBytes: MAX_SNAPSHOT_BYTES, maxDepth: 34 });
    validateSnapshot(value);
    if (value.revision !== 1 || encode(value).length > MAX_SNAPSHOT_BYTES) invalid();
    return value;
  } catch { return invalid(); }
}

export function createInitializationHandler({ auth, objects, env }: {
  auth: Pick<AuthPort, 'requireSession' | 'assertSameOrigin'>;
  objects: PrivateObjectStore;
  env: Environment;
}) {
  return async (request: Request): Promise<Response> => {
    try {
      assertInitializationEnabled(env);
      if (request.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405, { Allow: 'POST' });
      const url = new URL(request.url);
      if (url.search) invalid();
      if (url.origin !== INITIALIZATION_TARGET.origin || url.username || url.password
          || request.headers.get('origin') !== INITIALIZATION_TARGET.origin
          || (request.headers.has('host') && request.headers.get('host') !== new URL(INITIALIZATION_TARGET.origin).host)
          || request.headers.get('sec-fetch-site') === 'cross-site') forbidden();
      auth.assertSameOrigin(request);
      const session = await auth.requireSession(request);
      if (!/^admin:[a-f0-9]{24}$/.test(session.actor)) forbidden();
      const bytes = await readBody(request);
      const snapshotSha256 = sha256(bytes);
      if (snapshotSha256 !== env.ABACUS_INITIALIZATION_SHA256) invalid();
      const snapshot = readSnapshot(bytes);
      const operationId = `bootstrap-${snapshotSha256}`;
      const receiptPath = `abacus/v1/migrations/${operationId}.json`;
      const receiptBytes = encode({
        format: 'black-abacus-mobile-bootstrap-receipt-v1', operationId, snapshotSha256,
        actor: session.actor, target: INITIALIZATION_TARGET,
        snapshot: { schema: 1, revision: 1, updatedAt: snapshot.updatedAt, sha256: sha256(encode(snapshot)) },
      });
      const receiptSha256 = sha256(receiptBytes);
      const authorizeAgain = async () => {
        const current = await auth.requireSession(request);
        if (current.actor !== session.actor) forbidden();
      };
      // 每次写入前复查撤销状态；初始化不得以 CAS 替换已有 head。
      const guarded: PrivateObjectStore = {
        get: path => objects.get(path),
        create: async (path, data) => { await authorizeAgain(); return objects.create(path, data); },
        compareAndSwap: async () => { throw new StoreError('invalid'); },
      };
      await authorizeAgain();
      const head = await guarded.get(LEDGER_HEAD_PATH);
      const receipt = await guarded.get(receiptPath);
      const matches = (item: Awaited<ReturnType<PrivateObjectStore['get']>>) => item !== null && sha256(item.bytes) === receiptSha256;
      if ((receipt && !matches(receipt)) || (head && !receipt)) throw new StoreError('conflict');
      // 已有账本只能只读确认本次已提交操作，不再允许任何 create/CAS 调用。
      const readOnly: PrivateObjectStore = {
        get: path => guarded.get(path),
        create: async () => { throw new StoreError('conflict'); },
        compareAndSwap: async () => { throw new StoreError('conflict'); },
      };
      if (!receipt) {
        try { await guarded.create(receiptPath, receiptBytes); } catch { /* 写入 ACK 丢失时只通过读回确认。 */ }
      }
      if (!matches(await guarded.get(receiptPath))) unavailable();
      await authorizeAgain();
      const ledger = new SnapshotStore(head ? readOnly : guarded);
      const created = await ledger.create(snapshot, session.actor, operationId);
      if (!equal(created, snapshot)) unavailable();
      const current = await ledger.read();
      if (current.revision < 1 || (current.revision === 1 && !equal(current, snapshot))
          || !matches(await guarded.get(receiptPath))) unavailable();
      await authorizeAgain();
      // 已有后续合法更新时，确认本次操作在已提交链上；不将 head 回滚到首版。
      if (!equal(await ledger.create(snapshot, session.actor, operationId), snapshot)) unavailable();
      return jsonResponse({ status: head ? 'already_initialized' : 'initialized', operationId, snapshotSha256, receiptSha256,
        revision: 1, currentRevision: current.revision });
    } catch (error) { return errorResponse(error); }
  };
}

/** Next POST route 使用此入口；只在收到请求时读取既有秘密，从不返回/记录秘密。 */
export async function initializationRoute(request: Request): Promise<Response> {
  try {
    const env = process.env;
    assertInitializationEnabled(env);
    const token = env.BLOB_READ_WRITE_TOKEN;
    if (typeof token !== 'string' || token !== token.trim() || !/^vercel_blob_rw_[A-Za-z0-9]+_[A-Za-z0-9]+$/.test(token)
        || `store_${token.split('_')[3]}` !== INITIALIZATION_TARGET.storeId) unavailable();
    const objects = createBlobObjectStore();
    const auth = createAbacusAuth({ store: objects, env });
    return createInitializationHandler({ auth, objects, env })(request);
  } catch (error) { return errorResponse(error); }
}
