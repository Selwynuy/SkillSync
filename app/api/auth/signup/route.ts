import { NextRequest, NextResponse } from "next/server"
import { createUser, createVerificationToken } from "@/lib/auth/users"
import { sendVerificationEmail } from "@/lib/email/send-verification"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth and sync to custom users table
    const user = await createUser(email, password, name)

    // Create verification token
    const token = await createVerificationToken(user.id)

    if (!token) {
      console.error("Failed to create verification token")
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        warning: "Account created but verification email could not be sent",
      })
    }

    // Send verification email using free email provider (Resend, SendGrid, Brevo, Mailgun)
    // This works even on free Vercel tier!
    const emailSent = await sendVerificationEmail(email, token, name)

    if (!emailSent) {
      console.error("Failed to send verification email")
      // In development, the email function will log the link
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

    console.error("Signup error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    )
  }
}
