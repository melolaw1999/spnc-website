import { afterEach, describe, expect, it, vi } from "vitest";
import { BlobPreconditionFailedError, type GetBlobResult, type PutBlobResult } from "@vercel/blob";
import { BlobObjectStore, type PrivateBlobClient } from "../../../src/lib/abacus/blob-store";
import {
  LEDGER_HEAD_PATH, MAX_PRIVATE_OBJECT_BYTES, SnapshotStore, StoreError,
  type PrivateObjectStore,
} from "../../../src/lib/abacus/store";
import { MAX_SNAPSHOT_BYTES, type Snapshot, type Stores } from "../../../src/lib/abacus/schema";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** Synthetic only: atomic operations synchronously mutate a map before await. */
class MemoryObjectStore implements PrivateObjectStore {
  readonly objects = new Map<string, { bytes: Uint8Array; etag: string }>();
  writes = 0;
  failGet = false;
  loseHeadResponseOnce = false;
  rejectHeadBeforeCommitOnce = false;
  loseVersionResponseOnce = false;
  private nextEtag = 0;

  async get(path: string) {
    if (this.failGet) throw new StoreError("unavailable");
    const result = this.objects.get(path);
    return result ? { bytes: result.bytes.slice(), etag: result.etag } : null;
  }

  private save(path: string, bytes: Uint8Array): string {
    if (path === LEDGER_HEAD_PATH && this.rejectHeadBeforeCommitOnce) {
      this.rejectHeadBeforeCommitOnce = false;
      throw new StoreError("unavailable");
    }
    const etag = `"synthetic-${++this.nextEtag}"`;
    this.objects.set(path, { bytes: bytes.slice(), etag });
    this.writes += 1;
    if (path === LEDGER_HEAD_PATH && this.loseHeadResponseOnce) {
      this.loseHeadResponseOnce = false;
      throw new StoreError("unavailable");
    }
    if (path.includes("/versions/") && this.loseVersionResponseOnce) {
      this.loseVersionResponseOnce = false;
      throw new StoreError("unavailable");
    }
    return etag;
  }

  async create(path: string, bytes: Uint8Array) {
    if (this.objects.has(path)) throw new StoreError("conflict");
    return this.save(path, bytes);
  }

  async compareAndSwap(path: string, bytes: Uint8Array, etag: string) {
    if (this.objects.get(path)?.etag !== etag) throw new StoreError("conflict");
    return this.save(path, bytes);
  }
}

function fixture(): Snapshot {
  return {
    schema: 1, revision: 1, updatedAt: "2026-01-01T00:00:00.000Z",
    data: {
      products: [{ id: "synthetic-sku", name: "测试商品", group: "test", costType: "unit", cost: 10, price: 20, shipping: 1, tax: 0, platform: 0 }],
      sfRates: [{ name: "甲", rates: [1, 2, 3, 4, 5] }, { name: "乙", rates: [1, 2, 3, 4, 5] }],
      defaultPlans: {}, fifoReference: {}, procurement: { orders: [], excluded: [] },
      stores: { "black-abacus-sku-plans-v1": {}, "black-abacus-sku-archives-v1": {}, "black-abacus-fifo-v1": {} },
    },
  };
}

function changed(label: string): Stores {
  return {
    "black-abacus-sku-plans-v1": { "synthetic-sku": { note: label } },
    "black-abacus-sku-archives-v1": {
      "synthetic-sku": [{ id: label, name: label, createdAt: "2026-01-01T00:00:00Z", values: { cost: 15 }, result: { profit: 2 } }],
    },
    "black-abacus-fifo-v1": {
      "synthetic-sku": { stock: 2, locked: 1, batches: [{ name: label, date: "2026-01-01", qty: 2, cost: 10 }] },
    },
  };
}

const make = () => {
  const objects = new MemoryObjectStore();
  const store = new SnapshotStore(objects, () => "2026-01-02T00:00:00.000Z");
  return { objects, store };
};

describe("immutable snapshot store", () => {
  it("refuses an uninitialized store without creating a ledger", async () => {
    const { objects, store } = make();
    await expect(store.read()).rejects.toMatchObject({ code: "uninitialized" });
    await expect(store.update(1, changed("a"), "owner", "operation-a")).rejects.toMatchObject({ code: "uninitialized" });
    expect(objects.writes).toBe(0);
  });

  it("preserves complete initial data, revision and timestamp; returns detached values", async () => {
    const { objects, store } = make();
    const input = fixture();
    input.revision = 9;
    input.data.products[0].retainedMetadata = { source: "synthetic" };
    const created = await store.create(input, "owner", "initialize-1");
    expect(created).toEqual(input);
    created.data.products[0].name = "mutated-return";
    expect(await store.read()).toEqual(input);
    expect(objects.objects.size).toBe(2);
    expect(objects.writes).toBe(2);
  });

  it("commits all three stores together and preserves reference data", async () => {
    const { objects, store } = make();
    const input = fixture();
    await store.create(input, "owner", "initialize-1");
    const result = await store.update(1, changed("updated"), "owner", "update-001");
    expect(result).toEqual({ ...input, revision: 2, updatedAt: "2026-01-02T00:00:00.000Z", data: { ...input.data, stores: changed("updated") } });
    const reloaded = new SnapshotStore(objects);
    expect(await reloaded.read()).toEqual(result);
    expect(objects.objects.size).toBe(3);
  });

  it("allows exactly one of two concurrent initializations", async () => {
    const { objects, store } = make();
    const result = await Promise.allSettled([
      store.create(fixture(), "owner", "initialize-a"),
      store.create(fixture(), "owner", "initialize-b"),
    ]);
    expect(result.filter((item) => item.status === "fulfilled")).toHaveLength(1);
    const rejected = result.find((item) => item.status === "rejected") as PromiseRejectedResult;
    expect(rejected.reason).toMatchObject({ code: "conflict", revision: 1 });
    expect((await store.read()).revision).toBe(1);
    expect(objects.objects.size).toBe(3); // rejected candidate is never the head
  });

  it("allows exactly one same-revision update without lost stores", async () => {
    const { store } = make();
    await store.create(fixture(), "owner", "initialize-1");
    const results = await Promise.allSettled([
      store.update(1, changed("winner-a"), "owner", "update-aaa"),
      store.update(1, changed("winner-b"), "owner", "update-bbb"),
    ]);
    expect(results.filter((item) => item.status === "fulfilled")).toHaveLength(1);
    expect((results.find((item) => item.status === "rejected") as PromiseRejectedResult).reason).toMatchObject({ code: "conflict", revision: 2 });
    const success = (results.find((item) => item.status === "fulfilled") as PromiseFulfilledResult<Snapshot>).value;
    expect(await store.read()).toEqual(success);
  });

  it("deduplicates two simultaneous calls with the same operation and intent", async () => {
    const { objects, store } = make();
    await store.create(fixture(), "owner", "initialize-1");
    const results = await Promise.all([
      store.update(1, changed("same"), "owner", "update-same"),
      store.update(1, changed("same"), "owner", "update-same"),
    ]);
    expect(results[0]).toEqual(results[1]);
    expect((await store.read()).revision).toBe(2);
    expect(objects.writes).toBe(4);
  });

  it("confirms a committed operation after a lost CAS response without retrying it", async () => {
    const { objects, store } = make();
    await store.create(fixture(), "owner", "initialize-1");
    objects.loseHeadResponseOnce = true;
    const result = await store.update(1, changed("lost-response"), "owner", "update-lost");
    expect(result.revision).toBe(2);
    expect(objects.writes).toBe(4);
  });

  it("confirms an immutable candidate after its upload response is lost", async () => {
    const { objects, store } = make();
    objects.loseVersionResponseOnce = true;
    const result = await store.create(fixture(), "owner", "initialize-1");
    expect(result.revision).toBe(1);
    expect(objects.writes).toBe(2);
  });

  it("does not pretend a rejected head write succeeded and resumes only the same operation", async () => {
    const { objects, store } = make();
    await store.create(fixture(), "owner", "initialize-1");
    objects.rejectHeadBeforeCommitOnce = true;
    await expect(store.update(1, changed("pending"), "owner", "update-pending")).rejects.toMatchObject({ code: "unavailable" });
    expect((await store.read()).revision).toBe(1);
    expect(objects.writes).toBe(3); // one immutable candidate; no blind CAS retry
    const resumed = await store.update(1, changed("pending"), "owner", "update-pending");
    expect(resumed.revision).toBe(2);
    expect(objects.writes).toBe(4);
  });

  it("resolves an old committed operation after later updates without changing current state", async () => {
    const { objects, store } = make();
    await store.create(fixture(), "owner", "initialize-1");
    const first = await store.update(1, changed("first"), "owner", "update-first");
    const latest = await store.update(2, changed("second"), "owner", "update-second");
    const count = objects.writes;
    expect(await store.update(1, changed("first"), "owner", "update-first")).toEqual(first);
    expect(await store.read()).toEqual(latest);
    expect(objects.writes).toBe(count);
  });

  it("rejects reused operation IDs for different payload or actor", async () => {
    const { objects, store } = make();
    await store.create(fixture(), "owner", "initialize-1");
    await store.update(1, changed("first"), "owner", "update-first");
    const count = objects.writes;
    await expect(store.update(1, changed("different"), "owner", "update-first")).rejects.toMatchObject({ code: "invalid" });
    await expect(store.update(1, changed("first"), "another", "update-first")).rejects.toMatchObject({ code: "invalid" });
    expect(objects.writes).toBe(count);
  });

  it("rejects corrupted or missing immutable content instead of using another snapshot", async () => {
    const { objects, store } = make();
    await store.create(fixture(), "owner", "initialize-1");
    const head = JSON.parse(decoder.decode(objects.objects.get(LEDGER_HEAD_PATH)!.bytes));
    const version = objects.objects.get(head.current.path)!;
    version.bytes = encoder.encode(decoder.decode(version.bytes).replace("测试商品", "破坏商品"));
    await expect(store.read()).rejects.toMatchObject({ code: "invalid" });
    objects.objects.delete(head.current.path);
    await expect(store.read()).rejects.toMatchObject({ code: "invalid" });
  });

  it("rejects oversized full snapshots before writing, without truncating", async () => {
    const { objects, store } = make();
    const input = fixture();
    input.data.products[0].note = "x".repeat(MAX_SNAPSHOT_BYTES);
    await expect(store.create(input, "owner", "initialize-1")).rejects.toMatchObject({ code: "invalid" });
    expect(objects.writes).toBe(0);
    await store.create(fixture(), "owner", "initialize-1");
    const stores = changed("huge");
    stores["black-abacus-sku-plans-v1"].huge = { note: "x".repeat(MAX_SNAPSHOT_BYTES) };
    await expect(store.update(1, stores, "owner", "update-huge")).rejects.toMatchObject({ code: "invalid" });
    expect((await store.read()).revision).toBe(1);
    expect(objects.writes).toBe(2);
  });

  it("round-trips an exact 2 MiB snapshot and rejects a combined oversized update", async () => {
    const { objects, store } = make();
    const input = fixture();
    input.data.products[0].note = "";
    input.data.products[0].note = "x".repeat(MAX_SNAPSHOT_BYTES - encoder.encode(JSON.stringify(input)).byteLength);
    expect(encoder.encode(JSON.stringify(input)).byteLength).toBe(MAX_SNAPSHOT_BYTES);
    await store.create(input, "owner", "initialize-1");
    expect(await store.read()).toEqual(input);
    // The three stores individually fit; the complete data envelope does not.
    await expect(store.update(1, changed("adds-fields"), "owner", "update-beyond")).rejects.toMatchObject({ code: "invalid" });
    expect(await store.read()).toEqual(input);
    expect(objects.writes).toBe(2);
  });

  it("fails closed on storage errors and validates actor/operation audit fields", async () => {
    const { objects, store } = make();
    objects.failGet = true;
    await expect(store.read()).rejects.toMatchObject({ code: "unavailable" });
    expect(objects.writes).toBe(0);
    objects.failGet = false;
    await expect(store.create(fixture(), "Bearer not-an-actor", "initialize-1")).rejects.toMatchObject({ code: "invalid" });
    await expect(store.create(fixture(), "owner", "../unsafe")).rejects.toMatchObject({ code: "invalid" });
    await store.create(fixture(), "owner", "initialize-1");
    const version = [...objects.objects.entries()].find(([path]) => path.includes("/versions/"))![1];
    expect(Object.keys(JSON.parse(decoder.decode(version.bytes)).audit).sort()).toEqual(["actor", "expectedRevision", "kind", "operationId", "payloadHash"]);
  });
});

function blobResult(bytes = encoder.encode("{}"), etag = '"private-etag"'): GetBlobResult {
  return {
    statusCode: 200,
    stream: new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(bytes); controller.close(); } }),
    headers: new Headers(),
    blob: { pathname: "abacus/v1/test.json", url: "https://synthetic.invalid", downloadUrl: "https://synthetic.invalid", contentType: "application/json", contentDisposition: "attachment", cacheControl: "max-age=60", uploadedAt: new Date(0), size: bytes.byteLength, etag },
  };
}

function fakeClient() {
  const getMock = vi.fn<PrivateBlobClient["get"]>();
  const putMock = vi.fn<PrivateBlobClient["put"]>();
  const client: PrivateBlobClient = { get: getMock, put: putMock };
  const store = new BlobObjectStore({ token: "synthetic-test-only", client });
  return { store, getMock, putMock };
}

afterEach(() => vi.unstubAllEnvs());

describe("private Blob SDK adapter (mock SDK, never network)", () => {
  it("uses private uncached reads and corresponding blob.etag", async () => {
    const { store, getMock } = fakeClient();
    getMock.mockResolvedValue(blobResult());
    expect((await store.get("abacus/v1/test.json"))?.etag).toBe('"private-etag"');
    expect(getMock).toHaveBeenCalledWith("abacus/v1/test.json", expect.objectContaining({ access: "private", useCache: false }));
  });

  it("creates without overwrite and updates using the installed ifMatch API", async () => {
    const { store, putMock } = fakeClient();
    putMock.mockResolvedValue({ etag: '"new-etag"' } as PutBlobResult);
    await store.create("abacus/v1/test.json", encoder.encode("{}"));
    expect(putMock.mock.calls[0][2]).toMatchObject({ access: "private", addRandomSuffix: false, allowOverwrite: false });
    expect(putMock.mock.calls[0][2]).not.toHaveProperty("ifNoneMatch");
    expect(putMock.mock.calls[0][2]).not.toHaveProperty("ifMatch");
    await store.compareAndSwap("abacus/v1/test.json", encoder.encode("{}"), '"old-etag"');
    expect(putMock.mock.calls[1][2]).toMatchObject({ access: "private", addRandomSuffix: false, allowOverwrite: true, ifMatch: '"old-etag"' });
  });

  it("maps SDK precondition failures to conflicts without retrying", async () => {
    const { store, getMock, putMock } = fakeClient();
    putMock.mockRejectedValue(new BlobPreconditionFailedError());
    await expect(store.compareAndSwap("abacus/v1/test.json", encoder.encode("{}"), '"old"')).rejects.toMatchObject({ code: "conflict" });
    expect(putMock).toHaveBeenCalledTimes(1);
    expect(getMock).not.toHaveBeenCalled();
  });

  it("checks create errors by an uncached read, never by matching secret-bearing error text", async () => {
    const { store, getMock, putMock } = fakeClient();
    putMock.mockRejectedValue(new Error("provider internal details"));
    getMock.mockResolvedValue(blobResult());
    await expect(store.create("abacus/v1/test.json", encoder.encode("{}"))).rejects.toMatchObject({ code: "conflict" });
    getMock.mockResolvedValue(null);
    await expect(store.create("abacus/v1/test.json", encoder.encode("{}"))).rejects.toMatchObject({ code: "unavailable" });
  });

  it("refuses missing configuration without an SDK call or fallback", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    const client = fakeClient();
    const store = new BlobObjectStore({ client: { get: client.getMock, put: client.putMock } });
    await expect(store.get("abacus/v1/test.json")).rejects.toMatchObject({ code: "unavailable" });
    await expect(store.create("abacus/v1/test.json", encoder.encode("{}"))).rejects.toMatchObject({ code: "unavailable" });
    expect(client.getMock).not.toHaveBeenCalled();
    expect(client.putMock).not.toHaveBeenCalled();
  });

  it("refuses unsafe namespaces, empty etags and excessive private objects", async () => {
    const { store, getMock, putMock } = fakeClient();
    for (const path of ["tickets/records/a.json", "abacus/v1/../private", "abacus/v1//test", "abacus/v1/%2e%2e/test"]) {
      await expect(store.get(path)).rejects.toMatchObject({ code: "invalid" });
    }
    getMock.mockResolvedValue(blobResult(encoder.encode("{}"), ""));
    await expect(store.get("abacus/v1/test.json")).rejects.toMatchObject({ code: "unavailable" });
    getMock.mockResolvedValue(blobResult(new Uint8Array(MAX_PRIVATE_OBJECT_BYTES + 1)));
    await expect(store.get("abacus/v1/test.json")).rejects.toMatchObject({ code: "invalid" });
    expect(() => store.compareAndSwap("abacus/v1/test.json", encoder.encode("{}"), "")).toThrow(StoreError);
    expect(putMock).not.toHaveBeenCalled();
  });

  it("enforces the actual streamed size even when Blob metadata understates it", async () => {
    const { store, getMock } = fakeClient();
    const result = blobResult(new Uint8Array(MAX_PRIVATE_OBJECT_BYTES + 1));
    result.blob.size = 1;
    getMock.mockResolvedValue(result);
    await expect(store.get("abacus/v1/test.json")).rejects.toMatchObject({ code: "invalid" });
  });
});
