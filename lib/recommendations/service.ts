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
  const recommendations: Recommendation[] = topMatches.map(
    ({ jobPath, score }) => {
      const drivers = identifyDrivers(latestAttempt.traitVector, jobPath.vector);
      const rationale = generateRationale(
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
    }
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

  const recommendations: Recommendation[] = topMatches.map(
    ({ jobPath, score }) => {
      const drivers = identifyDrivers(traitVector, jobPath.vector);
      const rationale = generateRationale(
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
    }
  );

  return recommendations;
}

// ============================================================================
// Saved Job Paths Storage (In-Memory MVP)
// ============================================================================

const savedPaths: Map<string, SavedJobPath> = new Map();

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
  const key = `${userId}-${jobPathId}`;

  // Check if already saved
  const existing = savedPaths.get(key);
  if (existing) {
    return existing;
  }

  const savedPath: SavedJobPath = {
    id: `saved-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userId,
    jobPathId,
    savedAt: new Date(),
  };

  savedPaths.set(key, savedPath);
  return savedPath;
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
  const key = `${userId}-${jobPathId}`;
  return savedPaths.delete(key);
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
  const key = `${userId}-${jobPathId}`;
  return savedPaths.has(key);
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
  return Array.from(savedPaths.values())
    .filter((saved) => saved.userId === userId)
    .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
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
