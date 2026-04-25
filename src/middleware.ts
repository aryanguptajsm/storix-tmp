import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/auth-middleware";

export async function middleware(request: NextRequest) {
  // Auth session refresh (handles cookies + redirects)
  const res = await updateSession(request);

  // Subdomain routing logic
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Strip the primary domain depending on environment
  const currentHost =
    process.env.NODE_ENV === "production"
      ? hostname.replace(`.storix.in`, "") // Production domain
      : hostname.replace(`.localhost:3000`, ""); // Local dev domain

  // Paths that should NOT be rewritten to a subdomain store
  const reservedPaths = [
    "/dashboard",
    "/login",
    "/signup",
    "/pricing",
    "/terms",
    "/privacy",
    "/storix",
    "/store",
    "/auth",
    "/api",
  ];

  const isReservedPath = reservedPaths.some(
    (path) =>
      url.pathname === path || url.pathname.startsWith(`${path}/`)
  );

  // If there's a valid subdomain (not the root domain or www)
  if (
    !isReservedPath &&
    currentHost !== "storix.in" &&
    currentHost !== "localhost:3000" &&
    currentHost !== "www.storix.in" &&
    currentHost !== "www" &&
    currentHost !== hostname
  ) {
    if (res.status === 200) {
      const storePath =
        url.pathname === "/"
          ? `/store/${currentHost}${url.search}`
          : `/store/${currentHost}${url.pathname}${url.search}`;
      return NextResponse.rewrite(new URL(storePath, request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|auth/callback|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
