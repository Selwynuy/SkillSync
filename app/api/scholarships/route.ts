import { NextResponse } from "next/server";
import { getAllScholarships } from "@/lib/repositories/scholarships";

/**
 * GET /api/scholarships
 *
 * Get all scholarships from the database (mock data).
 */
export async function GET() {
  try {
    const scholarships = await getAllScholarships();

    return NextResponse.json({
      scholarships,
      count: scholarships.length,
    });
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    return NextResponse.json(
      { error: "Failed to fetch scholarships" },
      { status: 500 }
    );
  }
}
