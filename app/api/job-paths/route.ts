import { NextResponse } from "next/server";
import { getAllJobPaths } from "@/lib/repositories";

export async function GET() {
  try {
    const jobPaths = await getAllJobPaths();

    return NextResponse.json({
      jobPaths,
      total: jobPaths.length,
    });
  } catch (error) {
    console.error("Error fetching job paths:", error);
    return NextResponse.json(
      { error: "Failed to fetch job paths" },
      { status: 500 }
    );
  }
}
