import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateRecommendationsForUser } from "@/lib/recommendations";

/**
 * GET /api/recommendations
 *
 * Get personalized job path recommendations for the authenticated user
 * based on their latest assessment results.
 *
 * Query params:
 * - limit: Number of recommendations to return (default: 5, max: 20)
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "5", 10),
      20
    );

    // Generate recommendations
    const recommendations = await generateRecommendationsForUser(
      session.user.id,
      limit
    );

    return NextResponse.json({
      recommendations,
      generatedAt: new Date().toISOString(),
      count: recommendations.length,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);

    if (error instanceof Error) {
      if (error.message.includes("No completed assessment")) {
        return NextResponse.json(
          {
            error: "No assessment found",
            message:
              "Please complete an assessment before viewing recommendations.",
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
