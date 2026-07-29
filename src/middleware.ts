import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
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

export const config = { matcher: ["/admin/tickets/:path*", "/api/admin/:path*"] };
