import { createClient } from "@supabase/supabase-js";

export const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        persistSession: true,
      },
    },
  );

  return client;
}

export function getAuthRedirectUrl(intent?: "reset" | "signup") {
  if (typeof window === "undefined") return undefined;

  const url = new URL("/auth/callback", window.location.origin);
  if (intent) url.searchParams.set("intent", intent);
  return url.toString();
}
