import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, checkApiSecret, verifySessionToken } from "./lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];
// Webhook/cron routes authenticate via their own secret header, not the cookie.
const BYPASS_PREFIXES = ["/api/telegram/", "/api/finance/snapshot", "/api/cron/"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.includes(pathname) || BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Programmatic access (CLI, cron, scripts) via shared secret header.
  const apiSecret = req.headers.get("x-api-secret");
  if (checkApiSecret(apiSecret)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (await verifySessionToken(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
