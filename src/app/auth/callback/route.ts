import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  // Determine the base origin for redirection
  // Priority: X-Forwarded-Host > requestUrl.origin > NEXT_PUBLIC_SITE_URL
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const origin = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : requestUrl.origin || "http://localhost:3000";

  // Handle common OAuth/Supabase errors early
  if (error) {
    console.error("Supabase OAuth Error URL Param:", { error, error_description });
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!exchangeError) {
      const redirectUrl = next.startsWith("/") ? `${origin}${next}` : next;
      console.log("Auth Callback Success. Redirecting to:", redirectUrl);
      return NextResponse.redirect(redirectUrl);
    }
    
    console.error("Supabase Auth Code Exchange Error:", exchangeError);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
  }

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "magiclink" | "recovery" | "invite" | "email_change" | "email",
    });

    if (!verifyError) {
      const redirectUrl = next.startsWith("/") ? `${origin}${next}` : next;
      return NextResponse.redirect(redirectUrl);
    }

    console.error("Supabase OTP Verification Error:", verifyError);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(verifyError.message)}`);
  }

  // Handle cases where no code is present
  const errorMessage = "No authentication code provided. Please try logging in again.";
  console.error("Auth Callback Failure:", errorMessage);
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`);
}
