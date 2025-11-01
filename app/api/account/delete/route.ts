import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteUser } from "@/lib/auth/users";
import { deleteUserAttempts } from "@/lib/assessment/storage";
import { deleteUserSavedPaths } from "@/lib/recommendations/service";
import { deleteUserMilestones } from "@/lib/milestones";

/**
 * POST /api/account/delete
 *
 * Delete user account and all associated data.
 * Requires confirmation string to prevent accidental deletion.
 *
 * Body:
 * - confirmation: string (must be "DELETE" to proceed)
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
    const { confirmation } = body;

    // Require explicit confirmation
    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { error: "Invalid confirmation. Please type DELETE to confirm account deletion." },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Delete all user-related data
    const [attemptsDeleted, savedPathsDeleted, milestonesDeleted, userDeleted] =
      await Promise.all([
        deleteUserAttempts(userId),
        deleteUserSavedPaths(userId),
        deleteUserMilestones(userId),
        deleteUser(userId),
      ]);

    if (!userDeleted) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Account deleted successfully",
      deletedData: {
        attempts: attemptsDeleted,
        savedPaths: savedPathsDeleted,
        milestones: milestonesDeleted,
      },
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
