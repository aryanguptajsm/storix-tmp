import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/auth-middleware";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Fast-path: skip proxy logic entirely for static assets & API routes
  // The matcher config already excludes most, but this is a safety net
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Subdomain routing logic — check BEFORE auth to avoid unnecessary Supabase calls
  const hostname = request.headers.get("host") || "";

  const currentHost =
    process.env.NODE_ENV === "production"
      ? hostname.replace(`.storix.in`, "")
      : hostname.replace(`.localhost:3000`, "");

  // Check if this is a subdomain request
  const isSubdomain =
    currentHost !== "storix.in" &&
    currentHost !== "localhost:3000" &&
    currentHost !== "www.storix.in" &&
    currentHost !== "www" &&
    currentHost !== hostname;

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
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Only run auth middleware for pages that actually need it
  // (dashboard, login, signup, root) — not for public pages or subdomain stores
  const needsAuth =
    pathname.startsWith("/dashboard") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/";

  if (needsAuth) {
    const res = await updateSession(request);

    // If auth middleware redirected, return immediately
    if (res.status !== 200) {
      return res;
    }

    // Handle subdomain rewrite after auth
    if (!isReservedPath && isSubdomain) {
      const storePath =
        pathname === "/"
          ? `/store/${currentHost}${url.search}`
          : `/store/${currentHost}${pathname}${url.search}`;
      return NextResponse.rewrite(new URL(storePath, request.url));
    }

    return res;
  }

  // For non-auth pages, handle subdomain rewrite directly (no Supabase call)
  if (!isReservedPath && isSubdomain) {
    const storePath =
      pathname === "/"
        ? `/store/${currentHost}${url.search}`
        : `/store/${currentHost}${pathname}${url.search}`;
    return NextResponse.rewrite(new URL(storePath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|auth/callback|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
