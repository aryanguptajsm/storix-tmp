import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getResendClient, getResendFromEmail } from "@/lib/resend";

type SignupPayload = {
  email?: string;
  password?: string;
  username?: string;
  storeName?: string;
};

function getBaseUrl(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return requestUrl.origin.replace(/\/$/, "");
}

function normalizeUsername(username: string) {
  return username.toLowerCase().trim().replace(/\s+/g, "");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupPayload;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const normalizedUsername = body.username ? normalizeUsername(body.username) : "";
    const storeName = body.storeName?.trim() || `${body.username?.trim() || "My"} Store`;

    if (!email || !password || !normalizedUsername) {
      return NextResponse.json(
        { error: "Email, password, and username are required." },
        { status: 400 }
      );
    }

    if (normalizedUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { data: existingProfile, error: usernameLookupError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", normalizedUsername)
      .maybeSingle();

    if (usernameLookupError) {
      throw usernameLookupError;
    }

    if (existingProfile) {
      return NextResponse.json(
        { error: "Username is already taken." },
        { status: 409 }
      );
    }

    const redirectTo = `${getBaseUrl(request)}/auth/callback?next=/dashboard`;
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        redirectTo,
        data: {
          username: normalizedUsername,
          store_name: storeName,
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Signup failed." },
        { status: 400 }
      );
    }

    const userId = data.user?.id;
    const actionLink = data.properties?.action_link;

    if (!userId || !actionLink) {
      return NextResponse.json(
        { error: "Could not generate a verification link." },
        { status: 500 }
      );
    }

    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({
        username: normalizedUsername,
        store_name: storeName,
      })
      .eq("id", userId);

    if (profileUpdateError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: profileUpdateError.message || "Could not prepare your account." },
        { status: 400 }
      );
    }

    const resend = getResendClient();
    const emailResult = await resend.emails.send({
      from: getResendFromEmail(),
      to: email,
      subject: "Verify your Storix account",
      html: `
        <div style="font-family: Arial, sans-serif; background: #020205; color: #f5f5f5; padding: 32px;">
          <div style="max-width: 560px; margin: 0 auto; background: #0b0b10; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px;">
            <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #7dd3fc;">Storix</p>
            <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2;">Confirm your email</h1>
            <p style="margin: 0 0 24px; color: rgba(255,255,255,0.72); line-height: 1.6;">
              Click the button below to verify your email address and finish setting up your Storix account.
            </p>
            <a href="${actionLink}" style="display: inline-block; padding: 14px 22px; border-radius: 999px; background: #10b981; color: #020205; text-decoration: none; font-weight: 700;">
              Verify email
            </a>
            <p style="margin: 24px 0 0; color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.6;">
              If the button does not work, copy and paste this link into your browser:
            </p>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.72); font-size: 13px; line-height: 1.6; word-break: break-all;">
              ${actionLink}
            </p>
          </div>
        </div>
      `,
    });

    if (emailResult.error) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: emailResult.error.message || "Could not send verification email." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      requiresEmailVerification: true,
      email,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected signup error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
