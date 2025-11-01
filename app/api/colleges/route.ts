import { NextResponse } from "next/server";
import { getAllColleges } from "@/lib/repositories/colleges";

/**
 * GET /api/colleges
 *
 * Get all colleges from the database (mock data).
 */
export async function GET() {
  try {
    const colleges = await getAllColleges();

    return NextResponse.json({
      colleges,
      count: colleges.length,
    });
  } catch (error) {
    console.error("Error fetching colleges:", error);
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}
