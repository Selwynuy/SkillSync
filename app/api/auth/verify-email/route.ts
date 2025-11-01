import { NextRequest, NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/auth/users"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=invalid_token", request.url)
      )
    }

    // Verify the token and mark email as verified
    const userId = await verifyEmailToken(token)

    if (!userId) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=expired_token", request.url)
      )
    }

    // Redirect to sign in page with success message
    return NextResponse.redirect(
      new URL("/auth/signin?verified=true", request.url)
    )
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.redirect(
      new URL("/auth/signin?error=verification_failed", request.url)
    )
  }
}
