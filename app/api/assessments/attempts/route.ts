import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAttempt } from "@/lib/assessment/storage"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assessmentId } = await request.json()

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      )
    }

    const attemptId = await createAttempt(session.user.id, assessmentId)

    return NextResponse.json({ attemptId })
  } catch (error) {
    console.error("Error creating attempt:", error)
    return NextResponse.json(
      { error: "Failed to create attempt" },
      { status: 500 }
    )
  }
}
