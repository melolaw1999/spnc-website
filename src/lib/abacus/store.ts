import { createHash } from "node:crypto";
import {
  MAX_SNAPSHOT_BYTES,
  parseStrictJson,
  validateSnapshot,
  validateStores,
  type Snapshot,
  type Stores,
} from "./schema";

export type { Snapshot, Stores } from "./schema";

export type StoreErrorCode = "uninitialized" | "conflict" | "unavailable" | "invalid";

/** Deliberately carries neither credentials nor business values. */
export class StoreError extends Error {
  readonly code: StoreErrorCode;
  readonly revision?: number;

  constructor(code: StoreErrorCode, revision?: number) {
    super(`Abacus store ${code}`);
    this.name = "StoreError";
    this.code = code;
    this.revision = revision;
  }
}

export interface PrivateObjectStore {
  /** A current, uncached read. The ETag belongs to these exact bytes. */
  get(path: string): Promise<{ bytes: Uint8Array; etag: string } | null>;
  /** Atomic create-if-absent; an existing path is StoreError('conflict'). */
  create(path: string, bytes: Uint8Array): Promise<string>;
  /** Atomic replace-if-ETag-matches; mismatch is StoreError('conflict'). */
  compareAndSwap(path: string, bytes: Uint8Array, etag: string): Promise<string>;
}

export const ABACUS_NAMESPACE = "abacus/v1/";
export const LEDGER_HEAD_PATH = `${ABACUS_NAMESPACE}ledger/head.json`;
export const MAX_PRIVATE_OBJECT_BYTES = MAX_SNAPSHOT_BYTES + 32 * 1024;
const VERSION_PREFIX = `${ABACUS_NAMESPACE}ledger/versions/`;
const MAX_HEAD_BYTES = 4096;
// Old operation retries must fail closed rather than silently reapply work.
const MAX_OPERATION_HISTORY = 512;
const encoder = new TextEncoder();

interface Pointer {
  path: string;
  sha256: string;
  revision: number;
}

interface Audit {
  actor: string;
  operationId: string;
  kind: "create" | "update";
  expectedRevision: number | null;
  payloadHash: string;
}

interface Version {
  format: 1;
  snapshot: Snapshot;
  audit: Audit;
  previous: Pointer | null;
}

interface Head {
  format: 1;
  current: Pointer;
}

interface State {
  head: Head;
  etag: string;
  version: Version;
}

export interface SnapshotStorePort {
  read(): Promise<Snapshot>;
  create(snapshot: Snapshot, actor: string, operationId: string): Promise<Snapshot>;
  update(expectedRevision: number, stores: Stores, actor: string, operationId: string): Promise<Snapshot>;
}

export function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function validRevision(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function validIdentity(value: unknown): value is string {
  return typeof value === "string" && /^[\p{L}\p{N}][\p{L}\p{N}_.@:+-]{0,127}$/u.test(value);
}

function validOperationId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/.test(value);
}

function validateAuditInput(actor: unknown, operationId: unknown): void {
  // Only a stable authenticated account identifier, never a request/header object.
  if (!validIdentity(actor) || !validOperationId(operationId)) throw new StoreError("invalid");
}

/** Object-store paths never come from an API caller. Also used by auth adapters. */
export function validatePrivatePath(path: string): void {
  if (!path.startsWith(ABACUS_NAMESPACE) || path.length > 512
      || !/^[A-Za-z0-9_./-]+$/.test(path)
      || path.split("/").some((part) => part === "" || part === "." || part === "..")) {
    throw new StoreError("invalid");
  }
}

function validateEtag(etag: unknown): asserts etag is string {
  if (typeof etag !== "string" || !etag.trim() || etag.length > 512 || /[\r\n\0]/.test(etag)) {
    throw new StoreError("unavailable");
  }
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  }
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new StoreError("invalid");
  return encoded;
}

function encode(value: unknown, maxBytes = MAX_PRIVATE_OBJECT_BYTES): Uint8Array {
  try {
    const bytes = encoder.encode(canonical(value));
    if (bytes.byteLength > maxBytes) throw new StoreError("invalid");
    return bytes;
  } catch {
    throw new StoreError("invalid");
  }
}

function parse(bytes: Uint8Array, maxBytes = MAX_PRIVATE_OBJECT_BYTES): unknown {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength > maxBytes) throw new StoreError("invalid");
  try {
    // Version/audit metadata has its own small allowance beyond a 2 MiB snapshot.
    return parseStrictJson(bytes, { maxBytes, maxDepth: 34 });
  } catch {
    throw new StoreError("invalid");
  }
}

function checkedSnapshot(value: unknown): Snapshot {
  try {
    validateSnapshot(value);
    encode(value, MAX_SNAPSHOT_BYTES);
    return value;
  } catch {
    throw new StoreError("invalid");
  }
}

function checkedPointer(value: unknown): Pointer {
  if (!isRecord(value) || !exactKeys(value, ["path", "sha256", "revision"])
      || typeof value.path !== "string" || !new RegExp(`^${VERSION_PREFIX}[a-f0-9]{64}\\.json$`).test(value.path)
      || typeof value.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(value.sha256)
      || !validRevision(value.revision)) throw new StoreError("invalid");
  return value as unknown as Pointer;
}

function checkedHead(bytes: Uint8Array): Head {
  const value = parse(bytes, MAX_HEAD_BYTES);
  if (!isRecord(value) || !exactKeys(value, ["format", "current"]) || value.format !== 1) {
    throw new StoreError("invalid");
  }
  return { format: 1, current: checkedPointer(value.current) };
}

function checkedVersion(bytes: Uint8Array): Version {
  const value = parse(bytes);
  if (!isRecord(value) || !exactKeys(value, ["format", "snapshot", "audit", "previous"]) || value.format !== 1) {
    throw new StoreError("invalid");
  }
  const snapshot = checkedSnapshot(value.snapshot);
  const audit = value.audit;
  if (!isRecord(audit) || !exactKeys(audit, ["actor", "operationId", "kind", "expectedRevision", "payloadHash"])
      || !validIdentity(audit.actor) || !validOperationId(audit.operationId)
      || (audit.kind !== "create" && audit.kind !== "update")
      || typeof audit.payloadHash !== "string" || !/^[a-f0-9]{64}$/.test(audit.payloadHash)) {
    throw new StoreError("invalid");
  }
  const previous = value.previous === null ? null : checkedPointer(value.previous);
  if (audit.kind === "create") {
    if (previous !== null || audit.expectedRevision !== null) throw new StoreError("invalid");
  } else if (!previous || !validRevision(audit.expectedRevision)
      || previous.revision !== audit.expectedRevision || snapshot.revision !== previous.revision + 1) {
    throw new StoreError("invalid");
  }
  const expectedHash = sha256(encode(audit.kind === "create" ? snapshot : snapshot.data.stores, MAX_SNAPSHOT_BYTES));
  if (audit.payloadHash !== expectedHash) throw new StoreError("invalid");
  return { format: 1, snapshot, audit: audit as unknown as Audit, previous };
}

function samePointer(left: Pointer | null, right: Pointer | null): boolean {
  return left === null || right === null ? left === right
    : left.path === right.path && left.sha256 === right.sha256 && left.revision === right.revision;
}

function operationPath(operationId: string): string {
  return `${VERSION_PREFIX}${sha256(encoder.encode(operationId))}.json`;
}

function sameIntent(version: Version, audit: Audit): boolean {
  return canonical(version.audit) === canonical(audit);
}

function copySnapshot(snapshot: Snapshot): Snapshot {
  return structuredClone(snapshot);
}

/** A single ledger, committed by exactly one CAS of its head pointer. */
export class SnapshotStore implements SnapshotStorePort {
  constructor(private readonly objects: PrivateObjectStore, private readonly now = () => new Date().toISOString()) {}

  private async object(path: string): Promise<{ bytes: Uint8Array; etag: string } | null> {
    let result;
    try {
      result = await this.objects.get(path);
    } catch (error) {
      if (error instanceof StoreError) throw error;
      throw new StoreError("unavailable");
    }
    if (result) {
      validateEtag(result.etag);
      if (!(result.bytes instanceof Uint8Array) || result.bytes.byteLength > MAX_PRIVATE_OBJECT_BYTES) {
        throw new StoreError("invalid");
      }
    }
    return result;
  }

  private async version(pointer: Pointer): Promise<Version> {
    const object = await this.object(pointer.path);
    if (!object) throw new StoreError("invalid");
    if (sha256(object.bytes) !== pointer.sha256) throw new StoreError("invalid");
    const version = checkedVersion(object.bytes);
    if (version.snapshot.revision !== pointer.revision || operationPath(version.audit.operationId) !== pointer.path) {
      throw new StoreError("invalid");
    }
    return version;
  }

  private async state(): Promise<State | null> {
    const result = await this.object(LEDGER_HEAD_PATH);
    if (!result) return null;
    const head = checkedHead(result.bytes);
    return { head, etag: result.etag, version: await this.version(head.current) };
  }

  async read(): Promise<Snapshot> {
    const state = await this.state();
    if (!state) throw new StoreError("uninitialized");
    return copySnapshot(state.version.snapshot);
  }

  /** Proves membership in the committed chain; a stray candidate is not a commit. */
  private async committed(state: State | null, candidate: Pointer): Promise<Snapshot | null> {
    if (!state || candidate.revision > state.head.current.revision) return null;
    let pointer: Pointer | null = state.head.current;
    let version: Version = state.version;
    for (let depth = 0; pointer && pointer.revision >= candidate.revision; depth += 1) {
      if (depth >= MAX_OPERATION_HISTORY) throw new StoreError("unavailable");
      if (samePointer(pointer, candidate)) return copySnapshot(version.snapshot);
      pointer = version.previous;
      if (pointer && pointer.revision >= candidate.revision) version = await this.version(pointer);
    }
    return null;
  }

  private async existing(audit: Audit): Promise<{ version: Version; pointer: Pointer } | null> {
    const path = operationPath(audit.operationId);
    const result = await this.object(path);
    if (!result) return null;
    const version = checkedVersion(result.bytes);
    if (!sameIntent(version, audit)) throw new StoreError("invalid");
    return { version, pointer: { path, sha256: sha256(result.bytes), revision: version.snapshot.revision } };
  }

  private async candidate(version: Version): Promise<{ version: Version; pointer: Pointer }> {
    const bytes = encode(version);
    const path = operationPath(version.audit.operationId);
    try {
      validateEtag(await this.objects.create(path, bytes));
      return { version, pointer: { path, sha256: sha256(bytes), revision: version.snapshot.revision } };
    } catch (error) {
      // A lost response can follow a successful immutable upload. Read once;
      // never blindly retry the write or mistake an arbitrary exception for success.
      const found = await this.existing(version.audit);
      if (found) return found;
      if (error instanceof StoreError && error.code === "invalid") throw error;
      throw new StoreError("unavailable");
    }
  }

  private async commit(candidate: { version: Version; pointer: Pointer }, base: State | null): Promise<Snapshot> {
    const headBytes = encode({ format: 1, current: candidate.pointer } satisfies Head, MAX_HEAD_BYTES);
    try {
      const etag = base
        ? await this.objects.compareAndSwap(LEDGER_HEAD_PATH, headBytes, base.etag)
        : await this.objects.create(LEDGER_HEAD_PATH, headBytes);
      validateEtag(etag);
      return copySnapshot(candidate.version.snapshot);
    } catch (error) {
      // A CAS may have committed even when its response was lost. Verify that
      // this operation is in the durable chain before reporting success.
      const current = await this.state();
      const committed = await this.committed(current, candidate.pointer);
      if (committed) return committed;
      if (error instanceof StoreError && error.code === "conflict") {
        throw new StoreError("conflict", current?.version.snapshot.revision);
      }
      throw new StoreError("unavailable");
    }
  }

  async create(snapshot: Snapshot, actor: string, operationId: string): Promise<Snapshot> {
    validateAuditInput(actor, operationId);
    const input = copySnapshot(checkedSnapshot(snapshot));
    const audit: Audit = {
      actor, operationId, kind: "create", expectedRevision: null,
      payloadHash: sha256(encode(input, MAX_SNAPSHOT_BYTES)),
    };
    const state = await this.state();
    const existing = await this.existing(audit);
    if (existing) {
      const committed = await this.committed(state, existing.pointer);
      if (committed) return committed;
    }
    if (state) throw new StoreError("conflict", state.version.snapshot.revision);
    const candidate = existing ?? await this.candidate({ format: 1, snapshot: input, audit, previous: null });
    if (candidate.version.previous !== null) throw new StoreError("invalid");
    return this.commit(candidate, null);
  }

  async update(expectedRevision: number, stores: Stores, actor: string, operationId: string): Promise<Snapshot> {
    validateAuditInput(actor, operationId);
    if (!validRevision(expectedRevision) || expectedRevision === Number.MAX_SAFE_INTEGER) throw new StoreError("invalid");
    let submittedStores: Stores;
    try {
      validateStores(stores);
      submittedStores = structuredClone(stores);
    } catch {
      throw new StoreError("invalid");
    }
    const audit: Audit = {
      actor, operationId, kind: "update", expectedRevision,
      payloadHash: sha256(encode(submittedStores, MAX_SNAPSHOT_BYTES)),
    };
    const state = await this.state();
    if (!state) throw new StoreError("uninitialized");
    const existing = await this.existing(audit);
    if (existing) {
      const committed = await this.committed(state, existing.pointer);
      if (committed) return committed;
    }
    if (state.version.snapshot.revision !== expectedRevision) throw new StoreError("conflict", state.version.snapshot.revision);
    const snapshot = checkedSnapshot({
      ...state.version.snapshot,
      revision: expectedRevision + 1,
      updatedAt: this.now(),
      data: { ...state.version.snapshot.data, stores: submittedStores },
    });
    const candidate = existing ?? await this.candidate({ format: 1, snapshot, audit, previous: state.head.current });
    if (!samePointer(candidate.version.previous, state.head.current)) throw new StoreError("conflict", expectedRevision);
    return this.commit(candidate, state);
  }
}

export { SnapshotStore as ObjectSnapshotStore };
export const createSnapshotStore = (objects: PrivateObjectStore): SnapshotStorePort => new SnapshotStore(objects);
