import { NextRequest, NextResponse } from "next/server"
import { verifyEmailToken, markEmailVerified } from "@/lib/auth/users"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")
    const tokenHash = searchParams.get("token_hash")

    // Handle Supabase confirmation links (they use token_hash parameter)
    if (tokenHash) {
      // Try to find user by the stored token hash (if we stored it)
      const { data: userData } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("verification_token", tokenHash)
        .maybeSingle()

      if (userData) {
        // Verify the email in Supabase Auth
        const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.admin.updateUserById(
          userData.id,
          { email_confirm: true }
        )

        if (!verifyError && verifyData?.user) {
          // Sync email_verified status to our custom table
          await markEmailVerified(userData.id)

          // Clear verification token
          await supabaseAdmin
            .from("users")
            .update({
              verification_token: null,
              verification_token_expires: null,
            })
            .eq("id", userData.id)

          return NextResponse.redirect(
            new URL("/auth/signin?verified=true", request.url)
          )
        }
      }

      // If we can't find by token hash, try to verify using Supabase Auth directly
      // Supabase's confirmation links include the token_hash which we can use
      // Note: This is a fallback - ideally we'd use Supabase's built-in verification
      return NextResponse.redirect(
        new URL("/auth/signin?error=expired_token", request.url)
      )
    }

    // Handle our custom token system (legacy)
    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=invalid_token", request.url)
      )
    }

    const userId = await verifyEmailToken(token)

    if (!userId) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=expired_token", request.url)
      )
    }

    // Also verify in Supabase Auth (user should exist there since we create them in Auth)
    try {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
      if (authUser?.user && !authError) {
        await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true })
      }
    } catch (error) {
      console.error("Error syncing email verification to Supabase Auth:", error)
      // Continue anyway - our custom table is already updated
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
