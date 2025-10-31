// ============================================================================
// Cosine Similarity & Recommendation Matching
// ============================================================================

import type { JobPath, Recommendation } from "@/lib/types";

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between 0 and 1, where 1 means identical direction.
 *
 * Formula: cos(θ) = (A · B) / (||A|| * ||B||)
 *
 * @param vectorA - First vector (typically user trait vector)
 * @param vectorB - Second vector (typically job path vector)
 * @returns Cosine similarity score between 0 and 1
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error(
      `Vector length mismatch: ${vectorA.length} vs ${vectorB.length}`
    );
  }

  if (vectorA.length === 0) {
    throw new Error("Cannot compute similarity for empty vectors");
  }

  // Compute dot product
  let dotProduct = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
  }

  // Compute magnitudes
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vectorA.length; i++) {
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  // Handle zero vectors
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  // Compute cosine similarity
  const similarity = dotProduct / (magnitudeA * magnitudeB);

  // Clamp to [0, 1] range (cosine can be negative for opposite directions)
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Compute similarity scores for all job paths against a user vector.
 * Returns job paths sorted by similarity score in descending order.
 *
 * @param userVector - User's trait vector from assessment
 * @param jobPaths - Array of job paths to match against
 * @returns Array of job paths with scores, sorted by best match
 */
export function computeJobPathSimilarities(
  userVector: number[],
  jobPaths: JobPath[]
): Array<{ jobPath: JobPath; score: number }> {
  const results = jobPaths.map((jobPath) => ({
    jobPath,
    score: cosineSimilarity(userVector, jobPath.vector),
  }));

  // Sort by score descending (best matches first)
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Get top N job path recommendations based on similarity.
 *
 * @param userVector - User's trait vector from assessment
 * @param jobPaths - Array of job paths to match against
 * @param topN - Number of top recommendations to return (default: 5)
 * @returns Top N job paths with scores
 */
export function getTopRecommendations(
  userVector: number[],
  jobPaths: JobPath[],
  topN: number = 5
): Array<{ jobPath: JobPath; score: number }> {
  const similarities = computeJobPathSimilarities(userVector, jobPaths);
  return similarities.slice(0, topN);
}

/**
 * Trait names corresponding to vector indices.
 * This should match the order used in assessment scoring.
 */
export const TRAIT_NAMES = [
  "Analytical",
  "Creative",
  "Social",
  "Practical",
  "Leadership",
  "Detail-Oriented",
  "Innovative",
  "Empathetic",
] as const;

/**
 * Identify the key drivers of a match by finding the traits
 * where both vectors have high values.
 *
 * Returns the top traits that contribute most to the similarity score.
 *
 * @param userVector - User's trait vector
 * @param jobPathVector - Job path's trait vector
 * @param topK - Number of top drivers to return (default: 3)
 * @returns Array of trait names that drive the match
 */
export function identifyDrivers(
  userVector: number[],
  jobPathVector: number[],
  topK: number = 3
): string[] {
  if (userVector.length !== jobPathVector.length) {
    throw new Error("Vector length mismatch");
  }

  // Calculate contribution of each trait to the overall match
  // Contribution is the product of user score and job path score
  const contributions = userVector.map((userScore, index) => ({
    trait: TRAIT_NAMES[index] || `Trait ${index + 1}`,
    contribution: userScore * jobPathVector[index],
    index,
  }));

  // Sort by contribution descending
  contributions.sort((a, b) => b.contribution - a.contribution);

  // Return top K trait names
  return contributions.slice(0, topK).map((c) => c.trait);
}

/**
 * Normalize a vector to unit length.
 * Useful for ensuring consistent vector magnitudes.
 *
 * @param vector - Input vector
 * @returns Normalized vector
 */
export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(
    vector.reduce((sum, val) => sum + val * val, 0)
  );

  if (magnitude === 0) {
    return vector.map(() => 0);
  }

  return vector.map((val) => val / magnitude);
}

/**
 * Calculate the percentile rank of a score among all scores.
 * Useful for showing users how their match compares to all options.
 *
 * @param score - The score to rank
 * @param allScores - Array of all scores
 * @returns Percentile (0-100) where 100 is the best
 */
export function calculatePercentile(
  score: number,
  allScores: number[]
): number {
  const sortedScores = [...allScores].sort((a, b) => a - b);
  const rank = sortedScores.filter((s) => s < score).length;
  return (rank / sortedScores.length) * 100;
}
