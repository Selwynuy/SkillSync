import { NextResponse } from "next/server";
import { getAllSHSTracks } from "@/lib/repositories/shsTracks";

/**
 * GET /api/strands
 *
 * Get all SHS tracks/strands
 */
export async function GET() {
  try {
    const tracks = await getAllSHSTracks();

    return NextResponse.json({
      tracks,
      count: tracks.length,
    });
  } catch (error) {
    console.error("Error fetching SHS tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch SHS tracks" },
      { status: 500 }
    );
  }
}
