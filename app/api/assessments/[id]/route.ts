import { NextRequest, NextResponse } from "next/server"
import { getAssessmentById } from "@/lib/repositories"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const assessment = await getAssessmentById(id)

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(assessment)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load assessment" },
      { status: 500 }
    )
  }
}
