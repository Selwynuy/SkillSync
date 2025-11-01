import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getUserMilestones,
  saveMilestones,
  validateMilestones,
} from "@/lib/milestones/storage";
import { getJobPathById } from "@/lib/repositories/jobPaths";

/**
 * GET /api/milestones
 *
 * Get all milestones for the authenticated user.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userMilestones = await getUserMilestones(session.user.id);

    return NextResponse.json({
      userMilestones,
      count: userMilestones.length,
    });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/milestones
 *
 * Save or update milestones for a job path.
 *
 * Body:
 * - jobPathId: string
 * - milestones: Milestone[]
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobPathId, milestones } = body;

    // Validate jobPathId
    if (!jobPathId || typeof jobPathId !== "string") {
      return NextResponse.json(
        { error: "Valid jobPathId is required" },
        { status: 400 }
      );
    }

    // Verify job path exists
    const jobPath = await getJobPathById(jobPathId);
    if (!jobPath) {
      return NextResponse.json(
        { error: "Job path not found" },
        { status: 404 }
      );
    }

    // Validate milestones
    const validationError = validateMilestones(milestones);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Save milestones
    const savedMilestones = await saveMilestones(
      session.user.id,
      jobPathId,
      milestones
    );

    return NextResponse.json(
      {
        message: "Milestones saved successfully",
        userMilestones: savedMilestones,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving milestones:", error);
    return NextResponse.json(
      { error: "Failed to save milestones" },
      { status: 500 }
    );
  }
}
