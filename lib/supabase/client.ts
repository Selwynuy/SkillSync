/**
 * Supabase Client-Side Client
 *
 * This client should be used in:
 * - Client components (components with "use client")
 * - Client-side hooks
 * - Browser-only code
 *
 * It uses the ANON_KEY which respects Row Level Security (RLS)
 * Users can only access their own data through RLS policies
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './server';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

/**
 * Client-side Supabase client
 * This client respects RLS policies and is safe to use in the browser
 * Creates a singleton instance to avoid multiple client instances
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Helper function to create a new client instance
 * Use this if you need a fresh client instance for some reason
 */
export const createSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};
