// ============================================================================
// Recommendations Module Exports
// ============================================================================

export {
  cosineSimilarity,
  computeJobPathSimilarities,
  getTopRecommendations,
  identifyDrivers,
  normalizeVector,
  calculatePercentile,
  TRAIT_NAMES,
} from "./similarity";

export {
  generateRecommendationsForUser,
  generateRecommendationsFromVector,
  saveJobPath,
  unsaveJobPath,
  isJobPathSaved,
  getSavedJobPaths,
  getSavedJobPathsWithDetails,
} from "./service";

export { generateRationale, generateRationaleBatch } from "./rationale";
