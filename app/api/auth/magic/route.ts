import { NextRequest, NextResponse } from "next/server"
import { createMagicToken, getUserByEmail } from "@/lib/auth/users"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists (create account if not)
    const user = await getUserByEmail(email)

    // Generate magic token
    const token = createMagicToken(email)

    // In production, this would send an email with the magic link
    // For MVP, we'll log it to console
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const magicLink = `${baseUrl}/api/auth/callback/magic-link?token=${token}&email=${encodeURIComponent(email)}`

    console.log(`
========================================
Magic Link for ${email}
========================================
${magicLink}
========================================
    `)

    return NextResponse.json({
      message: "Magic link sent successfully",
      // Include link in response for demo purposes
      magicLink: magicLink,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    )
  }
}
