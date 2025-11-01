/**
 * Supabase Server Client
 *
 * This client should be used in:
 * - API routes (app/api/**)
 * - Server components
 * - Server actions
 *
 * It uses the SERVICE_ROLE_KEY which bypasses Row Level Security (RLS)
 * Be careful with this client - only use it in trusted server-side code
 */

import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

/**
 * Server-side Supabase client with SERVICE_ROLE privileges
 * This client bypasses RLS and should only be used in server-side code
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Server-side Supabase client with ANON key (respects RLS)
 * Use this when you want RLS policies to be enforced on the server
 */
export const supabaseServer = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Database type definitions will be added here later
 * You can generate these using: npx supabase gen types typescript
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          password_hash: string | null;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          password_hash?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          password_hash?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessment_attempts: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          trait_vector: number[];
          trait_summary: Record<string, number>;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assessment_id: string;
          trait_vector: number[];
          trait_summary: Record<string, number>;
          completed_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assessment_id?: string;
          trait_vector?: number[];
          trait_summary?: Record<string, number>;
          completed_at?: string;
          created_at?: string;
        };
      };
      assessment_responses: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          value: number | string;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          value: number | string;
          timestamp: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          value?: number | string;
          timestamp?: string;
          created_at?: string;
        };
      };
      saved_job_paths: {
        Row: {
          id: string;
          user_id: string;
          job_path_id: string;
          saved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_path_id: string;
          saved_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_path_id?: string;
          saved_at?: string;
        };
      };
      user_milestones: {
        Row: {
          id: string;
          user_id: string;
          job_path_id: string;
          milestones: Array<{
            id: string;
            text: string;
            completed: boolean;
            completedAt?: string;
          }>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_path_id: string;
          milestones: Array<{
            id: string;
            text: string;
            completed: boolean;
            completedAt?: string;
          }>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_path_id?: string;
          milestones?: Array<{
            id: string;
            text: string;
            completed: boolean;
            completedAt?: string;
          }>;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessment_progress: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          responses: Array<{
            questionId: string;
            value: number | string;
            timestamp: string;
          }>;
          current_module_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assessment_id: string;
          responses?: Array<{
            questionId: string;
            value: number | string;
            timestamp: string;
          }>;
          current_module_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assessment_id?: string;
          responses?: Array<{
            questionId: string;
            value: number | string;
            timestamp: string;
          }>;
          current_module_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
