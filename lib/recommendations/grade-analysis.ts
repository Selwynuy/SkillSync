/**
 * Grade Analysis for Career Recommendations
 *
 * Analyzes user academic performance to enhance career matching
 */

import type { UserGrades, JobPath } from "@/lib/types";

/**
 * Calculate average grade across all subjects and levels
 */
function calculateOverallAverage(grades: UserGrades): number {
  const allGrades: number[] = [];

  // Collect all available grades
  [grades.grade7, grades.grade8, grades.grade9, grades.grade10].forEach((level) => {
    if (level) {
      if (level.math !== undefined) allGrades.push(level.math);
      if (level.english !== undefined) allGrades.push(level.english);
      if (level.science !== undefined) allGrades.push(level.science);
    }
  });

  if (allGrades.length === 0) return 0;

  return allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length;
}

/**
 * Calculate average grade for a specific subject across all levels
 */
function calculateSubjectAverage(
  grades: UserGrades,
  subject: "math" | "english" | "science"
): number {
  const subjectGrades: number[] = [];

  [grades.grade7, grades.grade8, grades.grade9, grades.grade10].forEach((level) => {
    if (level && level[subject] !== undefined) {
      subjectGrades.push(level[subject]!);
    }
  });

  if (subjectGrades.length === 0) return 0;

  return subjectGrades.reduce((sum, grade) => sum + grade, 0) / subjectGrades.length;
}

/**
 * Calculate average GPA across all levels
 */
function calculateAverageGPA(grades: UserGrades): number {
  const gpas: number[] = [];

  [grades.grade7, grades.grade8, grades.grade9, grades.grade10].forEach((level) => {
    if (level && level.gpa !== undefined) {
      gpas.push(level.gpa);
    }
  });

  if (gpas.length === 0) return 0;

  return gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length;
}

/**
 * Determine academic strengths based on grades
 */
export function identifyAcademicStrengths(grades: UserGrades): {
  strongestSubject: string | null;
  overallPerformance: "excellent" | "good" | "average" | "needs_improvement";
  mathStrength: number; // 0-1
  englishStrength: number; // 0-1
  scienceStrength: number; // 0-1
  averageGPA: number;
  overallAverage: number;
} {
  const mathAvg = calculateSubjectAverage(grades, "math");
  const englishAvg = calculateSubjectAverage(grades, "english");
  const scienceAvg = calculateSubjectAverage(grades, "science");
  const overallAvg = calculateOverallAverage(grades);
  const gpaAvg = calculateAverageGPA(grades);

  // Determine strongest subject
  let strongestSubject: string | null = null;
  const subjectAverages = {
    Math: mathAvg,
    English: englishAvg,
    Science: scienceAvg,
  };

  const maxGrade = Math.max(mathAvg, englishAvg, scienceAvg);
  if (maxGrade > 0) {
    strongestSubject = Object.entries(subjectAverages).find(
      ([_, avg]) => avg === maxGrade
    )?.[0] || null;
  }

  // Determine overall performance level
  let overallPerformance: "excellent" | "good" | "average" | "needs_improvement";
  if (overallAvg >= 85) {
    overallPerformance = "excellent";
  } else if (overallAvg >= 75) {
    overallPerformance = "good";
  } else if (overallAvg >= 65) {
    overallPerformance = "average";
  } else {
    overallPerformance = "needs_improvement";
  }

  // Normalize to 0-1 scale for strength scores
  return {
    strongestSubject,
    overallPerformance,
    mathStrength: mathAvg / 100,
    englishStrength: englishAvg / 100,
    scienceStrength: scienceAvg / 100,
    averageGPA: gpaAvg,
    overallAverage: overallAvg,
  };
}

/**
 * Calculate grade boost for a job path based on academic strengths
 * Returns a boost factor (0.0 to 0.15) to add to the base similarity score
 */
export function calculateGradeBoost(
  grades: UserGrades | null,
  jobPath: JobPath
): number {
  if (!grades || !grades.consentToUse) {
    return 0; // No boost if no grades or no consent
  }

  const strengths = identifyAcademicStrengths(grades);
  let boost = 0;

  // Base boost on overall performance (max 5%)
  if (strengths.overallPerformance === "excellent") {
    boost += 0.05;
  } else if (strengths.overallPerformance === "good") {
    boost += 0.03;
  } else if (strengths.overallPerformance === "average") {
    boost += 0.01;
  }

  // Subject-specific boosts based on job path tags (max 10%)
  const tags = jobPath.tags.map((t) => t.toLowerCase());

  // STEM careers benefit from math/science
  if (
    tags.some((t) =>
      ["analytical", "technical", "scientific", "mathematical", "engineering"].includes(t)
    )
  ) {
    boost += strengths.mathStrength * 0.05;
    boost += strengths.scienceStrength * 0.05;
  }

  // Creative/Communication careers benefit from English
  if (
    tags.some((t) =>
      ["creative", "communication", "writing", "artistic", "social"].includes(t)
    )
  ) {
    boost += strengths.englishStrength * 0.05;
  }

  // Healthcare/Science careers heavily benefit from science
  if (
    tags.some((t) => ["healthcare", "medical", "biological", "scientific"].includes(t))
  ) {
    boost += strengths.scienceStrength * 0.08;
  }

  // Cap the total boost at 15%
  return Math.min(boost, 0.15);
}

/**
 * Get a text summary of academic performance for AI rationale
 */
export function getGradeSummary(grades: UserGrades | null): string | null {
  if (!grades || !grades.consentToUse) {
    return null;
  }

  const strengths = identifyAcademicStrengths(grades);

  if (strengths.overallAverage === 0) {
    return null; // No grades provided
  }

  const parts: string[] = [];

  // Overall performance
  parts.push(
    `Overall academic performance: ${strengths.overallPerformance} (${strengths.overallAverage.toFixed(1)}% average)`
  );

  // Strongest subject
  if (strengths.strongestSubject) {
    parts.push(`Strongest subject: ${strengths.strongestSubject}`);
  }

  // Subject scores
  const subjectScores: string[] = [];
  if (strengths.mathStrength > 0) {
    subjectScores.push(`Math: ${(strengths.mathStrength * 100).toFixed(1)}%`);
  }
  if (strengths.englishStrength > 0) {
    subjectScores.push(`English: ${(strengths.englishStrength * 100).toFixed(1)}%`);
  }
  if (strengths.scienceStrength > 0) {
    subjectScores.push(`Science: ${(strengths.scienceStrength * 100).toFixed(1)}%`);
  }

  if (subjectScores.length > 0) {
    parts.push(subjectScores.join(", "));
  }

  // GPA if available
  if (strengths.averageGPA > 0) {
    parts.push(`Average GPA: ${strengths.averageGPA.toFixed(2)}/5.0`);
  }

  return parts.join(" | ");
}

/**
 * Explain how grades influenced the recommendation
 */
export function explainGradeInfluence(
  grades: UserGrades | null,
  jobPath: JobPath,
  boost: number
): string | null {
  if (!grades || !grades.consentToUse || boost === 0) {
    return null;
  }

  const strengths = identifyAcademicStrengths(grades);
  const tags = jobPath.tags.map((t) => t.toLowerCase());

  const explanations: string[] = [];

  // Check for subject-career alignment
  if (
    strengths.mathStrength > 0.75 &&
    tags.some((t) => ["analytical", "technical", "mathematical"].includes(t))
  ) {
    explanations.push("your strong math skills align perfectly with this technical field");
  }

  if (
    strengths.scienceStrength > 0.75 &&
    tags.some((t) => ["scientific", "healthcare", "medical", "biological"].includes(t))
  ) {
    explanations.push("your excellent science background is ideal for this career");
  }

  if (
    strengths.englishStrength > 0.75 &&
    tags.some((t) => ["creative", "communication", "writing"].includes(t))
  ) {
    explanations.push("your communication skills will serve you well in this role");
  }

  // Overall performance note
  if (strengths.overallPerformance === "excellent") {
    explanations.push("your outstanding academic record shows strong dedication");
  }

  if (explanations.length === 0) {
    return "your academic background supports this career path";
  }

  return explanations.join(", and ");
}
