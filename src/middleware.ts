import { NextResponse, type NextRequest } from "next/server";
import {
  getMembershipPreviewSecret,
  MEMBERSHIP_PREVIEW_COOKIE,
  verifyMembershipPreviewToken,
} from "@/lib/membership-preview-auth";

function requireTicketAdministrator(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return new NextResponse("管理后台尚未配置。", { status: 503 });

  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Basic ")) {
    try {
      const decoded = atob(authorization.slice(6));
      if (decoded === `${username}:${password}`) return NextResponse.next();
    } catch {
      // 继续返回授权提示。
    }
  }
  return new NextResponse("需要管理员身份。", {
    status: 401,
    headers: { "www-authenticate": 'Basic realm="SPNC Tickets", charset="UTF-8"' },
  });
}

function isTicketAdministration(pathname: string) {
  return pathname.startsWith("/admin/tickets") || pathname.startsWith("/api/admin");
}

function isMembershipPreview(pathname: string) {
  return pathname === "/membership"
    || pathname.startsWith("/membership/")
    || pathname === "/admin/membership"
    || pathname.startsWith("/admin/membership/")
    || pathname.startsWith("/api/membership/");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (isTicketAdministration(pathname)) return requireTicketAdministrator(request);
  if (!isMembershipPreview(pathname)) return NextResponse.next();
  if (pathname === "/membership/access" || pathname === "/api/membership/access") return NextResponse.next();

  const secret = getMembershipPreviewSecret();
  const token = request.cookies.get(MEMBERSHIP_PREVIEW_COOKIE)?.value;
  if (await verifyMembershipPreviewToken(token, secret)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "请先通过团队邀请验证。" }, { status: 401 });
  }

  const accessUrl = new URL("/membership/access", request.url);
  accessUrl.searchParams.set("next", `${pathname}${search}`);
  if (!secret) accessUrl.searchParams.set("unavailable", "1");
  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: [
    "/admin/tickets/:path*",
    "/api/admin/:path*",
    "/membership/:path*",
    "/admin/membership/:path*",
    "/api/membership/:path*",
  ],
};
