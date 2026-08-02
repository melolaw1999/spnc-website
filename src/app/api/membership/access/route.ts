import { NextResponse } from "next/server";
import {
  createMembershipPreviewToken,
  getMembershipPreviewPassword,
  getMembershipPreviewSecret,
  MEMBERSHIP_PREVIEW_COOKIE,
  MEMBERSHIP_PREVIEW_TTL_SECONDS,
  sanitizeMembershipPreviewNextPath,
  verifyMembershipPreviewPassword,
} from "@/lib/membership-preview-auth";

export const runtime = "nodejs";

const attemptWindowMs = 10 * 60 * 1000;
const maxAttempts = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

function requestAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

function readAttempt(address: string, now: number) {
  const current = attempts.get(address);
  if (!current || current.resetAt <= now) {
    const fresh = { count: 0, resetAt: now + attemptWindowMs };
    attempts.set(address, fresh);
    return fresh;
  }
  return current;
}

export async function POST(request: Request) {
  const password = getMembershipPreviewPassword();
  const secret = getMembershipPreviewSecret();
  if (!password || !secret) {
    return NextResponse.json({ error: "团队预览暂未开放。" }, { status: 503 });
  }

  const now = Date.now();
  const address = requestAddress(request);
  const attempt = readAttempt(address, now);
  if (attempt.count >= maxAttempts) {
    return NextResponse.json({ error: "尝试次数过多，请10分钟后再试。" }, { status: 429 });
  }

  let body: { password?: unknown; next?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无法读取访问请求。" }, { status: 400 });
  }

  const submittedPassword = typeof body.password === "string" ? body.password.trim() : "";
  if (!(await verifyMembershipPreviewPassword(submittedPassword, password, secret))) {
    attempt.count += 1;
    attempts.set(address, attempt);
    await new Promise((resolve) => setTimeout(resolve, 450));
    return NextResponse.json({ error: "邀请密码不正确，请向项目负责人确认。" }, { status: 401 });
  }

  attempts.delete(address);
  const response = NextResponse.json({ redirectTo: sanitizeMembershipPreviewNextPath(body.next) });
  response.cookies.set({
    name: MEMBERSHIP_PREVIEW_COOKIE,
    value: await createMembershipPreviewToken(secret, now),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MEMBERSHIP_PREVIEW_TTL_SECONDS,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
