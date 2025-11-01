import { UserMilestones, Milestone } from "@/lib/types";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Milestones Storage with Supabase
 *
 * This module handles storage of user milestones for career paths
 * Uses Supabase for persistent storage
 */

/**
 * Get all milestones for a user across all job paths.
 *
 * @param userId - User ID
 * @returns Array of UserMilestones records
 */
export async function getUserMilestones(
  userId: string
): Promise<UserMilestones[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_milestones")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      jobPathId: row.job_path_id,
      milestones: row.milestones || [],
      updatedAt: new Date(row.updated_at),
    }));
  } catch (error) {
    console.error("Error getting user milestones:", error);
    return [];
  }
}

/**
 * Get milestones for a specific job path.
 *
 * @param userId - User ID
 * @param jobPathId - Job path ID
 * @returns UserMilestones record or null
 */
export async function getMilestonesByJobPath(
  userId: string,
  jobPathId: string
): Promise<UserMilestones | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_milestones")
      .select("*")
      .eq("user_id", userId)
      .eq("job_path_id", jobPathId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      jobPathId: data.job_path_id,
      milestones: data.milestones || [],
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error("Error getting milestones by job path:", error);
    return null;
  }
}

/**
 * Save or update milestones for a job path.
 *
 * @param userId - User ID
 * @param jobPathId - Job path ID
 * @param milestones - Array of milestones
 * @returns Updated UserMilestones record
 */
export async function saveMilestones(
  userId: string,
  jobPathId: string,
  milestones: Milestone[]
): Promise<UserMilestones> {
  try {
    // Validate milestones before saving
    const validationError = validateMilestones(milestones);
    if (validationError) {
      throw new Error(validationError);
    }

    // Check if record already exists
    const existing = await getMilestonesByJobPath(userId, jobPathId);

    if (existing) {
      // Update existing record
      const { data, error } = await supabaseAdmin
        .from("user_milestones")
        .update({
          milestones: milestones as any,
        })
        .eq("user_id", userId)
        .eq("job_path_id", jobPathId)
        .select("*")
        .single();

      if (error || !data) {
        console.error("Error updating milestones:", error);
        throw new Error("Failed to update milestones");
      }

      return {
        id: data.id,
        userId: data.user_id,
        jobPathId: data.job_path_id,
        milestones: data.milestones || [],
        updatedAt: new Date(data.updated_at),
      };
    } else {
      // Insert new record
      const { data, error } = await supabaseAdmin
        .from("user_milestones")
        .insert({
          user_id: userId,
          job_path_id: jobPathId,
          milestones: milestones as any,
        })
        .select("*")
        .single();

      if (error || !data) {
        console.error("Error inserting milestones:", error);
        throw new Error("Failed to save milestones");
      }

      return {
        id: data.id,
        userId: data.user_id,
        jobPathId: data.job_path_id,
        milestones: data.milestones || [],
        updatedAt: new Date(data.updated_at),
      };
    }
  } catch (error) {
    console.error("Error saving milestones:", error);
    throw error;
  }
}

/**
 * Delete milestones for a specific job path.
 *
 * @param userId - User ID
 * @param jobPathId - Job path ID
 * @returns True if deleted, false if not found
 */
export async function deleteMilestones(
  userId: string,
  jobPathId: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("user_milestones")
      .delete()
      .eq("user_id", userId)
      .eq("job_path_id", jobPathId);

    if (error) {
      console.error("Error deleting milestones:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting milestones:", error);
    return false;
  }
}

/**
 * Validate milestone data.
 *
 * @param milestone - Milestone to validate
 * @returns Validation error message or null if valid
 */
export function validateMilestone(milestone: any): string | null {
  if (!milestone || typeof milestone !== "object") {
    return "Milestone must be an object";
  }

  if (!milestone.id || typeof milestone.id !== "string") {
    return "Milestone must have a valid id";
  }

  if (!milestone.text || typeof milestone.text !== "string") {
    return "Milestone must have a valid text";
  }

  if (milestone.text.trim().length === 0) {
    return "Milestone text cannot be empty";
  }

  if (milestone.text.length > 500) {
    return "Milestone text cannot exceed 500 characters";
  }

  if (typeof milestone.completed !== "boolean") {
    return "Milestone completed must be a boolean";
  }

  if (milestone.completedAt !== undefined && milestone.completedAt !== null) {
    const completedAt = new Date(milestone.completedAt);
    if (isNaN(completedAt.getTime())) {
      return "Milestone completedAt must be a valid date";
    }
  }

  return null;
}

/**
 * Validate an array of milestones.
 *
 * @param milestones - Array of milestones to validate
 * @returns Validation error message or null if valid
 */
export function validateMilestones(milestones: any): string | null {
  if (!Array.isArray(milestones)) {
    return "Milestones must be an array";
  }

  if (milestones.length > 50) {
    return "Cannot have more than 50 milestones per job path";
  }

  for (let i = 0; i < milestones.length; i++) {
    const error = validateMilestone(milestones[i]);
    if (error) {
      return `Milestone ${i + 1}: ${error}`;
    }
  }

  // Check for duplicate IDs
  const ids = new Set<string>();
  for (const milestone of milestones) {
    if (ids.has(milestone.id)) {
      return `Duplicate milestone ID: ${milestone.id}`;
    }
    ids.add(milestone.id);
  }

  return null;
}

/**
 * Delete all milestones for a user.
 *
 * @param userId - User ID
 * @returns Number of milestone records deleted
 */
export async function deleteUserMilestones(userId: string): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_milestones")
      .delete()
      .eq("user_id", userId)
      .select("id");

    if (error) {
      console.error("Error deleting user milestones:", error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error("Error deleting user milestones:", error);
    return 0;
  }
}
