// Supabase Server Client - For use in API routes and server components
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client with service role key - bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Server client with user context - respects RLS
export async function createServerClient() {
  const cookieStore = await cookies();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        // Pass cookies for auth context
        cookie: cookieStore.toString(),
      },
    },
  });
}

// Helper to get current user from Supabase auth
export async function getSupabaseUser() {
  const client = await createServerClient();
  const { data: { user }, error } = await client.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}
