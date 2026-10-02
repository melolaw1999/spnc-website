import { get, put, BlobPreconditionFailedError, type GetBlobResult, type PutBlobResult } from "@vercel/blob";
import {
  MAX_PRIVATE_OBJECT_BYTES,
  StoreError,
  validatePrivatePath,
  type PrivateObjectStore,
} from "./store";

// Injectable only for synthetic tests. The production implementation is the
// installed SDK; this module never contacts it during import/construction.
export interface PrivateBlobClient {
  get: typeof get;
  put: typeof put;
}

const sdk: PrivateBlobClient = { get, put };

function checkEtag(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 512 || /[\r\n\0]/.test(value)) {
    throw new StoreError("unavailable");
  }
  return value;
}

async function readBounded(result: Extract<GetBlobResult, { statusCode: 200 }>): Promise<Uint8Array> {
  if (result.blob.size > MAX_PRIVATE_OBJECT_BYTES) throw new StoreError("invalid");
  const reader = result.stream.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      length += next.value.byteLength;
      if (length > MAX_PRIVATE_OBJECT_BYTES) {
        await reader.cancel();
        throw new StoreError("invalid");
      }
      chunks.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export class BlobObjectStore implements PrivateObjectStore {
  constructor(private readonly options: { token?: string; client?: PrivateBlobClient; timeoutMs?: number } = {}) {}

  private token(): string {
    const token = this.options.token ?? process.env.BLOB_READ_WRITE_TOKEN;
    if (!token || !token.trim()) throw new StoreError("unavailable");
    return token;
  }

  private signal(): AbortSignal {
    return AbortSignal.timeout(this.options.timeoutMs ?? 15_000);
  }

  async get(path: string): Promise<{ bytes: Uint8Array; etag: string } | null> {
    validatePrivatePath(path);
    const token = this.token();
    try {
      const result = await (this.options.client ?? sdk).get(path, {
        access: "private", useCache: false, token, abortSignal: this.signal(),
      });
      if (!result) return null;
      if (result.statusCode !== 200) throw new StoreError("unavailable");
      return { bytes: await readBounded(result), etag: checkEtag(result.blob.etag) };
    } catch (error) {
      if (error instanceof StoreError) throw error;
      throw new StoreError("unavailable");
    }
  }

  private async write(path: string, bytes: Uint8Array, etag?: string): Promise<string> {
    validatePrivatePath(path);
    if (!(bytes instanceof Uint8Array) || bytes.byteLength > MAX_PRIVATE_OBJECT_BYTES) throw new StoreError("invalid");
    const token = this.token();
    if (etag !== undefined) checkEtag(etag);
    try {
      const result: PutBlobResult = await (this.options.client ?? sdk).put(path, Buffer.from(bytes), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: etag !== undefined,
        ...(etag !== undefined ? { ifMatch: etag } : {}),
        contentType: "application/json; charset=utf-8",
        cacheControlMaxAge: 60,
        token,
        abortSignal: this.signal(),
      });
      return checkEtag(result.etag);
    } catch (error) {
      if (error instanceof StoreError) throw error;
      if (error instanceof BlobPreconditionFailedError) throw new StoreError("conflict");
      if (etag === undefined) {
        // This SDK has no exported AlreadyExists class. A current read proves
        // that create-if-absent cannot proceed, regardless of its error text.
        const existing = await this.get(path);
        if (existing) throw new StoreError("conflict");
      }
      throw new StoreError("unavailable");
    }
  }

  create(path: string, bytes: Uint8Array): Promise<string> {
    return this.write(path, bytes);
  }

  compareAndSwap(path: string, bytes: Uint8Array, etag: string): Promise<string> {
    checkEtag(etag);
    return this.write(path, bytes, etag);
  }
}

export const createBlobObjectStore = (options: ConstructorParameters<typeof BlobObjectStore>[0] = {}): PrivateObjectStore => new BlobObjectStore(options);
