// ============================================================================
// Recommendations Service
// ============================================================================

import type { JobPath, Recommendation, SavedJobPath } from "@/lib/types";
import { getTopRecommendations, identifyDrivers } from "./similarity";
import { getAllJobPaths } from "@/lib/repositories/jobPaths";
import { getLatestAttempt } from "@/lib/assessment/storage";
import { generateRationale } from "./rationale";

/**
 * Generate recommendations for a user based on their latest assessment.
 *
 * @param userId - User ID to generate recommendations for
 * @param topN - Number of recommendations to return (default: 5)
 * @returns Array of recommendations with scores, drivers, and rationales
 */
export async function generateRecommendationsForUser(
  userId: string,
  topN: number = 5
): Promise<Recommendation[]> {
  // Get user's latest assessment attempt
  const latestAttempt = await getLatestAttempt(userId);

  if (!latestAttempt) {
    throw new Error("No completed assessment found for user");
  }

  // Get all job paths
  const jobPaths = await getAllJobPaths();

  // Compute top N recommendations
  const topMatches = getTopRecommendations(
    latestAttempt.traitVector,
    jobPaths,
    topN
  );

  // Build full recommendation objects with drivers and rationales
  const recommendations: Recommendation[] = await Promise.all(
    topMatches.map(async ({ jobPath, score }) => {
      const drivers = identifyDrivers(latestAttempt.traitVector, jobPath.vector);
      const rationale = await generateRationale(
        jobPath,
        drivers,
        score,
        latestAttempt.traitSummary
      );

      return {
        jobPath,
        score,
        drivers,
        rationale,
      };
    })
  );

  return recommendations;
}

/**
 * Generate recommendations from a specific trait vector.
 * Useful for "what-if" scenarios or exploring different trait profiles.
 *
 * @param traitVector - Custom trait vector
 * @param traitSummary - Named trait scores for rationale generation
 * @param topN - Number of recommendations to return (default: 5)
 * @returns Array of recommendations
 */
export async function generateRecommendationsFromVector(
  traitVector: number[],
  traitSummary: Record<string, number>,
  topN: number = 5
): Promise<Recommendation[]> {
  const jobPaths = await getAllJobPaths();
  const topMatches = getTopRecommendations(traitVector, jobPaths, topN);

  const recommendations: Recommendation[] = await Promise.all(
    topMatches.map(async ({ jobPath, score }) => {
      const drivers = identifyDrivers(traitVector, jobPath.vector);
      const rationale = await generateRationale(
        jobPath,
        drivers,
        score,
        traitSummary
      );

      return {
        jobPath,
        score,
        drivers,
        rationale,
      };
    })
  );

  return recommendations;
}

// ============================================================================
// Saved Job Paths Storage (Supabase)
// ============================================================================

import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Save a job path for a user.
 *
 * @param userId - User ID
 * @param jobPathId - Job path ID to save
 * @returns The saved job path record
 */
export async function saveJobPath(
  userId: string,
  jobPathId: string
): Promise<SavedJobPath> {
  try {
    // Check if already saved (unique constraint will prevent duplicates)
    const { data: existing } = await supabaseAdmin
      .from("saved_job_paths")
      .select("*")
      .eq("user_id", userId)
      .eq("job_path_id", jobPathId)
      .single();

    if (existing) {
      return {
        id: existing.id,
        userId: existing.user_id,
        jobPathId: existing.job_path_id,
        savedAt: new Date(existing.saved_at),
      };
    }

    // Insert new saved path
    const { data, error } = await supabaseAdmin
      .from("saved_job_paths")
      .insert({
        user_id: userId,
        job_path_id: jobPathId,
      })
      .select("*")
      .single();

    if (error || !data) {
      console.error("Error saving job path:", error);
      throw new Error("Failed to save job path");
    }

    return {
      id: data.id,
      userId: data.user_id,
      jobPathId: data.job_path_id,
      savedAt: new Date(data.saved_at),
    };
  } catch (error) {
    console.error("Error saving job path:", error);
    throw error;
  }
}

/**
 * Unsave a job path for a user.
 *
 * @param userId - User ID
 * @param jobPathId - Job path ID to unsave
 * @returns True if unsaved, false if not found
 */
export async function unsaveJobPath(
  userId: string,
  jobPathId: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("saved_job_paths")
      .delete()
      .eq("user_id", userId)
      .eq("job_path_id", jobPathId);

    if (error) {
      console.error("Error unsaving job path:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error unsaving job path:", error);
    return false;
  }
}

/**
 * Check if a job path is saved by a user.
 *
 * @param userId - User ID
 * @param jobPathId - Job path ID
 * @returns True if saved, false otherwise
 */
export async function isJobPathSaved(
  userId: string,
  jobPathId: string
): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from("saved_job_paths")
      .select("id")
      .eq("user_id", userId)
      .eq("job_path_id", jobPathId)
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
}

/**
 * Get all saved job paths for a user.
 *
 * @param userId - User ID
 * @returns Array of saved job path records
 */
export async function getSavedJobPaths(
  userId: string
): Promise<SavedJobPath[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("saved_job_paths")
      .select("*")
      .eq("user_id", userId)
      .order("saved_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      jobPathId: row.job_path_id,
      savedAt: new Date(row.saved_at),
    }));
  } catch (error) {
    console.error("Error getting saved job paths:", error);
    return [];
  }
}

/**
 * Get full job path details for all saved paths.
 *
 * @param userId - User ID
 * @returns Array of job paths that user has saved
 */
export async function getSavedJobPathsWithDetails(
  userId: string
): Promise<JobPath[]> {
  const saved = await getSavedJobPaths(userId);
  const allJobPaths = await getAllJobPaths();

  // Create a map for efficient lookup
  const jobPathMap = new Map(allJobPaths.map((jp) => [jp.id, jp]));

  // Return job paths in order they were saved
  return saved
    .map((s) => jobPathMap.get(s.jobPathId))
    .filter((jp): jp is JobPath => jp !== undefined);
}

/**
 * Delete all saved job paths for a user.
 *
 * @param userId - User ID
 * @returns Number of saved paths deleted
 */
export async function deleteUserSavedPaths(userId: string): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from("saved_job_paths")
      .delete()
      .eq("user_id", userId)
      .select("id");

    if (error) {
      console.error("Error deleting saved paths:", error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error("Error deleting saved paths:", error);
    return 0;
  }
}
