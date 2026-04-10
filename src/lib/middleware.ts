import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  
  // Optimization: Only call getUser if we have a session cookie
  // This prevents noisy 'Auth session missing!' errors in the console
  const hasSession = request.cookies.getAll().some(cookie => cookie.name.includes('auth-token') || cookie.name.startsWith('sb-'));
  
  if (hasSession) {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      user = supabaseUser;
    } catch (error) {
      // We don't want to log this on every request unless it's a real failure
      console.error("Middleware Auth Error:", error);
    }
  }

  // Redirect to login if user is not authenticated and trying to access dashboard
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if user is authenticated and trying to access root, login, or signup
  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup" || request.nextUrl.pathname === "/";
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
