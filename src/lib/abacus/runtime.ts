import { createAbacusAuth } from './auth';
import { createBlobObjectStore } from './blob-store';
import { createHandlers, errorResponse } from './handlers';
import { SnapshotStore } from './store';

// 仅由实际请求触发。构建和测试不连接私有存储，也不创建初始账本。
export function services() {
  // 现有私有store同时连接Production/Preview。此账本命名空间只供正式部署，
  // 防止预览分支意外使用正式账本；本地合成测试直接注入内存store，不走这里。
  if ((process.env.VERCEL || process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== 'production') throw { code: 'unavailable' };
  if (process.env.ABACUS_STORAGE_ENABLED !== 'true' ||
      !['admin', 'membership-preview'].includes(process.env.ABACUS_ACCESS_MODE || '') ||
      !process.env.ABACUS_PUBLIC_ORIGIN) throw { code: 'unavailable' };
  const objects = createBlobObjectStore();
  const auth = createAbacusAuth({ store: objects, env: process.env });
  const store = new SnapshotStore(objects);
  return { auth, store, handlers: createHandlers({ auth, store }) };
}

export async function apiRoute(action: 'access' | 'snapshot' | 'state' | 'logout', request: Request) {
  try { return await services().handlers[action](request); }
  catch (error) { return errorResponse(error); }
}
