import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function createClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(
      "SUPABASE_CONFIG_WARNING: Missing or invalid Supabase environment variables. Using dummy values for build."
    );
  }

  client = createBrowserClient(
    url,
    anonKey
  );

  return client;
}

// For backward compatibility while I refactor
export const supabase = client || createClient();

