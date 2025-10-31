import { AssessmentResponse, AssessmentQuestion } from "@/lib/types"

export interface ScoringResult {
  traitVector: number[]
  traitSummary: Record<string, number>
}

/**
 * Calculate trait scores from assessment responses
 * @param responses User's responses to assessment questions
 * @param questions All assessment questions with weights
 * @returns Normalized trait vector and summary
 */
export function calculateTraitScores(
  responses: AssessmentResponse[],
  questions: AssessmentQuestion[]
): ScoringResult {
  // Create a map of responses for quick lookup
  const responseMap = new Map(
    responses.map((r) => [r.questionId, r])
  )

  // Accumulate weighted scores for each trait
  const traitScores: Record<string, number> = {}
  const traitWeights: Record<string, number> = {}

  questions.forEach((question) => {
    const response = responseMap.get(question.id)
    if (!response) return

    // Get response value as a number (1-5 for Likert, option index for MCQ)
    let responseValue: number

    if (question.type === "likert") {
      responseValue = typeof response.value === "number" ? response.value : 3
    } else if (question.type === "mcq" && question.options) {
      // For MCQ, find the option index (0-based) and normalize to 1-5 scale
      const optionIndex = question.options.indexOf(response.value as string)
      responseValue = optionIndex >= 0
        ? ((optionIndex / (question.options.length - 1)) * 4) + 1
        : 3
    } else {
      responseValue = 3 // Default to neutral
    }

    // Apply weights to calculate trait contributions
    Object.entries(question.weights).forEach(([trait, weight]) => {
      if (!traitScores[trait]) {
        traitScores[trait] = 0
        traitWeights[trait] = 0
      }

      // Normalize response to -2 to +2 scale (Likert 1-5 becomes -2 to +2)
      const normalizedResponse = responseValue - 3

      // Apply weight to get contribution
      const contribution = normalizedResponse * weight

      traitScores[trait] += contribution
      traitWeights[trait] += Math.abs(weight)
    })
  })

  // Normalize scores by total weights and scale to 0-1
  const traitSummary: Record<string, number> = {}
  Object.keys(traitScores).forEach((trait) => {
    if (traitWeights[trait] > 0) {
      // Average the weighted contributions and normalize to 0-1 scale
      const avgScore = traitScores[trait] / traitWeights[trait]
      // Convert from -2 to +2 range to 0-1 range
      traitSummary[trait] = (avgScore + 2) / 4
    } else {
      traitSummary[trait] = 0.5 // Default to neutral
    }
  })

  // Create a standardized trait vector (8 dimensions for job path matching)
  // Map common traits to vector positions
  const traitMapping: Record<string, number> = {
    analytical: 0,
    technical: 1,
    social: 2,
    creative: 3,
    empathetic: 4,
    "hands-on": 5,
    leadership: 6,
    adaptable: 7,
  }

  const traitVector = new Array(8).fill(0.5) // Default to neutral

  Object.entries(traitSummary).forEach(([trait, score]) => {
    const index = traitMapping[trait]
    if (index !== undefined) {
      traitVector[index] = score
    }
  })

  return {
    traitVector,
    traitSummary,
  }
}

/**
 * Normalize a vector to unit length
 */
export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  return magnitude > 0 ? vector.map((val) => val / magnitude) : vector
}
