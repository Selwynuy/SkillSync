import { NextResponse } from "next/server";
import { getAllJobListings } from "@/lib/repositories/jobListings";

/**
 * GET /api/market/listings
 *
 * Get all job listings from the local market (mock data).
 */
export async function GET() {
  try {
    const listings = await getAllJobListings();

    return NextResponse.json({
      listings,
      count: listings.length,
    });
  } catch (error) {
    console.error("Error fetching job listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch job listings" },
      { status: 500 }
    );
  }
}
