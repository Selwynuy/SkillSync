/**
 * Personal Information Analysis for Career Recommendations
 *
 * Analyzes user academic performance, achievements, hobbies, and skills
 * to enhance career matching
 */

import type { PersonalInformation, UserGrades, JobPath } from "@/lib/types";

/**
 * Calculate average grade across all subjects and levels
 */
function calculateOverallAverage(info: PersonalInformation): number {
  const allGrades: number[] = [];

  // Collect all available grades from all levels (including 11 and 12)
  [info.grade7, info.grade8, info.grade9, info.grade10, info.grade11, info.grade12].forEach((level) => {
    if (level) {
      if (level.math !== undefined) allGrades.push(level.math);
      if (level.english !== undefined) allGrades.push(level.english);
      if (level.science !== undefined) allGrades.push(level.science);
      if (level.filipino !== undefined) allGrades.push(level.filipino);
      if (level.totalAverage !== undefined) allGrades.push(level.totalAverage);

      // Include custom subjects
      if (level.customSubjects && level.customSubjects.length > 0) {
        level.customSubjects.forEach((subject) => {
          allGrades.push(subject.grade);
        });
      }
    }
  });

  if (allGrades.length === 0) return 0;

  return allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length;
}

/**
 * Calculate average grade for a specific subject across all levels
 */
function calculateSubjectAverage(
  info: PersonalInformation,
  subject: "math" | "english" | "science" | "filipino"
): number {
  const subjectGrades: number[] = [];

  [info.grade7, info.grade8, info.grade9, info.grade10, info.grade11, info.grade12].forEach((level) => {
    if (level && level[subject] !== undefined) {
      subjectGrades.push(level[subject]!);
    }
  });

  if (subjectGrades.length === 0) return 0;

  return subjectGrades.reduce((sum, grade) => sum + grade, 0) / subjectGrades.length;
}

/**
 * Calculate average total average or GPA across all levels
 */
function calculateAverageTotalGrade(info: PersonalInformation): number {
  const totals: number[] = [];

  [info.grade7, info.grade8, info.grade9, info.grade10, info.grade11, info.grade12].forEach((level) => {
    if (level) {
      // Use totalAverage (which is already in percentage format)
      if (level.totalAverage !== undefined) {
        totals.push(level.totalAverage);
      }
    }
  });

  if (totals.length === 0) return 0;

  return totals.reduce((sum, total) => sum + total, 0) / totals.length;
}

/**
 * Analyze achievements for career relevance
 */
function analyzeAchievements(info: PersonalInformation, jobPath: JobPath): {
  relevantAchievements: number;
  leadershipCount: number;
  competitionCount: number;
  academicCount: number;
} {
  if (!info.achievements || info.achievements.length === 0) {
    return {
      relevantAchievements: 0,
      leadershipCount: 0,
      competitionCount: 0,
      academicCount: 0,
    };
  }

  const tags = jobPath.tags.map((t) => t.toLowerCase());
  let relevantCount = 0;
  let leadershipCount = 0;
  let competitionCount = 0;
  let academicCount = 0;

  info.achievements.forEach((achievement) => {
    const title = achievement.title.toLowerCase();
    const desc = achievement.description?.toLowerCase() || "";

    // Count by category
    if (achievement.category === "leadership") leadershipCount++;
    if (achievement.category === "competition") competitionCount++;
    if (achievement.category === "academic") academicCount++;

    // Check for relevance to job path
    const achievementText = `${title} ${desc}`;
    tags.forEach((tag) => {
      if (achievementText.includes(tag)) {
        relevantCount++;
      }
    });

    // Check for general STEM, creative, or leadership keywords
    if (tags.some((t) => ["technical", "analytical", "engineering"].includes(t))) {
      if (achievementText.match(/(math|science|programming|coding|technology|stem)/i)) {
        relevantCount++;
      }
    }

    if (tags.some((t) => ["creative", "artistic", "design"].includes(t))) {
      if (achievementText.match(/(art|design|creative|music|writing)/i)) {
        relevantCount++;
      }
    }

    if (tags.some((t) => ["leadership", "management", "organizational"].includes(t))) {
      if (achievement.category === "leadership") {
        relevantCount++;
      }
    }
  });

  return {
    relevantAchievements: relevantCount,
    leadershipCount,
    competitionCount,
    academicCount,
  };
}

/**
 * Analyze hobbies for career relevance
 */
function analyzeHobbies(info: PersonalInformation, jobPath: JobPath): {
  relevantHobbies: number;
  advancedHobbies: number;
} {
  if (!info.hobbies || info.hobbies.length === 0) {
    return { relevantHobbies: 0, advancedHobbies: 0 };
  }

  const tags = jobPath.tags.map((t) => t.toLowerCase());
  let relevantCount = 0;
  let advancedCount = 0;

  info.hobbies.forEach((hobby) => {
    if (hobby.skillLevel === "advanced" || hobby.skillLevel === "expert") {
      advancedCount++;
    }

    const hobbyText = `${hobby.name} ${hobby.description || ""}`.toLowerCase();

    // Check for relevance
    tags.forEach((tag) => {
      if (hobbyText.includes(tag)) {
        relevantCount++;
      }
    });

    // Specific hobby-career alignments
    if (tags.some((t) => ["technical", "analytical", "programming"].includes(t))) {
      if (hobbyText.match(/(programming|coding|computer|technology|gaming)/i)) {
        relevantCount++;
      }
    }

    if (tags.some((t) => ["creative", "artistic", "design"].includes(t))) {
      if (hobbyText.match(/(art|drawing|design|music|photography|creative|crafts)/i)) {
        relevantCount++;
      }
    }

    if (tags.some((t) => ["healthcare", "helping", "social"].includes(t))) {
      if (hobbyText.match(/(volunteer|helping|community|care|tutoring)/i)) {
        relevantCount++;
      }
    }
  });

  return { relevantHobbies: relevantCount, advancedHobbies: advancedCount };
}

/**
 * Analyze skills for career relevance
 */
function analyzeSkills(info: PersonalInformation, jobPath: JobPath): {
  relevantSkills: number;
  technicalSkills: number;
  softSkills: number;
} {
  if (!info.skills || info.skills.length === 0) {
    return { relevantSkills: 0, technicalSkills: 0, softSkills: 0 };
  }

  const tags = jobPath.tags.map((t) => t.toLowerCase());
  let relevantCount = 0;
  let technicalCount = 0;
  let softCount = 0;

  const technicalKeywords = /program|code|software|data|tech|engineer|design|analysis|computer/i;
  const softKeywords = /communication|leadership|team|creative|problem|critical|organization/i;

  info.skills.forEach((skill) => {
    const skillLower = skill.toLowerCase();

    // Categorize skill
    if (technicalKeywords.test(skill)) {
      technicalCount++;
    } else if (softKeywords.test(skill)) {
      softCount++;
    }

    // Check for relevance
    tags.forEach((tag) => {
      if (skillLower.includes(tag) || tag.includes(skillLower)) {
        relevantCount++;
      }
    });
  });

  return { relevantSkills: relevantCount, technicalSkills: technicalCount, softSkills: softCount };
}

/**
 * Determine academic strengths based on grades and personal information
 */
export function identifyAcademicStrengths(info: PersonalInformation): {
  strongestSubject: string | null;
  overallPerformance: "excellent" | "good" | "average" | "needs_improvement";
  mathStrength: number; // 0-1
  englishStrength: number; // 0-1
  scienceStrength: number; // 0-1
  filipinoStrength: number; // 0-1
  averageTotal: number;
  overallAverage: number;
  hasAchievements: boolean;
  hasHobbies: boolean;
  hasSkills: boolean;
  totalAchievements: number;
  totalHobbies: number;
  totalSkills: number;
} {
  const mathAvg = calculateSubjectAverage(info, "math");
  const englishAvg = calculateSubjectAverage(info, "english");
  const scienceAvg = calculateSubjectAverage(info, "science");
  const filipinoAvg = calculateSubjectAverage(info, "filipino");
  const overallAvg = calculateOverallAverage(info);
  const totalAvg = calculateAverageTotalGrade(info);

  // Determine strongest subject
  let strongestSubject: string | null = null;
  const subjectAverages = {
    Math: mathAvg,
    English: englishAvg,
    Science: scienceAvg,
    Filipino: filipinoAvg,
  };

  const maxGrade = Math.max(mathAvg, englishAvg, scienceAvg, filipinoAvg);
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
    filipinoStrength: filipinoAvg / 100,
    averageTotal: totalAvg,
    overallAverage: overallAvg,
    hasAchievements: (info.achievements?.length || 0) > 0,
    hasHobbies: (info.hobbies?.length || 0) > 0,
    hasSkills: (info.skills?.length || 0) > 0,
    totalAchievements: info.achievements?.length || 0,
    totalHobbies: info.hobbies?.length || 0,
    totalSkills: info.skills?.length || 0,
  };
}

/**
 * Calculate grade and personal information boost for a job path
 * Returns a boost factor (0.0 to 0.25) to add to the base similarity score
 */
export function calculateGradeBoost(
  info: PersonalInformation | UserGrades | null,
  jobPath: JobPath
): number {
  if (!info || !info.consentToUse) {
    return 0; // No boost if no info or no consent
  }

  const strengths = identifyAcademicStrengths(info);
  const achievementAnalysis = analyzeAchievements(info, jobPath);
  const hobbyAnalysis = analyzeHobbies(info, jobPath);
  const skillAnalysis = analyzeSkills(info, jobPath);

  let boost = 0;

  // Base boost on overall performance (max 5%)
  if (strengths.overallPerformance === "excellent") {
    boost += 0.05;
  } else if (strengths.overallPerformance === "good") {
    boost += 0.03;
  } else if (strengths.overallPerformance === "average") {
    boost += 0.01;
  }

  // Subject-specific boosts based on job path tags (max 8%)
  const tags = jobPath.tags.map((t) => t.toLowerCase());

  // STEM careers benefit from math/science
  if (
    tags.some((t) =>
      ["analytical", "technical", "scientific", "mathematical", "engineering"].includes(t)
    )
  ) {
    boost += strengths.mathStrength * 0.04;
    boost += strengths.scienceStrength * 0.04;
  }

  // Creative/Communication careers benefit from English
  if (
    tags.some((t) =>
      ["creative", "communication", "writing", "artistic", "social"].includes(t)
    )
  ) {
    boost += strengths.englishStrength * 0.04;
  }

  // Healthcare/Science careers heavily benefit from science
  if (
    tags.some((t) => ["healthcare", "medical", "biological", "scientific"].includes(t))
  ) {
    boost += strengths.scienceStrength * 0.06;
  }

  // Achievement boosts (max 5%)
  if (achievementAnalysis.relevantAchievements > 0) {
    boost += Math.min(achievementAnalysis.relevantAchievements * 0.01, 0.03);
  }
  if (achievementAnalysis.leadershipCount > 0 &&
      tags.some((t) => ["leadership", "management"].includes(t))) {
    boost += 0.02;
  }

  // Hobby boosts (max 3%)
  if (hobbyAnalysis.relevantHobbies > 0) {
    boost += Math.min(hobbyAnalysis.relevantHobbies * 0.01, 0.02);
  }
  if (hobbyAnalysis.advancedHobbies > 0) {
    boost += 0.01;
  }

  // Skill boosts (max 4%)
  if (skillAnalysis.relevantSkills > 0) {
    boost += Math.min(skillAnalysis.relevantSkills * 0.015, 0.04);
  }

  // Cap the total boost at 25%
  return Math.min(boost, 0.25);
}

/**
 * Get a text summary of personal information for AI rationale
 */
export function getGradeSummary(info: PersonalInformation | UserGrades | null): string | null {
  if (!info || !info.consentToUse) {
    return null;
  }

  const strengths = identifyAcademicStrengths(info);

  if (strengths.overallAverage === 0 && !strengths.hasAchievements && !strengths.hasHobbies && !strengths.hasSkills) {
    return null; // No information provided
  }

  const parts: string[] = [];

  // Overall performance
  if (strengths.overallAverage > 0) {
    parts.push(
      `Academic performance: ${strengths.overallPerformance} (${strengths.overallAverage.toFixed(1)}% avg)`
    );
  }

  // Strongest subject
  if (strengths.strongestSubject) {
    parts.push(`Strongest: ${strengths.strongestSubject}`);
  }

  // Achievements
  if (strengths.hasAchievements) {
    parts.push(`${strengths.totalAchievements} achievement${strengths.totalAchievements > 1 ? 's' : ''}`);
  }

  // Hobbies
  if (strengths.hasHobbies) {
    parts.push(`${strengths.totalHobbies} interest${strengths.totalHobbies > 1 ? 's' : ''}`);
  }

  // Skills
  if (strengths.hasSkills) {
    parts.push(`${strengths.totalSkills} skill${strengths.totalSkills > 1 ? 's' : ''}`);
  }

  // Languages
  if (info.languages && info.languages.length > 0) {
    parts.push(`${info.languages.length} language${info.languages.length > 1 ? 's' : ''}`);
  }

  return parts.join(" | ");
}

/**
 * Explain how personal information influenced the recommendation
 */
export function explainGradeInfluence(
  info: PersonalInformation | UserGrades | null,
  jobPath: JobPath,
  boost: number
): string | null {
  if (!info || !info.consentToUse || boost === 0) {
    return null;
  }

  const strengths = identifyAcademicStrengths(info);
  const achievementAnalysis = analyzeAchievements(info, jobPath);
  const hobbyAnalysis = analyzeHobbies(info, jobPath);
  const skillAnalysis = analyzeSkills(info, jobPath);
  const tags = jobPath.tags.map((t) => t.toLowerCase());

  const explanations: string[] = [];

  // Check for subject-career alignment
  if (
    strengths.mathStrength > 0.75 &&
    tags.some((t) => ["analytical", "technical", "mathematical"].includes(t))
  ) {
    explanations.push("your strong math skills align with this technical field");
  }

  if (
    strengths.scienceStrength > 0.75 &&
    tags.some((t) => ["scientific", "healthcare", "medical", "biological"].includes(t))
  ) {
    explanations.push("your excellent science background is ideal");
  }

  if (
    strengths.englishStrength > 0.75 &&
    tags.some((t) => ["creative", "communication", "writing"].includes(t))
  ) {
    explanations.push("your communication skills are well-suited");
  }

  // Achievement relevance
  if (achievementAnalysis.relevantAchievements > 0) {
    explanations.push(`${achievementAnalysis.relevantAchievements} relevant achievement${achievementAnalysis.relevantAchievements > 1 ? 's' : ''}`);
  }

  // Hobby relevance
  if (hobbyAnalysis.relevantHobbies > 0) {
    explanations.push(`your interests align with this path`);
  }

  // Skill relevance
  if (skillAnalysis.relevantSkills > 0) {
    explanations.push(`${skillAnalysis.relevantSkills} matching skill${skillAnalysis.relevantSkills > 1 ? 's' : ''}`);
  }

  // Overall performance note
  if (strengths.overallPerformance === "excellent" && explanations.length < 3) {
    explanations.push("your outstanding academic record");
  }

  if (explanations.length === 0) {
    return "your background supports this career path";
  }

  return explanations.join(", ");
}

// Type alias for backwards compatibility
export type { UserGrades, PersonalInformation };
