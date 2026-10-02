import { createHash, createHmac, randomBytes as nodeRandomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { PrivateObjectStore } from "./store";

export const ABACUS_SESSION_COOKIE = "spnc_abacus_session";
export const ABACUS_SESSION_TTL_SECONDS = 8 * 60 * 60;
const AUDIENCE = "spnc-abacus-v1";
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const MAX_CAS_ATTEMPTS = 16;
type AccessMode = "admin" | "membership-preview";
type Environment = Readonly<Record<string, string | undefined>>;

export class AuthError extends Error {
  constructor(public readonly status: number, public readonly code: string) {
    super(code);
    this.name = "AuthError";
  }
}

export type AuthAvailability = {
  enabled: boolean;
  mode: AccessMode | "disabled";
  reason?: string;
  publicOrigin?: string;
};

export type AuthSession = { actor: string; expiresAt: number };
export type LoginInput = { username?: string; password?: string };
export type AbacusAuthOptions = {
  store: PrivateObjectStore;
  env: Environment;
  now?: () => number;
  randomBytes?: (size: number) => Uint8Array;
};

type Configuration = {
  mode: AccessMode;
  publicOrigin: string;
  host: string;
  secure: boolean;
  username: string;
  password: string;
  signingKey: Uint8Array;
  credentialFingerprint: string;
  actor: string;
};

type StoredSession = {
  version: 1;
  audience: string;
  mode: AccessMode;
  actor: string;
  referenceHash: string;
  credentialFingerprint: string;
  createdAt: number;
  expiresAt: number;
  revokedAt: number | null;
};

type AttemptWindow = { version: 1; startsAt: number; expiresAt: number; count: number };
const bytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const fixedTimeEqual = (left: string, right: string) => timingSafeEqual(
  createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest(),
);
const conflict = (error: unknown) => typeof error === "object" && error !== null
  && "code" in error && error.code === "conflict";

function loadConfiguration(env: Environment): Configuration | AuthAvailability {
  const mode = env.ABACUS_ACCESS_MODE;
  if (mode !== "admin" && mode !== "membership-preview") {
    return { enabled: false, mode: "disabled", reason: "access_mode_disabled" };
  }
  const unavailable = (reason: string): AuthAvailability => ({ enabled: false, mode, reason });
  if (!env.ABACUS_PUBLIC_ORIGIN) return unavailable("public_origin_required");
  let origin: URL;
  try { origin = new URL(env.ABACUS_PUBLIC_ORIGIN); } catch { return unavailable("public_origin_invalid"); }
  if (origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) {
    return unavailable("public_origin_invalid");
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  if (origin.protocol !== "https:" && !(origin.protocol === "http:" && local && env.NODE_ENV !== "production")) {
    return unavailable("https_required");
  }
  const username = mode === "admin" ? env.ADMIN_USERNAME : "shared-preview";
  const password = mode === "admin" ? env.ADMIN_PASSWORD : env.MEMBERSHIP_PREVIEW_PASSWORD;
  const existingSecret = mode === "membership-preview" ? env.MEMBERSHIP_PREVIEW_SECRET : undefined;
  if (!username || !password || (mode === "membership-preview" && !existingSecret)) {
    return unavailable("existing_credentials_required");
  }
  // Reuse configured credentials only. Never import the preview module's development fallbacks.
  const signingKey = mode === "membership-preview"
    ? new TextEncoder().encode(existingSecret!)
    : scryptSync(password, `${AUDIENCE}:admin-key:${username}`, 32);
  const credentialFingerprint = createHmac("sha256", signingKey)
    .update(JSON.stringify([AUDIENCE, origin.origin, mode, username, password])).digest("hex");
  return {
    mode, publicOrigin: origin.origin, host: origin.host, secure: origin.protocol === "https:",
    username, password, signingKey, credentialFingerprint,
    actor: `${mode}:${digest(username).slice(0, 24)}`,
  };
}

function parseJson(value: Uint8Array): unknown {
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(value)); }
  catch { throw new AuthError(503, "auth_store_invalid"); }
}

function readSession(value: Uint8Array): StoredSession {
  const raw = parseJson(value);
  if (!raw || typeof raw !== "object") throw new AuthError(503, "auth_store_invalid");
  const record = raw as StoredSession;
  if (record.version !== 1 || typeof record.audience !== "string"
      || !["admin", "membership-preview"].includes(record.mode) || typeof record.actor !== "string"
      || typeof record.referenceHash !== "string" || !/^[a-f0-9]{64}$/.test(record.referenceHash)
      || typeof record.credentialFingerprint !== "string" || !/^[a-f0-9]{64}$/.test(record.credentialFingerprint)
      || !Number.isSafeInteger(record.createdAt) || !Number.isSafeInteger(record.expiresAt)
      || (record.revokedAt !== null && !Number.isSafeInteger(record.revokedAt))) {
    throw new AuthError(503, "auth_store_invalid");
  }
  return record;
}

function readWindow(value: Uint8Array): AttemptWindow {
  const raw = parseJson(value);
  if (!raw || typeof raw !== "object") throw new AuthError(503, "auth_store_invalid");
  const record = raw as AttemptWindow;
  if (record.version !== 1 || !Number.isSafeInteger(record.startsAt) || !Number.isSafeInteger(record.expiresAt)
      || record.expiresAt - record.startsAt !== ATTEMPT_WINDOW_MS
      || !Number.isSafeInteger(record.count) || record.count < 1 || record.count > MAX_ATTEMPTS) {
    throw new AuthError(503, "auth_store_invalid");
  }
  return record;
}

export function createAbacusAuth(options: AbacusAuthOptions) {
  const configuration = loadConfiguration(options.env);
  const now = options.now ?? Date.now;
  const randomBytes = options.randomBytes ?? nodeRandomBytes;
  const { store } = options;

  function config(): Configuration {
    if (!("signingKey" in configuration)) throw new AuthError(503, "auth_unavailable");
    return configuration;
  }

  function availability(): AuthAvailability {
    if (!("signingKey" in configuration)) return { ...configuration };
    return { enabled: true, mode: configuration.mode, publicOrigin: configuration.publicOrigin };
  }

  function assertHost(request: Request) {
    const current = config();
    let requestUrl: URL;
    try { requestUrl = new URL(request.url); } catch { throw new AuthError(403, "origin_rejected"); }
    if (requestUrl.origin !== current.publicOrigin || request.headers.get("host") !== current.host
        || requestUrl.username || requestUrl.password) throw new AuthError(403, "origin_rejected");
    const suppliedOrigin = request.headers.get("origin");
    if (suppliedOrigin !== null && suppliedOrigin !== current.publicOrigin) throw new AuthError(403, "origin_rejected");
    if (request.headers.get("sec-fetch-site") === "cross-site") throw new AuthError(403, "origin_rejected");
  }

  function assertSameOrigin(request: Request) {
    assertHost(request);
    if (request.headers.get("origin") !== config().publicOrigin) throw new AuthError(403, "origin_rejected");
  }

  const signReference = (reference: string) => createHmac("sha256", config().signingKey)
    .update(`${AUDIENCE}:${config().publicOrigin}:session:v1:${reference}`).digest("base64url");

  function referenceFromRequest(request: Request): string | null {
    const entries = (request.headers.get("cookie") ?? "").split(";")
      .map((entry) => entry.trim()).filter((entry) => entry.startsWith(`${ABACUS_SESSION_COOKIE}=`));
    if (entries.length !== 1) return null;
    const token = entries[0].slice(ABACUS_SESSION_COOKIE.length + 1);
    const match = /^v1\.([a-f0-9]{64})\.([A-Za-z0-9_-]{43})$/.exec(token);
    if (!match || !fixedTimeEqual(match[2], signReference(match[1]))) return null;
    return match[1];
  }

  const sessionPath = (reference: string) => `abacus/v1/auth/sessions/${digest(reference)}.json`;
  const cookieAttributes = () => `Path=/; HttpOnly; SameSite=Strict${"secure" in configuration && configuration.secure ? "; Secure" : ""}`;
  const expiredCookie = () => `${ABACUS_SESSION_COOKIE}=; ${cookieAttributes()}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  async function storeCall<T>(operation: () => Promise<T>): Promise<T> {
    try { return await operation(); }
    catch (error) {
      if (error instanceof AuthError || conflict(error)) throw error;
      throw new AuthError(503, "auth_store_unavailable");
    }
  }

  async function reserveLoginAttempt(timestamp: number) {
    const current = config();
    // One persistent bucket per configured gate: spoofed forwarding/IP headers cannot evade it.
    const path = `abacus/v1/auth/limits/${digest(`${current.publicOrigin}:${current.mode}`)}.json`;
    for (let attempt = 0; attempt < MAX_CAS_ATTEMPTS; attempt += 1) {
      const existing = await storeCall(() => store.get(path));
      const previous = existing ? readWindow(existing.bytes) : null;
      if (previous && previous.startsAt > timestamp) throw new AuthError(503, "auth_store_invalid");
      const active = previous && previous.expiresAt > timestamp;
      if (active && previous.count >= MAX_ATTEMPTS) throw new AuthError(429, "login_rate_limited");
      const next: AttemptWindow = active
        ? { ...previous, count: previous.count + 1 }
        : { version: 1, startsAt: timestamp, expiresAt: timestamp + ATTEMPT_WINDOW_MS, count: 1 };
      try {
        await storeCall(() => existing
          ? store.compareAndSwap(path, bytes(next), existing.etag) : store.create(path, bytes(next)));
        return;
      } catch (error) { if (!conflict(error)) throw error; }
    }
    throw new AuthError(503, "auth_store_busy");
  }

  function validSession(record: StoredSession, reference: string, timestamp: number): boolean {
    const current = config();
    return record.audience === AUDIENCE && record.mode === current.mode && record.actor === current.actor
      && fixedTimeEqual(record.referenceHash, digest(reference))
      && fixedTimeEqual(record.credentialFingerprint, current.credentialFingerprint)
      && record.revokedAt === null && record.createdAt <= timestamp && record.expiresAt > timestamp
      && record.expiresAt - record.createdAt === ABACUS_SESSION_TTL_SECONDS * 1000;
  }

  async function login(request: Request, input: LoginInput): Promise<AuthSession & { setCookie: string }> {
    assertSameOrigin(request);
    if (request.method !== "POST") throw new AuthError(405, "method_rejected");
    if (!input || typeof input !== "object" || typeof input.password !== "string" || input.password.length > 1024
        || (input.username !== undefined && (typeof input.username !== "string" || input.username.length > 256))) {
      throw new AuthError(400, "login_input_invalid");
    }
    const current = config();
    const timestamp = now();
    await reserveLoginAttempt(timestamp);
    const passwordMatches = fixedTimeEqual(input.password, current.password);
    const usernameMatches = fixedTimeEqual(input.username ?? "", current.username);
    if (!passwordMatches || (current.mode === "admin" && !usernameMatches)) throw new AuthError(401, "login_rejected");
    const expiresAt = timestamp + ABACUS_SESSION_TTL_SECONDS * 1000;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const referenceBytes = randomBytes(32);
      if (referenceBytes.length !== 32) throw new AuthError(503, "auth_random_unavailable");
      const reference = Buffer.from(referenceBytes).toString("hex");
      const record: StoredSession = {
        version: 1, audience: AUDIENCE, mode: current.mode, actor: current.actor,
        referenceHash: digest(reference), credentialFingerprint: current.credentialFingerprint,
        createdAt: timestamp, expiresAt, revokedAt: null,
      };
      try {
        await storeCall(() => store.create(sessionPath(reference), bytes(record)));
        return {
          actor: current.actor, expiresAt,
          setCookie: `${ABACUS_SESSION_COOKIE}=v1.${reference}.${signReference(reference)}; ${cookieAttributes()}; Max-Age=${ABACUS_SESSION_TTL_SECONDS}; Expires=${new Date(expiresAt).toUTCString()}`,
        };
      } catch (error) { if (!conflict(error)) throw error; }
    }
    throw new AuthError(503, "auth_session_collision");
  }

  async function requireSession(request: Request): Promise<AuthSession> {
    assertHost(request);
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) assertSameOrigin(request);
    const reference = referenceFromRequest(request);
    if (!reference) throw new AuthError(401, "session_required");
    const stored = await storeCall(() => store.get(sessionPath(reference)));
    if (!stored) throw new AuthError(401, "session_required");
    const record = readSession(stored.bytes);
    if (!validSession(record, reference, now())) throw new AuthError(401, "session_required");
    return { actor: record.actor, expiresAt: record.expiresAt };
  }

  async function logout(request: Request): Promise<{ setCookie: string; actor?: string }> {
    assertSameOrigin(request);
    if (request.method !== "POST") throw new AuthError(405, "method_rejected");
    const reference = referenceFromRequest(request);
    if (!reference) return { setCookie: expiredCookie() };
    const path = sessionPath(reference);
    for (let attempt = 0; attempt < MAX_CAS_ATTEMPTS; attempt += 1) {
      const stored = await storeCall(() => store.get(path));
      if (!stored) return { setCookie: expiredCookie() };
      const record = readSession(stored.bytes);
      if (record.revokedAt !== null) return { setCookie: expiredCookie() };
      if (!validSession(record, reference, now())) return { setCookie: expiredCookie() };
      try {
        await storeCall(() => store.compareAndSwap(path, bytes({ ...record, revokedAt: now() }), stored.etag));
        return { setCookie: expiredCookie(), actor: record.actor };
      } catch (error) { if (!conflict(error)) throw error; }
    }
    throw new AuthError(503, "auth_store_busy");
  }

  return { availability, login, requireSession, logout, assertSameOrigin, expiredCookie };
}
