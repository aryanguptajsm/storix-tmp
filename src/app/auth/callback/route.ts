import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  if (error) {
    console.error("Supabase OAuth Error:", error, error_description);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!exchangeError) {
      // Ensure the redirect is to a safe relative or internal path
      const redirectUrl = next.startsWith("/") ? `${origin}${next}` : next;
      return NextResponse.redirect(redirectUrl);
    }
    
    console.error("Supabase Auth Code Exchange Error:", exchangeError);
  }

  // Return the user to an error page with instructions
  const errorMessage = code ? "Failed to exchange auth code" : "No auth code provided";
  console.error("Auth Callback Failure:", errorMessage);
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`);
}
