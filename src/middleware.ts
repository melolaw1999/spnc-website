import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (process.env.ENABLE_MEMBER_SYSTEM === "true") return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "该生产部署未启用会员与后台服务" }, { status: 404 });
  }
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*", "/login", "/api/:path*"],
};
