import { supabase } from "./supabase";
export type { UserProfile } from "./types";
import type { UserProfile } from "./types";

let userPromise: Promise<any> | null = null;

export async function signUp(email: string, password: string) {
  userPromise = null;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  userPromise = null;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle(next?: string) {
  userPromise = null;
  const url = new URL(`${window.location.origin}/auth/callback`);
  if (next) url.searchParams.set("next", next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: url.toString(),
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  userPromise = null;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Singleton promise for getUser to prevent concurrent calls


export async function getUser() {
  if (userPromise) return userPromise;

  userPromise = (async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("getUser error (API):", error);
        return null;
      }
      return user;
    } catch (error) {
       console.error("getUser fetch error:", error);
       return null;
    } finally {
      // Clear the promise after a short delay to allow fresh checks later
      // but keep it long enough to catch concurrent calls during a single page load
      setTimeout(() => { userPromise = null; }, 500);
    }
  })();

  return userPromise;
}


export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) return null;
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
