/**
 * Supabase Utilities - Main Export
 *
 * This file provides convenient exports for Supabase clients
 * Choose the right client based on your use case:
 *
 * - Server-side (API routes, Server Components):
 *   import { supabaseAdmin, supabaseServer } from '@/lib/supabase'
 *
 * - Client-side (Client Components):
 *   import { supabase } from '@/lib/supabase'
 */

// Server-side clients (only import these in server code)
export { supabaseAdmin, supabaseServer, type Database } from './server';

// Client-side client (safe to import in both server and client code)
export { supabase, createSupabaseClient } from './client';
