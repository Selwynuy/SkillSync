import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserAttempts } from "@/lib/assessment/storage";
import { getSavedJobPaths } from "@/lib/recommendations/service";
import { getUserMilestones } from "@/lib/milestones/storage";
import { getUserById } from "@/lib/auth/users";
import type { DataExportResponse } from "@/lib/types";

/**
 * GET /api/data/export
 *
 * Export all user data as JSON for download.
 * Includes: user profile, assessment attempts, saved job paths, and milestones.
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

    const userId = session.user.id;

    // Fetch all user data
    const [user, attempts, savedPaths, milestones] = await Promise.all([
      getUserById(userId),
      getUserAttempts(userId),
      getSavedJobPaths(userId),
      getUserMilestones(userId),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Build export response
    const exportData: DataExportResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      attempts,
      savedPaths,
      milestones,
      exportedAt: new Date(),
    };

    // Return as JSON with download headers
    const filename = `skillsync-data-${userId}-${Date.now()}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
