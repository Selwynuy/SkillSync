import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateSHSTrackRecommendationsForUser } from "@/lib/recommendations/shsTrackService";

/**
 * GET /api/shs-recommendations
 * Get SHS track recommendations for the authenticated user
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topN = parseInt(searchParams.get("topN") || "3", 10);

    const recommendations = await generateSHSTrackRecommendationsForUser(
      session.user.id,
      topN
    );

    return NextResponse.json({
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error("Error generating SHS recommendations:", error);

    if (error instanceof Error && error.message.includes("No completed assessment")) {
      return NextResponse.json(
        { error: "Please complete the career assessment first" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
