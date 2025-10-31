import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  getInProgressAttempt,
  completeAttempt,
} from "@/lib/assessment/storage"
import { getAssessmentById } from "@/lib/repositories"
import { calculateTraitScores } from "@/lib/assessment/scoring"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { responses } = await request.json()
    const { id } = await params

    const attempt = await getInProgressAttempt(id)

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    if (attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Load assessment to get questions with weights
    const assessment = await getAssessmentById(attempt.assessmentId)

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      )
    }

    // Collect all questions
    const allQuestions = assessment.modules.flatMap(
      (module) => module.questions
    )

    // Calculate trait scores
    const { traitVector, traitSummary } = calculateTraitScores(
      responses,
      allQuestions
    )

    // Complete the attempt
    const completedAttempt = await completeAttempt(
      id,
      traitVector,
      traitSummary
    )

    return NextResponse.json({
      attemptId: completedAttempt.id,
      traitVector: completedAttempt.traitVector,
      traitSummary: completedAttempt.traitSummary,
    })
  } catch (error) {
    console.error("Error completing attempt:", error)
    return NextResponse.json(
      { error: "Failed to complete attempt" },
      { status: 500 }
    )
  }
}
