import { createHmac, timingSafeEqual } from "node:crypto";

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

export function isAdminAuthorized(request: Request) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return false;
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return false;

  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;
    return safeEqual(decoded.slice(0, separator), username) && safeEqual(decoded.slice(separator + 1), password);
  } catch {
    return false;
  }
}

export const markerHash = (value: string) => {
  const salt = process.env.TICKET_HASH_SALT;
  if (!salt) throw new Error("TICKET_HASH_SALT is not configured");
  return createHmac("sha256", salt).update(value).digest("hex");
};

export const anonymousRequestHash = (value: string) => markerHash(`request:${value}`).slice(0, 16);

export const isSameOriginRequest = (request: Request) => {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
};

export const createTicketId = (now = new Date(), entropy = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase()) => {
  const day = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `SPNC-${day}-${entropy}`;
};
