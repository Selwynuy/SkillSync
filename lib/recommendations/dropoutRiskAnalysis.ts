// ============================================================================
// Dropout Risk Analysis
// ============================================================================

import type { SHSTrack, UserGrades, DropoutSignal } from "@/lib/types";
import { upsertDropoutSignal } from "@/lib/repositories";

/**
 * Calculate dropout risk for a user considering a specific SHS track.
 * Factors include academic performance, engagement, and track alignment.
 *
 * @param userId - User ID
 * @param track - SHS track being considered
 * @param userGrades - User's academic grades
 * @param assessmentId - Assessment ID (to check completion)
 * @param existingSignal - Existing dropout signal if any
 * @returns Dropout risk assessment
 */
export async function calculateDropoutRisk(
  userId: string,
  track: SHSTrack,
  userGrades: UserGrades | null,
  assessmentId: string,
  existingSignal?: DropoutSignal | null
): Promise<{
  level: "low" | "medium" | "high";
  factors: string[];
  recommendations: string[];
}> {
  const factors: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;

  // Factor 1: Academic alignment with track requirements (30 points)
  if (userGrades) {
    const gradeGap = analyzeAcademicGap(userGrades, track);
    if (gradeGap.gap > 15) {
      riskScore += 30;
      factors.push(
        `Academic grades significantly below track requirements (${gradeGap.gap}% gap)`
      );
      recommendations.push(
        `Focus on improving ${gradeGap.weakAreas.join(", ")} before enrollment`
      );
    } else if (gradeGap.gap > 5) {
      riskScore += 15;
      factors.push(
        `Academic grades slightly below track requirements (${gradeGap.gap}% gap)`
      );
      recommendations.push(`Consider tutoring in ${gradeGap.weakAreas.join(", ")}`);
    }
  } else {
    // No grades provided - moderate risk
    riskScore += 10;
    factors.push("No academic performance data available");
    recommendations.push("Provide your grades for better track matching");
  }

  // Factor 2: Assessment completion (10 points)
  const assessmentCompleted = !!assessmentId;
  if (!assessmentCompleted) {
    riskScore += 10;
    factors.push("Career assessment not completed");
    recommendations.push(
      "Complete the career assessment for personalized guidance"
    );
  }

  // Factor 3: Existing dropout signals (40 points)
  if (existingSignal) {
    if (existingSignal.factors.academicStruggle) {
      riskScore += 15;
      factors.push("History of academic struggles");
      recommendations.push("Seek academic support services");
    }
    if (existingSignal.factors.financialDifficulty) {
      riskScore += 10;
      factors.push("Financial challenges identified");
      recommendations.push("Explore scholarship and financial aid options");
    }
    if (existingSignal.factors.lackOfInterest) {
      riskScore += 15;
      factors.push("Previous indication of lack of interest in track");
      recommendations.push(
        "Consider exploring other tracks that better match your interests"
      );
    }
    if (existingSignal.lastLoginDays > 30) {
      riskScore += 10;
      factors.push("Low platform engagement");
      recommendations.push("Stay engaged with career planning resources");
    }
  }

  // Factor 4: Track complexity vs. preparedness (20 points)
  const trackComplexity = assessTrackComplexity(track);
  if (trackComplexity === "high" && userGrades) {
    const avgGrade = calculateAverageGrade(userGrades);
    if (avgGrade < 80) {
      riskScore += 20;
      factors.push("High-difficulty track with lower academic performance");
      recommendations.push(
        "Consider additional preparation or a related but less demanding track"
      );
    } else if (avgGrade < 85) {
      riskScore += 10;
      factors.push("High-difficulty track requires strong academic foundation");
      recommendations.push(
        "Ensure you have strong study habits and support systems"
      );
    }
  }

  // Determine risk level
  let level: "low" | "medium" | "high";
  if (riskScore >= 50) {
    level = "high";
  } else if (riskScore >= 25) {
    level = "medium";
  } else {
    level = "low";
  }

  // Add general recommendations based on risk level
  if (level === "high") {
    recommendations.push("Consult with a guidance counselor before enrolling");
    recommendations.push("Consider foundational courses to strengthen skills");
  } else if (level === "medium") {
    recommendations.push("Develop a strong support network (tutors, mentors)");
    recommendations.push("Set realistic academic goals and track your progress");
  } else {
    recommendations.push("You're well-prepared for this track");
    recommendations.push("Stay consistent with your studies and seek help when needed");
  }

  // Save dropout signal to database
  if (level !== "low") {
    await upsertDropoutSignal({
      userId,
      trackId: track.id,
      riskLevel: level,
      riskScore,
      factors: {
        academicStruggle: factors.some((f) =>
          f.includes("academic")
        ),
        financialDifficulty: existingSignal?.factors.financialDifficulty || false,
        healthIssues: existingSignal?.factors.healthIssues || false,
        familyObligations: existingSignal?.factors.familyObligations || false,
        lackOfInterest: factors.some((f) => f.includes("interest")),
        peerInfluence: existingSignal?.factors.peerInfluence || false,
        transportation: existingSignal?.factors.transportation || false,
      },
      currentGPA: userGrades ? calculateAverageGrade(userGrades) / 25 : undefined, // Convert to 4.0 scale
      attendanceRate: existingSignal?.attendanceRate,
      failingSubjects: existingSignal?.failingSubjects,
      assessmentCompletion: assessmentCompleted,
      lastLoginDays: existingSignal?.lastLoginDays || 0,
      milestonesCompleted: existingSignal?.milestonesCompleted || 0,
      interventionNeeded: level === "high",
      interventionProvided: existingSignal?.interventionProvided || false,
      interventionType: existingSignal?.interventionType,
    });
  }

  return {
    level,
    factors,
    recommendations,
  };
}

/**
 * Analyze the gap between user's grades and track requirements
 */
function analyzeAcademicGap(
  userGrades: UserGrades,
  track: SHSTrack
): {
  gap: number;
  weakAreas: string[];
} {
  const weakAreas: string[] = [];
  const gaps: number[] = [];

  // Get most recent grades (prioritize Grade 10, then 9, 8, 7)
  const latestGrades =
    userGrades.grade10 ||
    userGrades.grade9 ||
    userGrades.grade8 ||
    userGrades.grade7;

  if (!latestGrades) {
    return { gap: 0, weakAreas: [] };
  }

  // Check math requirements
  if (
    track.recommendedGrades.math &&
    latestGrades.math &&
    latestGrades.math < track.recommendedGrades.math
  ) {
    const mathGap = track.recommendedGrades.math - latestGrades.math;
    gaps.push(mathGap);
    weakAreas.push("Math");
  }

  // Check science requirements
  if (
    track.recommendedGrades.science &&
    latestGrades.science &&
    latestGrades.science < track.recommendedGrades.science
  ) {
    const scienceGap = track.recommendedGrades.science - latestGrades.science;
    gaps.push(scienceGap);
    weakAreas.push("Science");
  }

  // Check English requirements
  if (
    track.recommendedGrades.english &&
    latestGrades.english &&
    latestGrades.english < track.recommendedGrades.english
  ) {
    const englishGap = track.recommendedGrades.english - latestGrades.english;
    gaps.push(englishGap);
    weakAreas.push("English");
  }

  // Check GPA requirements
  if (
    track.recommendedGrades.gpa &&
    latestGrades.gpa &&
    latestGrades.gpa < track.recommendedGrades.gpa
  ) {
    const gpaGap = track.recommendedGrades.gpa - latestGrades.gpa;
    gaps.push(gpaGap * 25); // Convert GPA gap to percentage scale
    weakAreas.push("GPA");
  }

  const averageGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;

  return {
    gap: Math.round(averageGap),
    weakAreas,
  };
}

/**
 * Assess track complexity level
 */
function assessTrackComplexity(
  track: SHSTrack
): "low" | "medium" | "high" {
  // STEM and ABM are typically more rigorous
  if (
    track.strand === "STEM" ||
    (track.strand === "ABM" && track.trackType === "Academic")
  ) {
    return "high";
  }

  // TVL-ICT and Arts & Design require specific skills
  if (track.strand === "ICT" || track.trackType === "Arts and Design") {
    return "medium";
  }

  // Other tracks
  return "medium";
}

/**
 * Calculate average grade from user grades
 */
function calculateAverageGrade(userGrades: UserGrades): number {
  const latestGrades =
    userGrades.grade10 ||
    userGrades.grade9 ||
    userGrades.grade8 ||
    userGrades.grade7;

  if (!latestGrades) {
    return 0;
  }

  const grades: number[] = [];
  if (latestGrades.math) grades.push(latestGrades.math);
  if (latestGrades.english) grades.push(latestGrades.english);
  if (latestGrades.science) grades.push(latestGrades.science);

  if (grades.length === 0) {
    return latestGrades.gpa ? latestGrades.gpa * 25 : 0; // Convert GPA to percentage
  }

  return grades.reduce((a, b) => a + b, 0) / grades.length;
}
