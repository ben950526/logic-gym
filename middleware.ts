import { NextResponse, type NextRequest } from "next/server";

/**
 * V3（互動謎題本）上線後，舊的星球地圖、登入、價目頁先不開放，全部導回 /play。
 * 舊程式都還在（app/ 底下），要恢復時把這個檔案還原成 git 裡 2026-11-19 以前的版本即可。
 * 帳號與付款會照 docs/account-design.md 重新做。
 */
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL("/play", request.url));
}

export const config = {
  matcher: [
    "/old-home",
    "/login",
    "/pricing/:path*",
    "/galaxy/:path*",
    "/planet/:path*",
    "/stage/:path*",
    "/practice/:path*",
    "/competition/:path*",
    "/universe/:path*",
    "/story/:path*",
    "/dev/:path*",
  ],
};
