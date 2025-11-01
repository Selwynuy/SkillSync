/**
 * Email Verification Utilities
 *
 * This module handles sending verification emails to users
 * Uses Resend for email delivery
 */

/**
 * Send a verification email to a user
 * @param email - User's email address
 * @param token - Verification token
 * @param userName - User's name (optional)
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  userName?: string
): Promise<boolean> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      // In development, log the verification URL instead of failing
      if (process.env.NODE_ENV === "development") {
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;
        console.log("\n==============================================");
        console.log("📧 VERIFICATION EMAIL (Development Mode)");
        console.log("==============================================");
        console.log(`To: ${email}`);
        console.log(`Name: ${userName || 'User'}`);
        console.log(`\nVerification Link:\n${verificationUrl}`);
        console.log("==============================================\n");
        return true;
      }
      return false;
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;

    // Send email using Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "SkillSync <noreply@skillsync.com>",
        to: email,
        subject: "Welcome to SkillSync - Verify Your Email",
        html: getVerificationEmailTemplate(verificationUrl, userName),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send verification email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

/**
 * Get the HTML template for verification email
 */
function getVerificationEmailTemplate(verificationUrl: string, userName?: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0C3B2E; font-size: 28px; margin: 0; font-weight: 700;">Welcome to SkillSync!</h1>
      </div>

      <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          ${userName ? `Hi ${userName},` : 'Hello,'}
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Thanks for signing up! We're excited to help you discover your perfect career path.
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          Please verify your email address to complete your account setup and start your personalized career assessment.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #6D9773; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
          Or copy and paste this link into your browser:
        </p>
        <p style="color: #6D9773; font-size: 12px; word-break: break-all; margin: 0;">
          ${verificationUrl}
        </p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
          If you didn't create an account with SkillSync, you can safely ignore this email.
        </p>
        <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
          This link will expire in 24 hours.
        </p>
      </div>
    </div>
  `;
}
