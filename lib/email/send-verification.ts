/**
 * Email Verification Utilities
 *
 * This module handles sending verification emails to users
 * Supports multiple free email providers: Resend, SendGrid, Mailgun, Brevo
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
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;

    // Try different email providers in order of preference
    
    // 1. Resend (100 emails/day free)
    if (process.env.RESEND_API_KEY) {
      return await sendViaResend(email, verificationUrl, userName);
    }

    // 2. SendGrid (100 emails/day free)
    if (process.env.SENDGRID_API_KEY) {
      return await sendViaSendGrid(email, verificationUrl, userName);
    }

    // 3. Mailgun (5,000 emails/month free after trial)
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      return await sendViaMailgun(email, verificationUrl, userName);
    }

    // 4. Brevo/Sendinblue (300 emails/day free)
    if (process.env.BREVO_API_KEY) {
      return await sendViaBrevo(email, verificationUrl, userName);
    }

    // No email provider configured - log in development
    if (process.env.NODE_ENV === "development") {
      console.log("\n==============================================");
      console.log("📧 VERIFICATION EMAIL (Development Mode)");
      console.log("==============================================");
      console.log(`To: ${email}`);
      console.log(`Name: ${userName || 'User'}`);
      console.log(`\nVerification Link:\n${verificationUrl}`);
      console.log("\n💡 FREE EMAIL OPTIONS:");
      console.log("   1. Resend: https://resend.com (100 emails/day free)");
      console.log("      - Use onboarding@resend.dev for testing (no domain needed)");
      console.log("      - Or verify your domain for production");
      console.log("   2. Brevo: https://brevo.com (300 emails/day free) - No domain verification needed");
      console.log("   3. SendGrid: https://sendgrid.com (100 emails/day free)");
      console.log("   4. Mailgun: https://mailgun.com (5k/month free)");
      console.log("   5. Supabase SMTP: Configure in Supabase dashboard (if you have SMTP credentials)");
      console.log("\n📝 TIP: For Resend, you can use 'onboarding@resend.dev' without domain verification!");
      console.log("   Just set: EMAIL_FROM='Puhon <onboarding@resend.dev>'");
      console.log("==============================================\n");
      return true;
    }

    console.error("No email provider configured. Set one of: RESEND_API_KEY, SENDGRID_API_KEY, BREVO_API_KEY, or MAILGUN_API_KEY");
    return false;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

/**
 * Send email via Resend (100 emails/day free)
 */
async function sendViaResend(email: string, verificationUrl: string, userName?: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Puhon <onboarding@resend.dev>", // Use your verified domain: "Puhon <noreply@yourdomain.com>"
        to: email,
        subject: "Welcome to Puhon - Verify Your Email",
        html: getVerificationEmailTemplate(verificationUrl, userName),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      console.error("Resend error:", errorData);
      
      // If domain error, provide helpful message
      if (errorData.message?.includes("domain") || errorData.message?.includes("free public domains")) {
        console.error("\n❌ DOMAIN ERROR:");
        console.error("Resend requires a verified domain. Options:");
        console.error("1. Use Resend's test domain: onboarding@resend.dev (default)");
        console.error("2. Verify your own domain in Resend dashboard");
        console.error("3. Set EMAIL_FROM env var to your verified domain");
        console.error("   Example: EMAIL_FROM='Puhon <noreply@yourdomain.com>'");
      }
      
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending via Resend:", error);
    return false;
  }
}

/**
 * Send email via SendGrid (100 emails/day free)
 */
async function sendViaSendGrid(email: string, verificationUrl: string, userName?: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: process.env.EMAIL_FROM || "noreply@puhon.com", name: "Puhon" },
        subject: "Welcome to Puhon - Verify Your Email",
        content: [{
          type: "text/html",
          value: getVerificationEmailTemplate(verificationUrl, userName),
        }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("SendGrid error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending via SendGrid:", error);
    return false;
  }
}

/**
 * Send email via Mailgun (5,000 emails/month free)
 */
async function sendViaMailgun(email: string, verificationUrl: string, userName?: string): Promise<boolean> {
  try {
    const domain = process.env.MAILGUN_DOMAIN!;
    const apiKey = process.env.MAILGUN_API_KEY!;
    const auth = Buffer.from(`api:${apiKey}`).toString('base64');

    const formData = new URLSearchParams();
    formData.append('from', process.env.EMAIL_FROM || `Puhon <noreply@${domain}>`);
    formData.append('to', email);
    formData.append('subject', 'Welcome to Puhon - Verify Your Email');
    formData.append('html', getVerificationEmailTemplate(verificationUrl, userName));

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Mailgun error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending via Mailgun:", error);
    return false;
  }
}

/**
 * Send email via Brevo (300 emails/day free) - NO DOMAIN VERIFICATION NEEDED!
 */
async function sendViaBrevo(email: string, verificationUrl: string, userName?: string): Promise<boolean> {
  try {
    // Brevo allows any email in sender address - no domain verification needed
    const senderEmail = process.env.EMAIL_FROM || "noreply@brevo.com";
    const senderName = "Puhon";
    
    // Extract email from format like "Name <email@domain.com>" or just "email@domain.com"
    const emailMatch = senderEmail.match(/<(.+)>|^(.+)$/);
    const emailAddress = emailMatch ? (emailMatch[1] || emailMatch[2]) : senderEmail;
    
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: {
          email: emailAddress.trim(),
          name: senderName,
        },
        to: [{ email }],
        subject: "Welcome to Puhon - Verify Your Email",
        htmlContent: getVerificationEmailTemplate(verificationUrl, userName),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Brevo error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending via Brevo:", error);
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
        <h1 style="color: #0C3B2E; font-size: 28px; margin: 0; font-weight: 700;">Welcome to Puhon!</h1>
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
          If you didn't create an account with Puhon, you can safely ignore this email.
        </p>
        <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
          This link will expire in 24 hours.
        </p>
      </div>
    </div>
  `;
}
