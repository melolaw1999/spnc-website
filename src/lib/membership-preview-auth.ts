export const MEMBERSHIP_PREVIEW_COOKIE = "spnc_membership_preview";
export const MEMBERSHIP_PREVIEW_TTL_SECONDS = 7 * 24 * 60 * 60;

const encoder = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(left: string, right: string) {
  const length = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

export function getMembershipPreviewPassword() {
  if (process.env.MEMBERSHIP_PREVIEW_PASSWORD) return process.env.MEMBERSHIP_PREVIEW_PASSWORD;
  return process.env.NODE_ENV === "production" ? "" : "88886666";
}

export function getMembershipPreviewSecret() {
  if (process.env.MEMBERSHIP_PREVIEW_SECRET) return process.env.MEMBERSHIP_PREVIEW_SECRET;
  return process.env.NODE_ENV === "production" ? "" : "spnc-local-membership-preview-secret";
}

export async function verifyMembershipPreviewPassword(input: string, expected: string, secret: string) {
  if (!input || !expected || !secret) return false;
  const [inputSignature, expectedSignature] = await Promise.all([
    sign(`password:${input}`, secret),
    sign(`password:${expected}`, secret),
  ]);
  return constantTimeEqual(inputSignature, expectedSignature);
}

export async function createMembershipPreviewToken(
  secret: string,
  now = Date.now(),
  ttlSeconds = MEMBERSHIP_PREVIEW_TTL_SECONDS,
) {
  if (!secret) throw new Error("Membership preview secret is not configured.");
  const expiresAt = now + ttlSeconds * 1000;
  return `${expiresAt}.${await sign(`preview:${expiresAt}`, secret)}`;
}

export async function verifyMembershipPreviewToken(token: string | undefined, secret: string, now = Date.now()) {
  if (!token || !secret) return false;
  const separator = token.indexOf(".");
  if (separator < 1) return false;
  const expiresText = token.slice(0, separator);
  const providedSignature = token.slice(separator + 1);
  const expiresAt = Number(expiresText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;
  const expectedSignature = await sign(`preview:${expiresAt}`, secret);
  return constantTimeEqual(providedSignature, expectedSignature);
}

export function sanitizeMembershipPreviewNextPath(value: unknown) {
  if (typeof value !== "string") return "/membership";
  if (value === "/membership" || value.startsWith("/membership/")) return value;
  if (value === "/admin/membership" || value.startsWith("/admin/membership/")) return value;
  return "/membership";
}
