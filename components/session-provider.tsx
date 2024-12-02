"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 排除不需要认证的路径
    const publicPaths = ["/auth/signin", "/auth/signup", "/auth/error"];
    if (
      status === "unauthenticated" &&
      !publicPaths.includes(pathname)
    ) {
      router.push("/auth/signin");
    }
  }, [status, router, pathname]);

  // 显示加载状态
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return children;
} 