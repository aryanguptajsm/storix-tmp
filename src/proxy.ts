import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/middleware";

export async function proxy(request: NextRequest) {
  // First, verify auth sessions
  const res = await updateSession(request);

  // Subdomain routing logic
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  
  // Strip the primary domain depending on environment
  const currentHost = process.env.NODE_ENV === "production"
      ? hostname.replace(`.storix.in`, "") // Production domain
      : hostname.replace(`.localhost:3000`, ""); // Local dev domain

  // List of paths that should NOT be rewritten to a subdomain store
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
    "/api"
  ];

  const isReservedPath = reservedPaths.some(path => 
    url.pathname === path || url.pathname.startsWith(`${path}/`)
  );

  // If there's a valid subdomain (not the root domain or www)
  if (
    !isReservedPath &&
    currentHost !== "storix.in" &&
    currentHost !== "localhost:3000" &&
    currentHost !== "www.storix.in" &&
    currentHost !== "www" &&
    currentHost !== hostname // Just in case nothing was replaced
  ) {
    // We only rewrite if updateSession didn't issue a redirect (status 3xx)
    if (res.status === 200) {
      if (url.pathname === "/") {
        return NextResponse.rewrite(new URL(`/store/${currentHost}${url.search}`, request.url));
      } else {
        return NextResponse.rewrite(new URL(`/store/${currentHost}${url.pathname}${url.search}`, request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|auth/callback|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
