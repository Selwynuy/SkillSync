import { NextResponse } from "next/server";
import { getUserAttempts } from "@/lib/assessment/storage";
import { requireAuth } from "@/lib/auth/session";

/**
 * GET /api/dashboard/attempts
 * Fetch all completed assessment attempts for the current user
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const attempts = await getUserAttempts(session.user.id);

    return NextResponse.json({ attempts });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching user attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}
