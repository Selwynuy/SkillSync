// ============================================================================
// Rationale Generator (Deterministic + Gemini LLM)
// ============================================================================

import type { JobPath, UserGrades } from "@/lib/types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGradeSummary, explainGradeInfluence } from "./grade-analysis";

/**
 * Generate a human-readable rationale for why a job path matches a user.
 *
 * This function can use either a deterministic approach or integrate with
 * Google's Gemini API for more natural, personalized explanations.
 *
 * Set GEMINI_API_KEY environment variable to enable LLM-based rationales.
 *
 * @param jobPath - The job path being recommended
 * @param drivers - Key traits that drive the match
 * @param score - Similarity score (0-1)
 * @param traitSummary - User's trait scores for context
 * @param userGrades - Optional user academic grades
 * @param gradeBoost - Optional boost applied from grades (0-0.15)
 * @returns A human-readable explanation of the match
 */
export async function generateRationale(
  jobPath: JobPath,
  drivers: string[],
  score: number,
  traitSummary: Record<string, number>,
  userGrades?: UserGrades | null,
  gradeBoost?: number
): Promise<string> {
  // Check if Gemini API is available
  if (process.env.GEMINI_API_KEY) {
    try {
      return await generateLLMRationale(
        jobPath,
        drivers,
        score,
        traitSummary,
        userGrades,
        gradeBoost
      );
    } catch (error) {
      console.error("Error generating LLM rationale, falling back to deterministic:", error);
      // Fall back to deterministic on error
      return generateDeterministicRationale(
        jobPath,
        drivers,
        score,
        traitSummary,
        userGrades,
        gradeBoost
      );
    }
  }

  // Fallback to deterministic stub
  return generateDeterministicRationale(
    jobPath,
    drivers,
    score,
    traitSummary,
    userGrades,
    gradeBoost
  );
}

/**
 * Deterministic rationale generator that creates structured explanations.
 *
 * This stub implementation provides consistent, readable explanations
 * without requiring an external LLM service.
 */
function generateDeterministicRationale(
  jobPath: JobPath,
  drivers: string[],
  score: number,
  traitSummary: Record<string, number>,
  userGrades?: UserGrades | null,
  gradeBoost?: number
): string {
  const matchQuality = getMatchQuality(score);
  const driversText = drivers.length > 0 ? drivers.join(", ") : "your profile";

  // Build rationale based on match quality
  let rationale = `This role is ${matchQuality} match for you. `;

  // Add driver-specific context
  if (drivers.length > 0) {
    rationale += `Your ${driversText} strengths align well with what this career requires. `;
  }

  // Add grade influence if applicable
  if (userGrades && gradeBoost && gradeBoost > 0.01) {
    const gradeInfluence = explainGradeInfluence(userGrades, jobPath, gradeBoost);
    if (gradeInfluence) {
      rationale += `Additionally, ${gradeInfluence}. `;
    }
  }

  // Add job-specific details
  const salaryText = formatSalaryRange(jobPath.salaryRange);
  rationale += `${jobPath.title} roles typically offer ${salaryText} `;

  // Add education and growth context
  if (jobPath.educationLevel) {
    rationale += `and typically require ${jobPath.educationLevel} level education. `;
  }

  if (jobPath.growthRate > 5) {
    rationale += `This field is experiencing strong growth (${jobPath.growthRate}% projected), creating good opportunities for career advancement. `;
  } else if (jobPath.growthRate < 0) {
    rationale += `Note that this field is experiencing slower growth (${jobPath.growthRate}% projected), so competition may be higher. `;
  }

  // Add trait-specific insights
  const traitInsights = generateTraitInsights(drivers, traitSummary, jobPath);
  if (traitInsights) {
    rationale += traitInsights;
  }

  return rationale.trim();
}

/**
 * Get a qualitative description of match quality based on score.
 */
function getMatchQuality(score: number): string {
  if (score >= 0.9) return "an excellent";
  if (score >= 0.8) return "a very strong";
  if (score >= 0.7) return "a strong";
  if (score >= 0.6) return "a good";
  if (score >= 0.5) return "a moderate";
  return "a potential";
}

/**
 * Format salary range for display.
 */
function formatSalaryRange(range: { min: number; max: number }): string {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  return `${formatCurrency(range.min)} - ${formatCurrency(range.max)}`;
}

/**
 * Generate insights based on specific trait alignments.
 */
function generateTraitInsights(
  drivers: string[],
  traitSummary: Record<string, number>,
  jobPath: JobPath
): string {
  const insights: string[] = [];

  // Map drivers to specific insights
  for (const driver of drivers.slice(0, 2)) {
    const score = traitSummary[driver] || 0;

    if (driver.toLowerCase().includes("analytical")) {
      if (score > 0.7) {
        insights.push(
          "Your analytical mindset will help you excel in problem-solving aspects of this role."
        );
      }
    } else if (driver.toLowerCase().includes("creative")) {
      if (score > 0.7) {
        insights.push(
          "Your creativity will be a valuable asset for innovation and fresh approaches."
        );
      }
    } else if (driver.toLowerCase().includes("social")) {
      if (score > 0.7) {
        insights.push(
          "Your social strengths will support effective collaboration and relationship building."
        );
      }
    } else if (driver.toLowerCase().includes("leadership")) {
      if (score > 0.7) {
        insights.push(
          "Your leadership qualities position you well for advancement into management roles."
        );
      }
    } else if (driver.toLowerCase().includes("detail")) {
      if (score > 0.7) {
        insights.push(
          "Your attention to detail will be crucial for maintaining high quality standards."
        );
      }
    } else if (driver.toLowerCase().includes("practical")) {
      if (score > 0.7) {
        insights.push(
          "Your practical approach will help you deliver tangible results quickly."
        );
      }
    }
  }

  return insights.join(" ");
}

/**
 * LLM-based rationale generator using Google Gemini.
 *
 * Generates natural, personalized career match explanations using AI.
 */
async function generateLLMRationale(
  jobPath: JobPath,
  drivers: string[],
  score: number,
  traitSummary: Record<string, number>,
  userGrades?: UserGrades | null,
  gradeBoost?: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Format salary range
  const salaryText = formatSalaryRange(jobPath.salaryRange);

  // Format trait summary for better readability
  const topTraits = Object.entries(traitSummary)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([trait, score]) => `${trait}: ${score.toFixed(2)}`)
    .join(", ");

  // Get grade summary if available
  const gradeSummary = getGradeSummary(userGrades ?? null);
  const gradeInfluence = userGrades && gradeBoost
    ? explainGradeInfluence(userGrades, jobPath, gradeBoost)
    : null;

  // Build prompt with optional grade information
  let prompt = `You are a friendly career advisor helping someone understand why a career matches their personality and skills.

Career Details:
- Title: ${jobPath.title}
- Description: ${jobPath.description}
- Salary Range: ${salaryText}
- Education Required: ${jobPath.educationLevel}
- Job Market Growth Rate: ${jobPath.growthRate}%
- Key Tags: ${jobPath.tags.join(", ")}

Match Analysis:
- Match Score: ${(score * 100).toFixed(1)}% (${score.toFixed(3)} on 0-1 scale)
- Key Trait Drivers: ${drivers.join(", ")}
- User's Top Traits: ${topTraits}`;

  // Add grade information if available
  if (gradeSummary) {
    prompt += `

Academic Background:
- ${gradeSummary}`;

    if (gradeInfluence) {
      prompt += `
- Grade Alignment: ${gradeInfluence}`;
    }

    if (gradeBoost && gradeBoost > 0.01) {
      prompt += `
- Academic Boost to Match: +${(gradeBoost * 100).toFixed(1)}% (grades enhanced this recommendation)`;
    }
  }

  prompt += `

Task: Write a brief, friendly, and natural explanation (2-3 sentences, max 150 words) for why this career is a good fit for this person. Focus on:
1. How their key strengths (${drivers.slice(0, 3).join(", ")}) align with the role
2. What makes this career exciting based on their personality`;

  if (gradeSummary) {
    prompt += `
3. How their academic background supports this career choice`;
  }

  prompt += `
${gradeSummary ? "4" : "3"}. One practical benefit (salary, growth, or education fit)

Be conversational and encouraging, not robotic. Avoid phrases like "based on your traits" or "according to the data." Write like you're talking to a friend about their career options.${gradeSummary ? " If grades are mentioned, naturally weave them into the explanation without making it sound forced." : ""}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  return text.trim();
}

/**
 * Batch generate rationales for multiple recommendations.
 * Useful for optimizing LLM API calls with batch processing.
 */
export async function generateRationaleBatch(
  recommendations: Array<{
    jobPath: JobPath;
    drivers: string[];
    score: number;
    traitSummary: Record<string, number>;
  }>
): Promise<string[]> {
  // Generate all rationales concurrently for better performance
  return Promise.all(
    recommendations.map((rec) =>
      generateRationale(rec.jobPath, rec.drivers, rec.score, rec.traitSummary)
    )
  );
}
