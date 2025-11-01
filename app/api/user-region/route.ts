import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRegion, setUserRegion } from "@/lib/repositories";

/**
 * GET /api/user-region
 * Get the current user's region
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const region = await getUserRegion(session.user.id);

    return NextResponse.json({ region });
  } catch (error) {
    console.error("Error fetching user region:", error);
    return NextResponse.json(
      { error: "Failed to fetch region" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user-region
 * Set the current user's region
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { region, province, cityMunicipality } = body;

    if (!region) {
      return NextResponse.json({ error: "Region is required" }, { status: 400 });
    }

    const success = await setUserRegion(
      session.user.id,
      region,
      province,
      cityMunicipality
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to set region" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, region });
  } catch (error) {
    console.error("Error setting user region:", error);
    return NextResponse.json(
      { error: "Failed to set region" },
      { status: 500 }
    );
  }
}
