import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  if (resendClient) {
    return resendClient;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

export function getResendFromEmail() {
  return process.env.RESEND_FROM_EMAIL || "Storix <onboarding@resend.dev>";
}
