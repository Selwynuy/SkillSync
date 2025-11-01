import { NextResponse } from "next/server";
import { getAllSHSTracks } from "@/lib/repositories";

/**
 * GET /api/shs-tracks
 * Get all SHS tracks
 */
export async function GET() {
  try {
    const tracks = await getAllSHSTracks();

    return NextResponse.json({
      tracks,
      total: tracks.length,
    });
  } catch (error) {
    console.error("Error fetching SHS tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch SHS tracks" },
      { status: 500 }
    );
  }
}
