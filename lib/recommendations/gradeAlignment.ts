// ============================================================================
// Grade Alignment Analysis
// ============================================================================

import type { SHSTrack, UserGrades } from "@/lib/types";

/**
 * Analyze how well user's grades align with SHS track requirements
 */
export function analyzeGradeAlignment(
  userGrades: UserGrades | null,
  track: SHSTrack
): {
  meetsRequirements: boolean;
  strengthAreas: string[];
  improvementAreas: string[];
} {
  const strengthAreas: string[] = [];
  const improvementAreas: string[] = [];

  // If no grades provided, cannot determine alignment
  if (!userGrades) {
    return {
      meetsRequirements: false,
      strengthAreas: [],
      improvementAreas: ["Please provide your academic grades for personalized analysis"],
    };
  }

  // Get most recent grades (prioritize Grade 10, then 9, 8, 7)
  const latestGrades =
    userGrades.grade10 ||
    userGrades.grade9 ||
    userGrades.grade8 ||
    userGrades.grade7;

  if (!latestGrades) {
    return {
      meetsRequirements: false,
      strengthAreas: [],
      improvementAreas: ["No grade data available"],
    };
  }

  let requirementsMet = true;

  // Check math requirements
  if (track.recommendedGrades.math) {
    if (latestGrades.math) {
      if (latestGrades.math >= track.recommendedGrades.math + 10) {
        strengthAreas.push(`Math (${latestGrades.math}% - Excellent!)`);
      } else if (latestGrades.math >= track.recommendedGrades.math) {
        strengthAreas.push(`Math (${latestGrades.math}% - Meets requirements)`);
      } else {
        improvementAreas.push(
          `Math (${latestGrades.math}% - Recommended: ${track.recommendedGrades.math}%+)`
        );
        requirementsMet = false;
      }
    } else {
      improvementAreas.push(`Math grade not provided`);
      requirementsMet = false;
    }
  }

  // Check science requirements
  if (track.recommendedGrades.science) {
    if (latestGrades.science) {
      if (latestGrades.science >= track.recommendedGrades.science + 10) {
        strengthAreas.push(`Science (${latestGrades.science}% - Excellent!)`);
      } else if (latestGrades.science >= track.recommendedGrades.science) {
        strengthAreas.push(`Science (${latestGrades.science}% - Meets requirements)`);
      } else {
        improvementAreas.push(
          `Science (${latestGrades.science}% - Recommended: ${track.recommendedGrades.science}%+)`
        );
        requirementsMet = false;
      }
    } else {
      improvementAreas.push(`Science grade not provided`);
      requirementsMet = false;
    }
  }

  // Check English requirements
  if (track.recommendedGrades.english) {
    if (latestGrades.english) {
      if (latestGrades.english >= track.recommendedGrades.english + 10) {
        strengthAreas.push(`English (${latestGrades.english}% - Excellent!)`);
      } else if (latestGrades.english >= track.recommendedGrades.english) {
        strengthAreas.push(`English (${latestGrades.english}% - Meets requirements)`);
      } else {
        improvementAreas.push(
          `English (${latestGrades.english}% - Recommended: ${track.recommendedGrades.english}%+)`
        );
        requirementsMet = false;
      }
    } else {
      improvementAreas.push(`English grade not provided`);
      requirementsMet = false;
    }
  }

  // Check GPA requirements
  if (track.recommendedGrades.gpa) {
    if (latestGrades.totalAverage) {
      if (latestGrades.totalAverage >= track.recommendedGrades.gpa + 0.5) {
        strengthAreas.push(`GPA (${latestGrades.totalAverage.toFixed(2)} - Excellent!)`);
      } else if (latestGrades.totalAverage >= track.recommendedGrades.gpa) {
        strengthAreas.push(`GPA (${latestGrades.totalAverage.toFixed(2)} - Meets requirements)`);
      } else {
        improvementAreas.push(
          `GPA (${latestGrades.totalAverage.toFixed(2)} - Recommended: ${track.recommendedGrades.gpa}+)`
        );
        requirementsMet = false;
      }
    } else {
      improvementAreas.push(`GPA not provided`);
      requirementsMet = false;
    }
  }

  // If track has no specific requirements, consider it a match
  if (
    !track.recommendedGrades.math &&
    !track.recommendedGrades.science &&
    !track.recommendedGrades.english &&
    !track.recommendedGrades.gpa
  ) {
    requirementsMet = true;
    strengthAreas.push("This track has flexible academic requirements");
  }

  return {
    meetsRequirements: requirementsMet,
    strengthAreas,
    improvementAreas,
  };
}

/**
 * Get the user's strongest academic areas based on grades
 */
export function identifyAcademicStrengths(
  userGrades: UserGrades | null
): string[] {
  if (!userGrades) {
    return [];
  }

  const latestGrades =
    userGrades.grade10 ||
    userGrades.grade9 ||
    userGrades.grade8 ||
    userGrades.grade7;

  if (!latestGrades) {
    return [];
  }

  const subjects: Array<{ name: string; grade: number }> = [];

  if (latestGrades.math) subjects.push({ name: "Math", grade: latestGrades.math });
  if (latestGrades.science)
    subjects.push({ name: "Science", grade: latestGrades.science });
  if (latestGrades.english)
    subjects.push({ name: "English", grade: latestGrades.english });

  // Sort by grade (highest first)
  subjects.sort((a, b) => b.grade - a.grade);

  // Return subjects with grades above 85 (strong performance)
  return subjects.filter((s) => s.grade >= 85).map((s) => s.name);
}

/**
 * Calculate overall academic readiness score (0-100)
 */
export function calculateAcademicReadiness(
  userGrades: UserGrades | null,
  track: SHSTrack
): number {
  if (!userGrades) {
    return 50; // Neutral score if no data
  }

  const latestGrades =
    userGrades.grade10 ||
    userGrades.grade9 ||
    userGrades.grade8 ||
    userGrades.grade7;

  if (!latestGrades) {
    return 50;
  }

  let totalScore = 0;
  let totalWeight = 0;

  // Check each requirement
  if (track.recommendedGrades.math && latestGrades.math) {
    const score = Math.min(100, (latestGrades.math / track.recommendedGrades.math) * 100);
    totalScore += score;
    totalWeight += 1;
  }

  if (track.recommendedGrades.science && latestGrades.science) {
    const score = Math.min(
      100,
      (latestGrades.science / track.recommendedGrades.science) * 100
    );
    totalScore += score;
    totalWeight += 1;
  }

  if (track.recommendedGrades.english && latestGrades.english) {
    const score = Math.min(
      100,
      (latestGrades.english / track.recommendedGrades.english) * 100
    );
    totalScore += score;
    totalWeight += 1;
  }

  if (track.recommendedGrades.gpa && latestGrades.totalAverage) {
    const score = Math.min(100, (latestGrades.totalAverage / track.recommendedGrades.gpa) * 100);
    totalScore += score;
    totalWeight += 1;
  }

  // If no requirements, base on overall performance
  if (totalWeight === 0) {
    const grades: number[] = [];
    if (latestGrades.math) grades.push(latestGrades.math);
    if (latestGrades.science) grades.push(latestGrades.science);
    if (latestGrades.english) grades.push(latestGrades.english);

    if (grades.length > 0) {
      return grades.reduce((a, b) => a + b, 0) / grades.length;
    }

    return 75; // Default if no data
  }

  return Math.round(totalScore / totalWeight);
}
