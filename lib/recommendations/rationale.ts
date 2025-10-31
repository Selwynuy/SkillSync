// ============================================================================
// Rationale Generator (Deterministic Stub + Optional LLM)
// ============================================================================

import type { JobPath } from "@/lib/types";

/**
 * Generate a human-readable rationale for why a job path matches a user.
 *
 * This function provides a deterministic stub implementation that creates
 * structured explanations based on match score and key drivers.
 *
 * In production, you can optionally integrate an LLM by setting the
 * OPENAI_API_KEY environment variable.
 *
 * @param jobPath - The job path being recommended
 * @param drivers - Key traits that drive the match
 * @param score - Similarity score (0-1)
 * @param traitSummary - User's trait scores for context
 * @returns A human-readable explanation of the match
 */
export function generateRationale(
  jobPath: JobPath,
  drivers: string[],
  score: number,
  traitSummary: Record<string, number>
): string {
  // Check if LLM integration is available
  if (process.env.OPENAI_API_KEY && process.env.USE_LLM_RATIONALE === "true") {
    // Placeholder for LLM integration
    // In a real implementation, you would call the OpenAI API here
    return generateLLMRationale(jobPath, drivers, score, traitSummary);
  }

  // Fallback to deterministic stub
  return generateDeterministicRationale(jobPath, drivers, score, traitSummary);
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
  traitSummary: Record<string, number>
): string {
  const matchQuality = getMatchQuality(score);
  const driversText = drivers.length > 0 ? drivers.join(", ") : "your profile";

  // Build rationale based on match quality
  let rationale = `This role is ${matchQuality} match for you. `;

  // Add driver-specific context
  if (drivers.length > 0) {
    rationale += `Your ${driversText} strengths align well with what this career requires. `;
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
 * LLM-based rationale generator (stub implementation).
 *
 * In production, this would make an API call to OpenAI or another LLM service.
 * For now, it falls back to the deterministic approach.
 */
function generateLLMRationale(
  jobPath: JobPath,
  drivers: string[],
  score: number,
  traitSummary: Record<string, number>
): string {
  // TODO: Implement LLM integration
  // Example implementation:
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4",
  //   messages: [
  //     {
  //       role: "system",
  //       content: "You are a career advisor explaining why a job matches someone's traits."
  //     },
  //     {
  //       role: "user",
  //       content: `Generate a brief, friendly explanation for why ${jobPath.title} ` +
  //         `(match score: ${score.toFixed(2)}) is a good fit for someone with ` +
  //         `these key traits: ${drivers.join(", ")}. Their trait scores: ` +
  //         `${JSON.stringify(traitSummary)}. Keep it under 150 words.`
  //     }
  //   ],
  //   temperature: 0.7,
  //   max_tokens: 200
  // });
  // return response.choices[0].message.content || "";

  // For now, fall back to deterministic approach
  console.warn("LLM integration not yet implemented, using deterministic rationale");
  return generateDeterministicRationale(jobPath, drivers, score, traitSummary);
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
  // For deterministic approach, generate individually
  // For LLM approach, could batch API calls for efficiency
  return recommendations.map((rec) =>
    generateRationale(rec.jobPath, rec.drivers, rec.score, rec.traitSummary)
  );
}
