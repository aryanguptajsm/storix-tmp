import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  store_name: string;
  store_description: string;
  avatar_url: string | null;
  created_at: string;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

let getUserPromise: Promise<any> | null = null;
let cachedUser: any = null;

export async function getUser() {
  if (cachedUser) return cachedUser;
  if (getUserPromise) return getUserPromise;

  getUserPromise = (async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      cachedUser = user;
      return user;
    } catch (err) {
      console.error("getUser error:", err);
      return null;
    } finally {
      getUserPromise = null;
    }
  })();

  return getUserPromise;
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
