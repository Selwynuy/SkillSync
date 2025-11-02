import { NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth/users"
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
    // Supabase will automatically send confirmation email if SMTP is configured
    const user = await createUser(email, password, name)

    // Generate confirmation link using Supabase Auth
    // Configure redirect URL to point to our verification endpoint
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectTo = `${appUrl}/api/auth/verify-email`

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email.toLowerCase(),
      password: password,
      options: {
        redirectTo: redirectTo,
      },
    })

    if (linkError) {
      console.error("Error generating confirmation link:", linkError)
      // User is still created, Supabase may send email automatically
    } else if (linkData?.properties?.action_link) {
      // Store the confirmation token for our verification handler
      const hashedToken = linkData.properties.hashed_token
      if (hashedToken) {
        await supabaseAdmin
          .from("users")
          .update({
            verification_token: hashedToken,
            verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq("id", user.id)
      }

      // In development, log the confirmation link if email isn't configured
      if (process.env.NODE_ENV === "development") {
        console.log("\n==============================================")
        console.log("📧 EMAIL VERIFICATION LINK (Development)")
        console.log("==============================================")
        console.log(`To: ${email}`)
        console.log(`\nConfirmation Link:\n${linkData.properties.action_link}`)
        console.log("==============================================\n")
      }
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
