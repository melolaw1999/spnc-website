import { describe, expect, it } from 'vitest';
import { createHandlers, type AuthPort, type SnapshotPort } from '../../../src/lib/abacus/handlers';
import type { Snapshot } from '../../../src/lib/abacus/schema';

const origin = 'https://synthetic.invalid';
const snapshot = { schema: 1, revision: 1, updatedAt: '2026-10-02T00:00:00Z', data: {
  products: [{ id: 'demo', name: 'Synthetic', group: 'demo', costType: 'rmb', cost: 1, price: 2, shipping: 0, tax: 0, platform: 0 }],
  sfRates: [{ name: 'A', rates: [1, 2, 3, 4, 5] }, { name: 'B', rates: [1, 2, 3, 4, 5] }],
  defaultPlans: {}, fifoReference: {}, procurement: { orders: [] }, stores: {
    'black-abacus-sku-plans-v1': {}, 'black-abacus-sku-archives-v1': {}, 'black-abacus-fifo-v1': {},
  },
} } as Snapshot;

function setup() {
  const calls = { read: 0, write: 0, auth: 0, logout: 0 };
  const auth: AuthPort = {
    assertSameOrigin(request) {
      if (new URL(request.url).origin !== origin ||
          (request.headers.has('origin') && request.headers.get('origin') !== origin) ||
          (request.method !== 'GET' && request.headers.get('origin') !== origin)) throw { status: 403 };
    },
    async requireSession(request) {
      calls.auth++;
      if (request.headers.get('cookie') !== 'synthetic=valid') throw { status: 401 };
      return { actor: 'synthetic-owner', expiresAt: 9999999999999 };
    },
    async login(_request, input) {
      if (input.password !== 'synthetic-only') throw { status: 401 };
      return { actor: 'synthetic-owner', expiresAt: 9999999999999, setCookie: 'synthetic=valid; HttpOnly; Secure' };
    },
    async logout(request) {
      await this.requireSession(request); calls.logout++;
      return { setCookie: 'synthetic=; Max-Age=0; HttpOnly; Secure' };
    },
  };
  const store: SnapshotPort = {
    async read() { calls.read++; return snapshot; },
    async update(revision, stores) {
      calls.write++;
      if (revision !== 1) throw { code: 'conflict', revision: 2 };
      return { ...snapshot, revision: 2, data: { ...snapshot.data, stores } };
    },
  };
  return { calls, auth, store, handlers: createHandlers({ auth, store }) };
}

function request(action: string, method = 'GET', body?: unknown, headers: Record<string, string> = {}) {
  return new Request(origin + '/api/abacus/' + action, { method,
    headers: { ...(method !== 'GET' ? { origin, 'content-type': 'application/json' } : {}), ...headers },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}
const authorized = { cookie: 'synthetic=valid' };
const write = { revision: 1, operationId: 'synthetic-operation-1', stores: snapshot.data.stores };

describe('官网黑算盘 API 全路径保护', () => {
  it('匿名读取和写入不会接触账本', async () => {
    const { handlers, calls } = setup();
    expect((await handlers.snapshot(request('snapshot'))).status).toBe(401);
    expect((await handlers.state(request('state', 'PUT', write))).status).toBe(401);
    expect(calls.read).toBe(0); expect(calls.write).toBe(0);
  });
  it('共享预览cookie不是黑算盘授权', async () => {
    const { handlers, calls } = setup();
    expect((await handlers.snapshot(request('snapshot', 'GET', undefined, { cookie: 'spnc_membership_preview=anything' }))).status).toBe(401);
    expect(calls.read).toBe(0);
  });
  it('已授权快照不进入HTTP缓存且无跨域开放', async () => {
    const { handlers } = setup();
    const response = await handlers.snapshot(request('snapshot', 'GET', undefined, authorized));
    expect(response.status).toBe(200); expect(await response.json()).toEqual(snapshot);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.has('access-control-allow-origin')).toBe(false);
  });
  it('跨站、无Origin写入、查询参数均被拒绝', async () => {
    const { handlers, calls } = setup();
    expect((await handlers.state(request('state', 'PUT', write, { ...authorized, origin: 'https://other.invalid' }))).status).toBe(403);
    const missing = request('state', 'PUT', write, authorized); missing.headers.delete('origin');
    expect((await handlers.state(missing)).status).toBe(403);
    expect((await handlers.snapshot(request('snapshot?download=1', 'GET', undefined, authorized))).status).toBe(400);
    expect(calls.write).toBe(0); expect(calls.read).toBe(0);
  });
  it('写入必须完整3store、revision和单次operationId', async () => {
    const { handlers, calls } = setup();
    for (const invalid of [{ ...write, stores: {} }, { ...write, revision: true },
      { ...write, operationId: '' }, { revision: 1, stores: write.stores }, { ...write, data: snapshot.data }]) {
      expect((await handlers.state(request('state', 'PUT', invalid, authorized))).status).toBe(400);
    }
    expect(calls.write).toBe(0);
  });
  it('重复JSON键和非JSON/超大请求被拒绝', async () => {
    const { handlers, calls } = setup();
    expect((await handlers.state(request('state', 'PUT', '{"revision":1,"revision":2}', authorized))).status).toBe(400);
    expect((await handlers.state(request('state', 'PUT', write, { ...authorized, 'content-type': 'text/plain' }))).status).toBe(400);
    expect((await handlers.state(request('state', 'PUT', write, { ...authorized, 'content-length': '2097153' }))).status).toBe(400);
    expect(calls.write).toBe(0);
  });
  it('保存返回完整确认快照，旧版本得到409', async () => {
    const { handlers } = setup();
    const ok = await handlers.state(request('state', 'PUT', write, authorized));
    expect(ok.status).toBe(200); expect((await ok.json()).revision).toBe(2);
    const conflict = await handlers.state(request('state', 'PUT', { ...write, revision: 2 }, authorized));
    expect(conflict.status).toBe(409); expect(await conflict.json()).toEqual({ error: 'revision_conflict', revision: 2 });
  });
  it('服务异常返回失败，不读取客户端或演示快照兜底', async () => {
    const { auth, store } = setup();
    store.read = async () => { throw new Error('private-storage-url-and-value'); };
    const response = await createHandlers({ auth, store }).snapshot(request('snapshot', 'GET', undefined, authorized));
    expect(response.status).toBe(503); expect(await response.text()).not.toContain('private-storage');
  });
  it('登录校验通过才签发Cookie且响应不回显口令', async () => {
    const { handlers } = setup();
    expect((await handlers.access(request('access', 'POST', { password: 'wrong' }))).status).toBe(401);
    const response = await handlers.access(request('access', 'POST', { password: 'synthetic-only' }));
    expect(response.status).toBe(200); expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(await response.text()).toBe('{"ok":true}');
  });
  it('注销撤销会话并仅删除本应用Cookie，不清官网全站存储', async () => {
    const { handlers, calls } = setup();
    const response = await handlers.logout(request('logout', 'POST', undefined, authorized));
    expect(response.status).toBe(204); expect(calls.logout).toBe(1);
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
    expect(response.headers.has('clear-site-data')).toBe(false);
  });
});
