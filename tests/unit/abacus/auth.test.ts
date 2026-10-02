import { describe, expect, it } from "vitest";
import { ABACUS_SESSION_COOKIE, ABACUS_SESSION_TTL_SECONDS, createAbacusAuth } from "../../../src/lib/abacus/auth";
import type { PrivateObjectStore } from "../../../src/lib/abacus/store";

class MemoryStore implements PrivateObjectStore {
  records = new Map<string, { bytes: Uint8Array; etag: string }>();
  revision = 0;
  reads = 0;
  writes = 0;
  fail = false;
  conflicts = 0;
  async get(path: string) {
    this.reads += 1;
    if (this.fail) throw new Error("synthetic transport error must not escape");
    const record = this.records.get(path);
    return record ? { bytes: record.bytes.slice(), etag: record.etag } : null;
  }
  async create(path: string, bytes: Uint8Array) {
    if (this.fail) throw new Error("synthetic transport error must not escape");
    if (this.records.has(path)) throw Object.assign(new Error("conflict"), { code: "conflict" });
    return this.write(path, bytes);
  }
  async compareAndSwap(path: string, bytes: Uint8Array, etag: string) {
    if (this.fail) throw new Error("synthetic transport error must not escape");
    if (this.conflicts > 0) { this.conflicts -= 1; throw Object.assign(new Error("conflict"), { code: "conflict" }); }
    if (this.records.get(path)?.etag !== etag) throw Object.assign(new Error("conflict"), { code: "conflict" });
    return this.write(path, bytes);
  }
  private write(path: string, bytes: Uint8Array) {
    this.writes += 1;
    const etag = String(++this.revision);
    this.records.set(path, { bytes: bytes.slice(), etag });
    return etag;
  }
  changeSession(change: (value: Record<string, unknown>) => void) {
    const entry = [...this.records.entries()].find(([path]) => path.includes("/sessions/"))!;
    const record = JSON.parse(new TextDecoder().decode(entry[1].bytes));
    change(record);
    this.records.set(entry[0], { bytes: new TextEncoder().encode(JSON.stringify(record)), etag: String(++this.revision) });
  }
}

const ORIGIN = "https://example.invalid";
const hostileHeaders: Record<string, string>[] = [
  { origin: "https://foreign.invalid" }, { origin: "null" }, { host: "foreign.invalid" },
  { host: "example.invalid:444" }, { "sec-fetch-site": "cross-site" },
];
const PREVIEW = {
  NODE_ENV: "production", ABACUS_ACCESS_MODE: "membership-preview", ABACUS_PUBLIC_ORIGIN: ORIGIN,
  MEMBERSHIP_PREVIEW_PASSWORD: "synthetic-only-passphrase", MEMBERSHIP_PREVIEW_SECRET: "synthetic-only-signing-material-not-real-000001",
};
const ADMIN = {
  NODE_ENV: "production", ABACUS_ACCESS_MODE: "admin", ABACUS_PUBLIC_ORIGIN: ORIGIN,
  ADMIN_USERNAME: "synthetic-admin", ADMIN_PASSWORD: "synthetic-admin-passphrase",
};
const form = { password: PREVIEW.MEMBERSHIP_PREVIEW_PASSWORD };
const request = (method = "POST", cookie?: string, overrides: Record<string, string> = {}) => new Request(`${ORIGIN}/api/abacus/auth`, {
  method, headers: { host: "example.invalid", origin: ORIGIN, ...(cookie ? { cookie } : {}), ...overrides },
});
const cookieFrom = (result: { setCookie: string }) => result.setCookie.split(";")[0];
const context = () => {
  const store = new MemoryStore();
  let time = 1_800_000_000_000;
  const now = () => time;
  const auth = createAbacusAuth({ store, env: PREVIEW, now });
  return { store, auth, now, advance: (milliseconds: number) => { time += milliseconds; } };
};

describe("abacus authentication using synthetic DI only", () => {
  it("defaults to disabled even with existing credentials and makes no store calls", async () => {
    const store = new MemoryStore();
    const auth = createAbacusAuth({ store, env: { ...PREVIEW, ABACUS_ACCESS_MODE: undefined } });
    expect(auth.availability().enabled).toBe(false);
    await expect(auth.login(request(), form)).rejects.toMatchObject({ status: 503 });
    await expect(auth.requireSession(request("GET"))).rejects.toMatchObject({ status: 503 });
    expect(store.reads + store.writes).toBe(0);
  });

  it.each([
    { ...PREVIEW, MEMBERSHIP_PREVIEW_SECRET: undefined },
    { ...PREVIEW, MEMBERSHIP_PREVIEW_PASSWORD: undefined },
    { ...ADMIN, ADMIN_USERNAME: undefined },
    { ...ADMIN, ADMIN_PASSWORD: undefined },
    { ...PREVIEW, ABACUS_PUBLIC_ORIGIN: undefined },
    { ...PREVIEW, ABACUS_PUBLIC_ORIGIN: "http://example.invalid" },
    { ...PREVIEW, ABACUS_PUBLIC_ORIGIN: "http://localhost:8891" },
    { ...PREVIEW, ABACUS_PUBLIC_ORIGIN: `${ORIGIN}/unexpected-path` },
    { ...PREVIEW, ABACUS_PUBLIC_ORIGIN: "https://name:synthetic@example.invalid" },
    { NODE_ENV: "development", ABACUS_ACCESS_MODE: "membership-preview", ABACUS_PUBLIC_ORIGIN: "http://localhost:8891" },
  ])("fails closed for absent configuration, invalid origin, and absent development fallbacks (%#)", (env) => {
    const store = new MemoryStore();
    expect(createAbacusAuth({ store, env }).availability().enabled).toBe(false);
    expect(store.reads + store.writes).toBe(0);
  });

  it("allows explicitly configured localhost HTTP in development only", async () => {
    const store = new MemoryStore();
    const auth = createAbacusAuth({ store, env: { ...PREVIEW, NODE_ENV: "development", ABACUS_PUBLIC_ORIGIN: "http://localhost:8891" } });
    expect(auth.availability().enabled).toBe(true);
    const result = await auth.login(new Request("http://localhost:8891/api/abacus/auth", {
      method: "POST", headers: { host: "localhost:8891", origin: "http://localhost:8891" },
    }), form);
    expect(result.setCookie).not.toContain("; Secure");
  });

  it("issues only an opaque scoped cookie and stores no password, signing key, or full token", async () => {
    const { auth, store, now } = context();
    const result = await auth.login(request(), form);
    expect(result.expiresAt).toBe(now() + 8 * 60 * 60 * 1000);
    expect(result.setCookie).toMatch(/^spnc_abacus_session=v1\.[a-f0-9]{64}\.[A-Za-z0-9_-]{43}; /);
    for (const flag of ["Path=/", "HttpOnly", "SameSite=Strict", "Secure", `Max-Age=${ABACUS_SESSION_TTL_SECONDS}`]) expect(result.setCookie).toContain(flag);
    const stored = [...store.records.values()].map((value) => new TextDecoder().decode(value.bytes)).join("");
    expect(stored).not.toContain(form.password);
    expect(stored).not.toContain(PREVIEW.MEMBERSHIP_PREVIEW_SECRET);
    expect(stored).not.toContain(cookieFrom(result).split("=")[1]);
    expect(result.actor).toMatch(/^membership-preview:[a-f0-9]{24}$/);
  });

  it("checks the latest persistent session on every request", async () => {
    const { auth, store } = context();
    const cookie = cookieFrom(await auth.login(request(), form));
    const reads = store.reads;
    await auth.requireSession(request("GET", cookie));
    await auth.requireSession(request("GET", cookie));
    expect(store.reads).toBe(reads + 2);
    store.changeSession((record) => { record.revokedAt = Date.now(); });
    await expect(auth.requireSession(request("GET", cookie))).rejects.toMatchObject({ status: 401 });
  });

  it("allows same-host GET without Origin but rejects absent Host", async () => {
    const { auth, store } = context();
    const cookie = cookieFrom(await auth.login(request(), form));
    await expect(auth.requireSession(new Request(`${ORIGIN}/api/abacus/data`, {
      headers: { host: "example.invalid", cookie },
    }))).resolves.toHaveProperty("actor");
    const reads = store.reads;
    await expect(auth.requireSession(new Request(`${ORIGIN}/api/abacus/data`, {
      headers: { cookie },
    }))).rejects.toMatchObject({ status: 403 });
    expect(store.reads).toBe(reads);
  });

  it("rejects membership cookies, tampered cookies, duplicates, and missing sessions", async () => {
    const { auth, store } = context();
    const cookie = cookieFrom(await auth.login(request(), form));
    for (const invalid of [cookie.replace(ABACUS_SESSION_COOKIE, "spnc_membership_preview"), `${cookie}; ${cookie}`, `${cookie.slice(0, -1)}!`]) {
      await expect(auth.requireSession(request("GET", invalid))).rejects.toMatchObject({ status: 401 });
    }
    store.records.clear();
    await expect(auth.requireSession(request("GET", cookie))).rejects.toMatchObject({ status: 401 });
  });

  it.each(["audience", "mode", "actor", "referenceHash", "credentialFingerprint"])("rejects a session with changed %s", async (field) => {
    const { auth, store } = context();
    const cookie = cookieFrom(await auth.login(request(), form));
    store.changeSession((record) => { record[field] = field.endsWith("Hash") || field === "credentialFingerprint" ? "0".repeat(64) : field === "mode" ? "admin" : "unrelated"; });
    await expect(auth.requireSession(request("GET", cookie))).rejects.toMatchObject({ status: 401 });
  });

  it("expires sessions without renewal and invalidates them on credential rotation", async () => {
    const { auth, store, advance, now } = context();
    const cookie = cookieFrom(await auth.login(request(), form));
    const rotated = createAbacusAuth({ store, env: { ...PREVIEW, MEMBERSHIP_PREVIEW_PASSWORD: "rotated-synthetic-only" }, now });
    await expect(rotated.requireSession(request("GET", cookie))).rejects.toMatchObject({ status: 401 });
    const rotatedSecret = createAbacusAuth({ store, env: { ...PREVIEW, MEMBERSHIP_PREVIEW_SECRET: "rotated-synthetic-secret-only" }, now });
    await expect(rotatedSecret.requireSession(request("GET", cookie))).rejects.toMatchObject({ status: 401 });
    advance(ABACUS_SESSION_TTL_SECONDS * 1000);
    await expect(auth.requireSession(request("GET", cookie))).rejects.toMatchObject({ status: 401 });
  });

  it("binds tokens to the configured origin even if two environments share credentials and storage", async () => {
    const { auth, store, now } = context();
    const cookie = cookieFrom(await auth.login(request(), form));
    const other = createAbacusAuth({ store, env: { ...PREVIEW, ABACUS_PUBLIC_ORIGIN: "https://other.invalid" }, now });
    await expect(other.requireSession(new Request("https://other.invalid/api/abacus/data", {
      headers: { host: "other.invalid", cookie },
    }))).rejects.toMatchObject({ status: 401 });
  });

  it("persists logout revocation and rejects copied cookies across fresh instances", async () => {
    const { auth, store, now } = context();
    const cookie = cookieFrom(await auth.login(request(), form));
    store.conflicts = 1;
    const result = await auth.logout(request("POST", cookie));
    expect(result.setCookie).toContain("Max-Age=0");
    const second = createAbacusAuth({ store, env: PREVIEW, now });
    await expect(second.requireSession(request("GET", cookie))).rejects.toMatchObject({ status: 401 });
    expect((await second.logout(request("POST", cookie))).setCookie).toContain("Max-Age=0");
  });

  it("expires a missing cookie without store access", async () => {
    const { auth, store } = context();
    expect((await auth.logout(request())).setCookie).toContain("Max-Age=0");
    expect(store.reads + store.writes).toBe(0);
  });

  it.each(hostileHeaders)("rejects hostile login origin/host without storage (%#)", async (headers) => {
    const { auth, store } = context();
    await expect(auth.login(request("POST", undefined, headers), form)).rejects.toMatchObject({ status: 403 });
    expect(store.reads + store.writes).toBe(0);
  });

  it("requires Origin on writes and ignores spoofed forwarded headers", async () => {
    const { auth, store } = context();
    const missingOrigin = new Request(`${ORIGIN}/api/abacus/auth`, { method: "POST", headers: { host: "example.invalid" } });
    await expect(auth.login(missingOrigin, form)).rejects.toMatchObject({ status: 403 });
    const wrongUrl = new Request("https://foreign.invalid/api/abacus/auth", {
      method: "POST", headers: { host: "example.invalid", origin: ORIGIN, "x-forwarded-host": "example.invalid" },
    });
    await expect(auth.login(wrongUrl, form)).rejects.toMatchObject({ status: 403 });
    expect(store.writes).toBe(0);
    const cookie = cookieFrom(await auth.login(request(), form));
    const write = new Request(`${ORIGIN}/api/abacus/data`, { method: "PUT", headers: { host: "example.invalid", cookie } });
    await expect(auth.requireSession(write)).rejects.toMatchObject({ status: 403 });
    await expect(auth.requireSession(request("GET", cookie, { origin: "https://foreign.invalid" }))).rejects.toMatchObject({ status: 403 });
  });

  it("requires the configured admin username and returns only an actor digest", async () => {
    const store = new MemoryStore();
    const auth = createAbacusAuth({ store, env: ADMIN });
    await expect(auth.login(request(), { password: ADMIN.ADMIN_PASSWORD })).rejects.toMatchObject({ status: 401 });
    const result = await auth.login(request(), { username: ADMIN.ADMIN_USERNAME, password: ADMIN.ADMIN_PASSWORD });
    expect(result.actor).toMatch(/^admin:[a-f0-9]{24}$/);
    expect(result.actor).not.toContain(ADMIN.ADMIN_USERNAME);
    await expect(auth.requireSession(request("GET", cookieFrom(result)))).resolves.toMatchObject({ actor: result.actor });
  });

  it("reserves rate-limit slots atomically across instances and spoofed IPs", async () => {
    const { store, now, advance } = context();
    const results = await Promise.allSettled(Array.from({ length: 16 }, (_, index) =>
      createAbacusAuth({ store, env: PREVIEW, now }).login(request("POST", undefined, { "x-forwarded-for": `192.0.2.${index}` }), { password: "wrong-synthetic" })));
    const failures = results.map((result) => result.status === "rejected" ? result.reason.status : 200);
    expect(failures.filter((status) => status === 401)).toHaveLength(8);
    expect(failures.filter((status) => status === 429)).toHaveLength(8);
    const fresh = createAbacusAuth({ store, env: PREVIEW, now });
    await expect(fresh.login(request(), form)).rejects.toMatchObject({ status: 429 });
    advance(10 * 60 * 1000);
    await expect(fresh.login(request(), form)).resolves.toHaveProperty("setCookie");
  });

  it("fails closed on persistence errors and leaves cookies available for local clearing", async () => {
    const { auth, store } = context();
    const cookie = cookieFrom(await auth.login(request(), form));
    store.fail = true;
    for (const action of [() => auth.requireSession(request("GET", cookie)), () => auth.logout(request("POST", cookie)), () => auth.login(request(), form)]) {
      await expect(action()).rejects.toMatchObject({ status: 503, message: "auth_store_unavailable" });
    }
    expect(auth.expiredCookie()).toContain("Max-Age=0");
  });

  it("rejects corrupt persistent records without overwriting them", async () => {
    const { auth, store } = context();
    const cookie = cookieFrom(await auth.login(request(), form));
    store.changeSession((record) => { record.expiresAt = "not-a-timestamp"; });
    const writes = store.writes;
    await expect(auth.requireSession(request("GET", cookie))).rejects.toMatchObject({ status: 503 });
    expect(store.writes).toBe(writes);
  });
});
