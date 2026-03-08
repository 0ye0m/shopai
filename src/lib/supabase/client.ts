// Supabase Browser Client - For use in client components
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton pattern for browser client
let client: ReturnType<typeof createClient> | undefined;

export function getSupabaseClient() {
  if (client) {
    return client;
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}

// Export for convenience
export const supabase = getSupabaseClient();
