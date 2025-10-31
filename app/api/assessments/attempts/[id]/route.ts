import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  getInProgressAttempt,
  updateAttemptProgress,
} from "@/lib/assessment/storage"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const attempt = await getInProgressAttempt(id)

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    if (attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(attempt)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load attempt" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { responses, currentModuleIndex } = await request.json()
    const { id } = await params

    const attempt = await getInProgressAttempt(id)

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    if (attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await updateAttemptProgress(id, responses, currentModuleIndex)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update attempt" },
      { status: 500 }
    )
  }
}
