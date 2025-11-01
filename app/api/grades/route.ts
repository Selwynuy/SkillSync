import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserGrades, upsertUserGrades } from "@/lib/repositories/grades";

/**
 * GET /api/grades
 * Get the current user's grades
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const grades = await getUserGrades(session.user.id);

    if (!grades) {
      return NextResponse.json({ grades: null });
    }

    return NextResponse.json({ grades });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/grades
 * Create or update the current user's grades
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (typeof body.consentToUse !== "boolean") {
      return NextResponse.json(
        { error: "Consent is required" },
        { status: 400 }
      );
    }

    const grades = await upsertUserGrades(session.user.id, {
      grade7: body.grade7,
      grade8: body.grade8,
      grade9: body.grade9,
      grade10: body.grade10,
      additionalNotes: body.additionalNotes,
      consentToUse: body.consentToUse,
    });

    if (!grades) {
      return NextResponse.json(
        { error: "Failed to save grades" },
        { status: 500 }
      );
    }

    return NextResponse.json({ grades });
  } catch (error) {
    console.error("Error saving grades:", error);
    return NextResponse.json(
      { error: "Failed to save grades" },
      { status: 500 }
    );
  }
}
