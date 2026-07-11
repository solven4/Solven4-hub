// Server-side Supabase client (Vercel API functions only — uses service role)
// NEVER import this in React components — it exposes the service role key
import { createClient } from '@supabase/supabase-js';

let _client = null;

export function getSupabaseServer() {
  if (!_client) {
    _client = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _client;
}
