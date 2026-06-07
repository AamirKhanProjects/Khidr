import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Server-only Supabase client using the SERVICE ROLE key. This bypasses RLS, so
 * it must NEVER be imported into client components or the mobile app. The
 * "server-only" import above makes a client import a build error.
 */
let _client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
