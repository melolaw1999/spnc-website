import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitializationHandler, initializationRoute, INITIALIZATION_TARGET, MAX_INITIALIZATION_BYTES } from '../../../src/lib/abacus/bootstrap';
import { createAbacusAuth } from '../../../src/lib/abacus/auth';
import { createHandlers } from '../../../src/lib/abacus/handlers';
import { LEDGER_HEAD_PATH, SnapshotStore, StoreError, sha256, type PrivateObjectStore } from '../../../src/lib/abacus/store';
import type { Snapshot } from '../../../src/lib/abacus/schema';

const encoder = new TextEncoder();
const actor = 'admin:' + 'a'.repeat(24);
const origin = INITIALIZATION_TARGET.origin;
const secretMarker = 'SYNTHETIC-PRIVATE-NEVER-RESPOND';
function snapshot(): Snapshot {
  return { schema: 1, revision: 1, updatedAt: '2026-10-02T00:00:00.000Z', data: {
    products: [{ id: 'synthetic', name: secretMarker, group: 'test', costType: 'unit', cost: 3, price: 5, shipping: 1, tax: 0, platform: 0 }],
    sfRates: [{ name: 'A', rates: [1, 2, 3, 4, 5] }, { name: 'B', rates: [1, 2, 3, 4, 5] }],
    defaultPlans: {}, fifoReference: {}, procurement: { orders: [], excluded: [] },
    stores: { 'black-abacus-sku-plans-v1': {}, 'black-abacus-sku-archives-v1': {}, 'black-abacus-fifo-v1': {} },
  } };
}
class Memory implements PrivateObjectStore {
  items = new Map<string, { bytes: Uint8Array; etag: string }>();
  calls: string[] = []; writes = 0;
  lose: 'receipt' | 'version' | 'head' | null = null;
  failReceipt = false; failReadReceipt = false; failHeadOnce = false;
  async get(path: string) {
    this.calls.push('get:' + path);
    if (this.failReadReceipt && path.includes('/migrations/') && this.items.has(path)) throw new StoreError('unavailable');
    const value = this.items.get(path);
    return value ? { bytes: value.bytes.slice(), etag: value.etag } : null;
  }
  async create(path: string, bytes: Uint8Array) {
    this.calls.push('create:' + path);
    if (this.items.has(path)) throw new StoreError('conflict');
    if (this.failReceipt && path.includes('/migrations/')) throw new StoreError('unavailable');
    if (this.failHeadOnce && path === LEDGER_HEAD_PATH) { this.failHeadOnce = false; throw new StoreError('unavailable'); }
    const etag = `synthetic-${++this.writes}`;
    this.items.set(path, { bytes: bytes.slice(), etag });
    const stage = path.includes('/migrations/') ? 'receipt' : path === LEDGER_HEAD_PATH ? 'head' : 'version';
    if (this.lose === stage) { this.lose = null; throw new StoreError('unavailable'); }
    return etag;
  }
  async compareAndSwap(path: string, bytes: Uint8Array, etag: string) {
    this.calls.push('cas:' + path);
    if (this.items.get(path)?.etag !== etag) throw new StoreError('conflict');
    const next = `synthetic-${++this.writes}`; this.items.set(path, { bytes: bytes.slice(), etag: next }); return next;
  }
}
let objects: Memory, payload: string, env: Record<string, string | undefined>;
let auth: { requireSession: ReturnType<typeof vi.fn>; assertSameOrigin: ReturnType<typeof vi.fn> };
function request(text = payload, options: { method?: string; url?: string; headers?: Record<string, string | undefined> } = {}) {
  const method = options.method || 'POST';
  const headers = new Headers({ origin, host: new URL(origin).host, 'content-type': 'application/json' });
  for (const [key, value] of Object.entries(options.headers || {})) if (value !== undefined) headers.set(key, value);
  return new Request(options.url || `${origin}/api/abacus/initialize`, {
    method, headers,
    ...(['GET', 'HEAD'].includes(method) ? {} : { body: text }),
  });
}
const handler = () => createInitializationHandler({ auth, objects, env });
const bind = (text: string) => { payload = text; env.ABACUS_INITIALIZATION_SHA256 = sha256(encoder.encode(text)); };
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Network forbidden in synthetic tests'); }));
  objects = new Memory(); payload = JSON.stringify(snapshot());
  env = { VERCEL: '1', VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_SHA: 'b'.repeat(40),
    ABACUS_ACCESS_MODE: 'admin', ABACUS_STORAGE_ENABLED: 'true', ABACUS_PUBLIC_ORIGIN: origin,
    ABACUS_INITIALIZATION_SHA256: sha256(encoder.encode(payload)) };
  auth = { requireSession: vi.fn(async () => ({ actor, expiresAt: Date.now() + 60_000 })), assertSameOrigin: vi.fn() };
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('首次复制只接受明确启用的已核验原始快照字节', () => {
  it.each([
    ['VERCEL', undefined], ['VERCEL_ENV', 'preview'], ['VERCEL_TARGET_ENV', 'staging'],
    ['ABACUS_ACCESS_MODE', 'membership-preview'], ['ABACUS_STORAGE_ENABLED', 'false'],
    ['ABACUS_PUBLIC_ORIGIN', 'https://example.test'], ['ABACUS_INITIALIZATION_SHA256', undefined],
    ['ABACUS_INITIALIZATION_SHA256', 'bad'], ['VERCEL_GIT_COMMIT_SHA', undefined],
    ['VERCEL_PROJECT_ID', 'other'], ['VERCEL_TEAM_ID', 'other'], ['VERCEL_BLOB_API_URL', ''],
    ['NEXT_PUBLIC_VERCEL_BLOB_API_VERSION_OVERRIDE', '1'], ['DEBUG', 'blob:*'],
  ])('配置 %s=%s 时，在会话或存储读取前关闭', async (key, value) => {
    env[key!] = value;
    const response = await handler()(request());
    expect(response.status).toBe(503); expect(objects.calls).toEqual([]); expect(auth.requireSession).not.toHaveBeenCalled();
  });
  it('默认运行时关闭且不接触网络', async () => {
    vi.stubEnv('ABACUS_INITIALIZATION_SHA256', '');
    expect((await initializationRoute(request())).status).toBe(503); expect(fetch).not.toHaveBeenCalled();
  });
  it.each([
    { method: 'GET' }, { url: `${origin}/api/abacus/initialize?path=other` },
    { headers: { origin: '' } }, { headers: { origin: 'https://evil.test' } },
    { url: 'https://evil.test/api/abacus/initialize' }, { headers: { host: 'evil.test' } },
    { headers: { 'sec-fetch-site': 'cross-site' } },
  ])('拒绝非 POST、查询参数及 CSRF 来源 %j', async options => {
    const response = await handler()(request(payload, options));
    expect([400, 403, 405]).toContain(response.status); expect(objects.calls).toEqual([]);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('独立管理员会话必需；先于正文和账本访问校验', async () => {
    auth.requireSession.mockRejectedValue({ status: 401 });
    expect((await handler()(request('invalid'))).status).toBe(401); expect(objects.calls).toEqual([]);
    auth.requireSession.mockResolvedValue({ actor: 'membership-preview:' + 'a'.repeat(24) });
    expect((await handler()(request())).status).toBe(403); expect(objects.calls).toEqual([]);
  });
  it.each([
    { 'content-type': 'text/plain' }, { 'content-encoding': 'gzip' },
    { 'content-length': String(MAX_INITIALIZATION_BYTES + 1) }, { 'content-length': '1' },
  ])('拒绝正文类型、压缩或大小不符 %j', async headers => {
    expect((await handler()(request(payload, { headers }))).status).toBe(400); expect(objects.calls).toEqual([]);
  });
  it('流式正文超限且没有 Content-Length 也拒绝', async () => {
    expect((await handler()(request(' '.repeat(MAX_INITIALIZATION_BYTES + 1)))).status).toBe(400);
    expect(objects.calls).toEqual([]);
  });
  it('相同数据不同空格也不符合冻结原字节摘要', async () => {
    expect((await handler()(request(payload + '\n'))).status).toBe(400); expect(objects.calls).toEqual([]);
  });
  it.each([
    '{}', '{"schema":1,"schema":1}', '{"__proto__":{}}',
    JSON.stringify({ ...snapshot(), revision: 2 }),
    JSON.stringify({ ...snapshot(), path: 'other/head.json' }),
    JSON.stringify({ format: 'wrapper', snapshot: snapshot() }),
    JSON.stringify({ ...snapshot(), data: { ...snapshot().data, procurement: [] } }),
  ])('即使摘要匹配也拒绝非法快照 %#', async text => {
    bind(text); expect((await handler()(request())).status).toBe(400); expect(objects.calls).toEqual([]);
  });
});

describe('不可覆盖首次创建、读回及失败恢复', () => {
  it('回执先写并读回，再创建版本/head，原始 payload hash 在回执中，响应无业务值', async () => {
    const response = await handler()(request()), body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ status: 'initialized', snapshotSha256: env.ABACUS_INITIALIZATION_SHA256,
      operationId: `bootstrap-${env.ABACUS_INITIALIZATION_SHA256}`, revision: 1, currentRevision: 1 });
    expect(JSON.stringify(body)).not.toContain(secretMarker);
    const writes = objects.calls.filter(call => call.startsWith('create:'));
    expect(writes).toHaveLength(3); expect(writes[0]).toContain('/migrations/'); expect(writes[2]).toBe('create:' + LEDGER_HEAD_PATH);
    expect(objects.calls.indexOf('get:' + writes[0].slice(7), objects.calls.indexOf(writes[0]))).toBeLessThan(objects.calls.indexOf(writes[1]));
    const receipt = JSON.parse(new TextDecoder().decode(objects.items.get(writes[0].slice(7))!.bytes));
    expect(receipt).toMatchObject({ actor, snapshotSha256: env.ABACUS_INITIALIZATION_SHA256 });
    expect(JSON.stringify(receipt)).not.toContain(secretMarker);
    expect(await new SnapshotStore(objects).read()).toEqual(snapshot());
    expect(response.headers.get('cache-control')).toContain('no-store'); expect(fetch).not.toHaveBeenCalled();
  });
  it('完全相同的已成功请求只读确认，不再执行 create 或 CAS', async () => {
    await handler()(request()); objects.calls = [];
    const result = await (await handler()(request())).json();
    expect(result.status).toBe('already_initialized');
    expect(objects.calls.every(call => call.startsWith('get:'))).toBe(true); expect(objects.writes).toBe(3);
  });
  it('部署 SHA 变化后，同一已核验包仍只读确认，回执保持原字节', async () => {
    await handler()(request()); objects.calls = [];
    env.VERCEL_GIT_COMMIT_SHA = 'c'.repeat(40);
    const result = await (await handler()(request())).json();
    expect(result.status).toBe('already_initialized');
    expect(objects.calls.every(call => call.startsWith('get:'))).toBe(true); expect(objects.writes).toBe(3);
  });
  it('已有其他非空账本时拒绝，不创建新回执且不覆盖', async () => {
    await new SnapshotStore(objects).create(snapshot(), actor, 'other-operation'); const count = objects.writes;
    expect((await handler()(request())).status).toBe(409); expect(objects.writes).toBe(count);
  });
  it('已有冲突回执时拒绝，保留原字节', async () => {
    const path = `abacus/v1/migrations/bootstrap-${env.ABACUS_INITIALIZATION_SHA256}.json`;
    await objects.create(path, encoder.encode('{}'));
    expect((await handler()(request())).status).toBe(409); expect(objects.writes).toBe(1);
    expect(objects.items.has(LEDGER_HEAD_PATH)).toBe(false);
  });
  it.each(['failReceipt', 'failReadReceipt'] as const)('不能确认回执时不能创建 head：%s', async fault => {
    objects[fault] = true;
    expect((await handler()(request())).status).toBe(503); expect(objects.items.has(LEDGER_HEAD_PATH)).toBe(false);
    expect([...objects.items.keys()].some(path => path.includes('/versions/'))).toBe(false);
  });
  it.each(['receipt', 'version', 'head'] as const)('通过读回恢复 %s 的 ACK 丢失', async stage => {
    objects.lose = stage;
    expect((await handler()(request())).status).toBe(200); expect(objects.writes).toBe(3);
  });
  it('head 写入前失败保留不可变对象；仅同字节重试完成且不重复写', async () => {
    objects.failHeadOnce = true;
    expect((await handler()(request())).status).toBe(503); expect(objects.writes).toBe(2);
    expect((await handler()(request())).status).toBe(200); expect(objects.writes).toBe(3);
    expect((await (await handler()(request())).json()).status).toBe('already_initialized'); expect(objects.writes).toBe(3);
  });
  it('相同包并发重试只生成一套对象', async () => {
    const responses = await Promise.all([handler()(request()), handler()(request())]);
    expect(responses.map(response => response.status)).toEqual([200, 200]); expect(objects.writes).toBe(3);
    expect(objects.calls.some(call => call.startsWith('cas:'))).toBe(false);
  });
  it('不同冻结包并发只能有一个建立 head，互不覆盖', async () => {
    const other = JSON.stringify({ ...snapshot(), updatedAt: '2026-10-03T00:00:00.000Z' });
    const second = createInitializationHandler({ objects, auth, env: { ...env, ABACUS_INITIALIZATION_SHA256: sha256(encoder.encode(other)) } });
    const responses = await Promise.all([handler()(request()), second(request(other))]);
    expect(responses.map(response => response.status).sort()).toEqual([200, 409]);
    expect(objects.calls.some(call => call.startsWith('cas:'))).toBe(false);
  });
  it('后续手机版修改不回滚；同包确认只读返回当前 revision', async () => {
    await handler()(request()); const ledger = new SnapshotStore(objects), stores = snapshot().data.stores;
    stores['black-abacus-sku-plans-v1'].synthetic = { note: 'later' };
    await ledger.update(1, stores, actor, 'later-operation'); objects.calls = [];
    const body = await (await handler()(request())).json();
    expect(body).toMatchObject({ status: 'already_initialized', revision: 1, currentRevision: 2 });
    expect(objects.calls.every(call => call.startsWith('get:'))).toBe(true);
    expect((await ledger.read()).data.stores).toEqual(stores);
  });
  it('读取正文后撤销会话，在任何业务写入前拒绝', async () => {
    auth.requireSession.mockResolvedValueOnce({ actor }).mockRejectedValue({ status: 401 });
    expect((await handler()(request())).status).toBe(401); expect(objects.writes).toBe(0);
  });
  it('回执之后撤销会话，也不建立 head', async () => {
    auth.requireSession.mockImplementation(async () => {
      if (objects.writes) throw { status: 401 };
      return { actor };
    });
    expect((await handler()(request())).status).toBe(401); expect(objects.writes).toBe(1);
    expect(objects.items.has(LEDGER_HEAD_PATH)).toBe(false);
  });
  it('版本写入后、head 提交前撤销会话保留两对象；恢复有效会话后同包完成', async () => {
    auth.requireSession.mockImplementation(async () => {
      if (objects.writes >= 2) throw { status: 401 };
      return { actor };
    });
    expect((await handler()(request())).status).toBe(503); expect(objects.writes).toBe(2);
    expect(objects.items.has(LEDGER_HEAD_PATH)).toBe(false);
    auth.requireSession.mockResolvedValue({ actor });
    expect((await handler()(request())).status).toBe(200); expect(objects.writes).toBe(3);
  });
  it('真实管理员会话接口拒绝其他网站会话，普通 state 接口不能初始化', async () => {
    const realAuth = createAbacusAuth({ store: objects, env: { ...env, ADMIN_USERNAME: 'synthetic-admin', ADMIN_PASSWORD: 'synthetic-password' } });
    const endpoint = createInitializationHandler({ objects, auth: realAuth, env });
    expect((await endpoint(request(payload, { headers: { cookie: 'membership=synthetic' } }))).status).toBe(401);
    expect(objects.writes).toBe(0);
    const state = createHandlers({ auth: { ...auth, login: vi.fn(), logout: vi.fn() }, store: new SnapshotStore(objects) });
    const body = JSON.stringify({ revision: 1, operationId: 'synthetic-operation-001', stores: snapshot().data.stores });
    expect((await state.state(request(body))).status).toBe(503); expect(objects.writes).toBe(0);
  });
});
