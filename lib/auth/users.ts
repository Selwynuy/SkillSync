import { User } from "@/lib/types";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * User Management with Supabase
 *
 * This module handles all user-related database operations
 * Uses supabaseAdmin for server-side operations that bypass RLS
 */

/**
 * Get user by email address
 */
export async function getUserByEmail(
  email: string
): Promise<(User & { password: string }) | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !data) {
      return null;
    }

    // Map database fields to User type
    return {
      id: data.id,
      email: data.email,
      name: data.name || undefined,
      password: data.password_hash || "",
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

/**
 * Get user by ID
 * Returns user without password
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name, created_at, updated_at")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

/**
 * Create a new user account
 */
export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const normalizedEmail = email.toLowerCase();

  // Check if user already exists
  const existingUser = await getUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into database
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      email: normalizedEmail,
      name: name || null,
      password_hash: hashedPassword,
      email_verified: false,
    })
    .select("id, email, name, created_at, updated_at")
    .single();

  if (error || !data) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name || undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Delete a user account and all associated data
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (error) {
      console.error("Error deleting user:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}

// ============================================================================
// Magic Link Token Management
// ============================================================================

/**
 * Create a magic link token for passwordless login
 * Tokens expire after 15 minutes
 */
export function createMagicToken(email: string): string {
  // Generate a secure random token
  const token = `magic-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Note: In production, store these tokens in Supabase or Redis
  // For now, we'll use Supabase auth's built-in magic link functionality
  // This is a placeholder for custom magic link logic if needed

  return token;
}

/**
 * Verify a magic link token
 * Returns the email if valid, null otherwise
 */
export async function verifyMagicToken(token: string): Promise<string | null> {
  // Note: In production, implement token verification with Supabase
  // This is a placeholder for custom magic link logic if needed
  // You can use Supabase's built-in signInWithOtp() instead

  return null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  updates: {
    name?: string;
    email?: string;
  }
): Promise<User | null> {
  try {
    const updateData: any = {};

    if (updates.email) {
      updateData.email = updates.email.toLowerCase();
    }

    if (updates.name !== undefined) {
      updateData.name = updates.name || null;
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select("id, email, name, created_at, updated_at")
      .single();

    if (error || !data) {
      console.error("Error updating user:", error);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

/**
 * Mark user email as verified
 */
export async function markEmailVerified(userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ email_verified: true })
      .eq("id", userId);

    if (error) {
      console.error("Error marking email verified:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error marking email verified:", error);
    return false;
  }
}
