import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // 检查用户状态
  if (token) {
    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { status: true, role: true },
    });

    if (user?.status !== "ACTIVE") {
      return NextResponse.redirect(
        new URL("/auth/signin?error=AccountInactive", request.url)
      );
    }

    // 检查管理员路由
    if (request.nextUrl.pathname.startsWith("/admin") && user.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/auth/signin?error=AccessDenied", request.url)
      );
    }
  }

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isPublicPath = ["/auth/signin", "/auth/signup", "/auth/error"].includes(
    request.nextUrl.pathname
  );

  // 处理会话过期
  if (token?.exp && Date.now() >= token.exp * 1000) {
    // 会话已过期
    if (!isPublicPath) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=TokenExpired", request.url)
      );
    }
  }

  if (isAuthPage) {
    if (token && !isPublicPath) {
      // 已登录用户访问登录页面，重定向到首页
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 保护需要认证的路由
  const isProtectedRoute = !isPublicPath;
  if (isProtectedRoute && !token) {
    // 未登录用户访问受保护页面，重定向到登录页
    return NextResponse.redirect(
      new URL("/auth/signin?error=SessionRequired", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 