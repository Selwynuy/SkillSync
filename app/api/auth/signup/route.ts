import { NextRequest, NextResponse } from "next/server"
import { createUser, createVerificationToken } from "@/lib/auth/users"
import { sendVerificationEmail } from "@/lib/email/send-verification"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = await createUser(email, password, name)

    // Create verification token
    const token = await createVerificationToken(user.id)

    if (!token) {
      console.error("Failed to create verification token")
      // Still return success, but user won't receive verification email
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        warning: "Account created but verification email could not be sent",
      })
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(email, token, name)

    if (!emailSent) {
      console.error("Failed to send verification email")
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: "Account created successfully! Please check your email to verify your account.",
    })
  } catch (error: any) {
    if (error.message === "User already exists") {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
