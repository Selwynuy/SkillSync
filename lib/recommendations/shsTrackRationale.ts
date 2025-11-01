// ============================================================================
// SHS Track Rationale Generator
// ============================================================================

import type {
  SHSTrack,
  EnrollmentTrend,
  RegionalOutcome,
} from "@/lib/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate a human-readable rationale for why an SHS track matches a user
 */
export async function generateSHSTrackRationale(
  track: SHSTrack,
  drivers: string[],
  score: number,
  traitSummary: Record<string, number>,
  gradeAlignment: {
    meetsRequirements: boolean;
    strengthAreas: string[];
    improvementAreas: string[];
  },
  dropoutRisk: {
    level: "low" | "medium" | "high";
    factors: string[];
    recommendations: string[];
  },
  enrollmentTrend?: EnrollmentTrend | null,
  regionalOutcome?: RegionalOutcome | null
): Promise<string> {
  // Check if Gemini API is available
  if (process.env.GEMINI_API_KEY) {
    try {
      return await generateLLMRationale(
        track,
        drivers,
        score,
        traitSummary,
        gradeAlignment,
        dropoutRisk,
        enrollmentTrend,
        regionalOutcome
      );
    } catch (error) {
      console.error(
        "Error generating LLM rationale, falling back to deterministic:",
        error
      );
      return generateDeterministicRationale(
        track,
        drivers,
        score,
        gradeAlignment,
        dropoutRisk,
        enrollmentTrend,
        regionalOutcome
      );
    }
  }

  return generateDeterministicRationale(
    track,
    drivers,
    score,
    gradeAlignment,
    dropoutRisk,
    enrollmentTrend,
    regionalOutcome
  );
}

/**
 * Deterministic rationale generation
 */
function generateDeterministicRationale(
  track: SHSTrack,
  drivers: string[],
  score: number,
  gradeAlignment: {
    meetsRequirements: boolean;
    strengthAreas: string[];
    improvementAreas: string[];
  },
  dropoutRisk: {
    level: "low" | "medium" | "high";
    factors: string[];
    recommendations: string[];
  },
  enrollmentTrend?: EnrollmentTrend | null,
  regionalOutcome?: RegionalOutcome | null
): string {
  let rationale = "";

  // Match quality
  const matchQuality =
    score >= 0.8 ? "an excellent" : score >= 0.7 ? "a strong" : "a good";
  rationale += `This track is ${matchQuality} match for you. `;

  // Personality alignment
  if (drivers.length > 0) {
    rationale += `Your ${drivers.slice(0, 2).join(" and ")} strengths align well with this track. `;
  }

  // Academic alignment
  if (gradeAlignment.meetsRequirements) {
    rationale += `You meet the academic requirements. `;
    if (gradeAlignment.strengthAreas.length > 0) {
      rationale += `Your strengths in ${gradeAlignment.strengthAreas[0].split(" ")[0]} will help you excel. `;
    }
  } else {
    rationale += `Consider strengthening your skills in ${gradeAlignment.improvementAreas[0]?.split(" ")[0] || "key subjects"} to better prepare. `;
  }

  // Career pathways
  if (track.careerPathways.length > 0) {
    rationale += `This track opens doors to careers like ${track.collegePrograms.slice(0, 2).join(" and ")}. `;
  }

  // Regional data
  if (enrollmentTrend && regionalOutcome) {
    rationale += `In your region, this track has a ${enrollmentTrend.completionRate.toFixed(0)}% completion rate and ${regionalOutcome.collegeAcceptanceRate.toFixed(0)}% college acceptance rate. `;
  }

  // Risk assessment
  if (dropoutRisk.level === "low") {
    rationale += `You have a low dropout risk for this track - you're well-prepared to succeed!`;
  } else if (dropoutRisk.level === "medium") {
    rationale += `With proper preparation and support, you can succeed in this track.`;
  } else {
    rationale += `This track may be challenging - consider counseling to ensure you're fully prepared.`;
  }

  return rationale;
}

/**
 * LLM-based rationale generation using Gemini
 */
async function generateLLMRationale(
  track: SHSTrack,
  drivers: string[],
  score: number,
  traitSummary: Record<string, number>,
  gradeAlignment: {
    meetsRequirements: boolean;
    strengthAreas: string[];
    improvementAreas: string[];
  },
  dropoutRisk: {
    level: "low" | "medium" | "high";
    factors: string[];
    recommendations: string[];
  },
  enrollmentTrend?: EnrollmentTrend | null,
  regionalOutcome?: RegionalOutcome | null
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Build comprehensive prompt
  let prompt = `You are a Filipino guidance counselor helping a Grade 10 student choose their Senior High School (SHS) track.

SHS Track Details:
- Title: ${track.title}
- Type: ${track.trackType}${track.strand ? ` - ${track.strand}` : ""}
- Description: ${track.description}
- Key Tags: ${track.tags.join(", ")}

Student Match Analysis:
- Match Score: ${(score * 100).toFixed(1)}%
- Key Personality Strengths: ${drivers.join(", ")}
- Top Traits: ${Object.entries(traitSummary)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([trait, score]) => `${trait} (${score.toFixed(2)})`)
    .join(", ")}

Academic Alignment:
- Meets Requirements: ${gradeAlignment.meetsRequirements ? "Yes" : "No"}`;

  if (gradeAlignment.strengthAreas.length > 0) {
    prompt += `\n- Academic Strengths: ${gradeAlignment.strengthAreas.join(", ")}`;
  }

  if (gradeAlignment.improvementAreas.length > 0) {
    prompt += `\n- Areas for Improvement: ${gradeAlignment.improvementAreas.join(", ")}`;
  }

  prompt += `\n\nDropout Risk Assessment:
- Risk Level: ${dropoutRisk.level}`;

  if (dropoutRisk.factors.length > 0) {
    prompt += `\n- Risk Factors: ${dropoutRisk.factors.join("; ")}`;
  }

  if (enrollmentTrend) {
    prompt += `\n\nRegional Data:
- Completion Rate: ${enrollmentTrend.completionRate.toFixed(1)}%
- College Transition Rate: ${enrollmentTrend.collegeTransitionRate.toFixed(1)}%`;
  }

  if (regionalOutcome) {
    prompt += `\n- College Acceptance Rate: ${regionalOutcome.collegeAcceptanceRate.toFixed(1)}%
- Employment Rate: ${regionalOutcome.employmentWithinSixMonths.toFixed(1)}%`;
  }

  prompt += `\n\nCareer Pathways:
${track.collegePrograms.slice(0, 5).join(", ")}

Task: Write a brief, encouraging, and personalized explanation (3-4 sentences, max 200 words) for why this SHS track is a good fit for this student. Focus on:
1. How their personality strengths align with the track
2. Their academic readiness
3. Career opportunities this track provides
4. Any preparation needed if dropout risk is medium/high

Be conversational, supportive, and specific to the Philippine education system. Mention "Senior High School" or "SHS" naturally. If there are concerns, phrase them constructively.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  return text.trim();
}
