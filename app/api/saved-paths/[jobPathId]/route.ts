import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { unsaveJobPath } from "@/lib/recommendations";

/**
 * DELETE /api/saved-paths/[jobPathId]
 *
 * Unsave a job path for the authenticated user.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobPathId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { jobPathId } = await params;

    if (!jobPathId) {
      return NextResponse.json(
        { error: "Job path ID is required" },
        { status: 400 }
      );
    }

    const deleted = await unsaveJobPath(session.user.id, jobPathId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Job path not found in saved list" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Job path removed successfully",
    });
  } catch (error) {
    console.error("Error unsaving job path:", error);
    return NextResponse.json(
      { error: "Failed to unsave job path" },
      { status: 500 }
    );
  }
}
