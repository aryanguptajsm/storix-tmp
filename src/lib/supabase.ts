import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function createClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(
      "SUPABASE_CONFIG_WARNING: Missing client-side Supabase environment variables. Using fallback values for build safety."
    );
  }

  client = createBrowserClient(
    url,
    anonKey,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Reduce lock contention warnings in development/Strict Mode
        storageKey: `sb-${url.split('.')[0].split('//')[1]}-auth-token`,
      }
    }
  );

  return client;
}

// For backward compatibility: lazily initialize the client
export const supabase = {
  get auth() { return createClient().auth; },
  get storage() { return createClient().storage; },
  from(relation: string) { return createClient().from(relation); },
  rpc(fn: string, args?: any) { return createClient().rpc(fn, args); },
};

