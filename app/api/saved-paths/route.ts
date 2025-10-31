import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  saveJobPath,
  getSavedJobPathsWithDetails,
  isJobPathSaved,
} from "@/lib/recommendations";

/**
 * GET /api/saved-paths
 *
 * Get all saved job paths for the authenticated user.
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

    const savedPaths = await getSavedJobPathsWithDetails(session.user.id);

    return NextResponse.json({
      savedPaths,
      count: savedPaths.length,
    });
  } catch (error) {
    console.error("Error fetching saved paths:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved paths" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/saved-paths
 *
 * Save a job path for the authenticated user.
 *
 * Body:
 * - jobPathId: string
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
    const { jobPathId } = body;

    if (!jobPathId || typeof jobPathId !== "string") {
      return NextResponse.json(
        { error: "Valid jobPathId is required" },
        { status: 400 }
      );
    }

    // Check if already saved
    const alreadySaved = await isJobPathSaved(session.user.id, jobPathId);
    if (alreadySaved) {
      return NextResponse.json(
        { message: "Job path already saved", alreadySaved: true },
        { status: 200 }
      );
    }

    const savedPath = await saveJobPath(session.user.id, jobPathId);

    return NextResponse.json(
      {
        message: "Job path saved successfully",
        savedPath,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving job path:", error);
    return NextResponse.json(
      { error: "Failed to save job path" },
      { status: 500 }
    );
  }
}
