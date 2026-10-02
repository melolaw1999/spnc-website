import { afterEach, describe, expect, it, vi } from 'vitest';
const sdk = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock('@vercel/blob', () => ({ ...sdk, BlobPreconditionFailedError: class extends Error {} }));
import { services } from '../../../src/lib/abacus/runtime';

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe('运行配置隔离', () => {
  it.each(['preview', 'development', ''])('Vercel %s 不能连用正式账本', environment => {
    vi.stubEnv('VERCEL', '1'); vi.stubEnv('VERCEL_ENV', environment);
    vi.stubEnv('ABACUS_STORAGE_ENABLED', 'true'); vi.stubEnv('ABACUS_ACCESS_MODE', 'admin');
    vi.stubEnv('ABACUS_PUBLIC_ORIGIN', 'https://synthetic.invalid');
    expect(services).toThrow(); expect(sdk.get).not.toHaveBeenCalled(); expect(sdk.put).not.toHaveBeenCalled();
  });
  it('未显式启用时不接触存储', () => {
    vi.stubEnv('VERCEL', '1'); vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('ABACUS_STORAGE_ENABLED', '');
    expect(services).toThrow(); expect(sdk.get).not.toHaveBeenCalled(); expect(sdk.put).not.toHaveBeenCalled();
  });
});
