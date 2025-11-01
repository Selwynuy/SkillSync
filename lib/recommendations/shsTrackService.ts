// ============================================================================
// SHS Track Recommendations Service
// ============================================================================

import type {
  SHSTrack,
  SHSTrackRecommendation,
  JobPath,
  UserGrades,
  DropoutSignal,
} from "@/lib/types";
import { getTopRecommendations, identifyDrivers } from "./similarity";
import {
  getAllSHSTracks,
  getAllJobPaths,
  getUserRegion,
  getEnrollmentTrend,
  getRegionalOutcome,
  getUserGrades,
  getDropoutSignal,
} from "@/lib/repositories";
import { getLatestAttempt } from "@/lib/assessment/storage";
import { generateSHSTrackRationale } from "./shsTrackRationale";
import { calculateDropoutRisk } from "./dropoutRiskAnalysis";
import { analyzeGradeAlignment } from "./gradeAlignment";

/**
 * Generate SHS track recommendations for a user based on their assessment,
 * grades, region, and dropout risk factors.
 *
 * @param userId - User ID to generate recommendations for
 * @param topN - Number of recommendations to return (default: 3)
 * @returns Array of SHS track recommendations with comprehensive analysis
 */
export async function generateSHSTrackRecommendationsForUser(
  userId: string,
  topN: number = 3
): Promise<SHSTrackRecommendation[]> {
  // Get user's latest assessment attempt
  const latestAttempt = await getLatestAttempt(userId);

  if (!latestAttempt) {
    throw new Error("No completed assessment found for user");
  }

  // Get user data
  const [userGrades, userRegion, existingDropoutSignal, allTracks, allJobPaths] =
    await Promise.all([
      getUserGrades(userId),
      getUserRegion(userId),
      getDropoutSignal(userId),
      getAllSHSTracks(),
      getAllJobPaths(),
    ]);

  // Compute base similarity scores using trait vectors
  const baseMatches = getTopRecommendations(
    latestAttempt.traitVector,
    allTracks,
    topN * 2 // Get more candidates for filtering
  );

  // Build full recommendation objects with comprehensive analysis
  const recommendations: SHSTrackRecommendation[] = await Promise.all(
    baseMatches.slice(0, topN).map(async ({ jobPath: track, score }) => {
      const shsTrack = track as unknown as SHSTrack;

      // Get enrollment trend and regional outcome for user's region
      const [enrollmentTrend, regionalOutcome] = await Promise.all([
        userRegion
          ? getEnrollmentTrend(shsTrack.id, userRegion)
          : Promise.resolve(null),
        userRegion
          ? getRegionalOutcome(shsTrack.id, userRegion)
          : Promise.resolve(null),
      ]);

      // Analyze grade alignment
      const gradeAlignment = analyzeGradeAlignment(userGrades ?? null, shsTrack);

      // Calculate dropout risk specific to this track
      const dropoutRisk = await calculateDropoutRisk(
        userId,
        shsTrack,
        userGrades,
        latestAttempt.assessmentId,
        existingDropoutSignal
      );

      // Get top career paths aligned with this track
      const topCareerPaths = shsTrack.careerPathways
        .slice(0, 3)
        .map((pathId) => allJobPaths.find((jp) => jp.id === pathId))
        .filter((jp): jp is JobPath => jp !== undefined);

      // Identify key drivers
      const drivers = identifyDrivers(
        latestAttempt.traitVector,
        shsTrack.vector
      );

      // Generate AI-powered rationale
      const rationale = await generateSHSTrackRationale(
        shsTrack,
        drivers,
        score,
        latestAttempt.traitSummary,
        gradeAlignment,
        dropoutRisk,
        enrollmentTrend,
        regionalOutcome
      );

      return {
        track: shsTrack,
        score,
        drivers,
        rationale,
        gradeAlignment,
        enrollmentTrend: enrollmentTrend || undefined,
        regionalOutcome: regionalOutcome || undefined,
        dropoutRisk,
        topCareerPaths,
      };
    })
  );

  return recommendations;
}

/**
 * Generate SHS track recommendations from a specific trait vector.
 * Useful for "what-if" scenarios or exploring different trait profiles.
 *
 * @param traitVector - Custom trait vector
 * @param traitSummary - Named trait scores
 * @param userGrades - Optional user grades for analysis
 * @param region - Optional region for trend analysis
 * @param topN - Number of recommendations to return
 * @returns Array of SHS track recommendations
 */
export async function generateSHSTrackRecommendationsFromVector(
  traitVector: number[],
  traitSummary: Record<string, number>,
  userGrades?: UserGrades | null,
  region?: string,
  topN: number = 3
): Promise<SHSTrackRecommendation[]> {
  const [allTracks, allJobPaths] = await Promise.all([
    getAllSHSTracks(),
    getAllJobPaths(),
  ]);

  const topMatches = getTopRecommendations(traitVector, allTracks, topN);

  const recommendations: SHSTrackRecommendation[] = await Promise.all(
    topMatches.map(async ({ jobPath: track, score }) => {
      const shsTrack = track as unknown as SHSTrack;

      // Get enrollment trend and regional outcome if region provided
      const [enrollmentTrend, regionalOutcome] = await Promise.all([
        region
          ? getEnrollmentTrend(shsTrack.id, region)
          : Promise.resolve(null),
        region
          ? getRegionalOutcome(shsTrack.id, region)
          : Promise.resolve(null),
      ]);

      // Analyze grade alignment
      const gradeAlignment = analyzeGradeAlignment(userGrades ?? null, shsTrack);

      // Simulated dropout risk (no user-specific data)
      const dropoutRisk = {
        level: "low" as const,
        factors: [],
        recommendations: [],
      };

      // Get top career paths
      const topCareerPaths = shsTrack.careerPathways
        .slice(0, 3)
        .map((pathId) => allJobPaths.find((jp) => jp.id === pathId))
        .filter((jp): jp is JobPath => jp !== undefined);

      // Identify key drivers
      const drivers = identifyDrivers(traitVector, shsTrack.vector);

      // Generate rationale
      const rationale = await generateSHSTrackRationale(
        shsTrack,
        drivers,
        score,
        traitSummary,
        gradeAlignment,
        dropoutRisk,
        enrollmentTrend,
        regionalOutcome
      );

      return {
        track: shsTrack,
        score,
        drivers,
        rationale,
        gradeAlignment,
        enrollmentTrend: enrollmentTrend || undefined,
        regionalOutcome: regionalOutcome || undefined,
        dropoutRisk,
        topCareerPaths,
      };
    })
  );

  return recommendations;
}
