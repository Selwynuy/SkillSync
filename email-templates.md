# Supabase Email Templates for SkillSync

Complete message body templates for all email types. Copy these into your Supabase dashboard: **Authentication** → **Email Templates**

---

## 1. Confirm Sign Up

**Subject:**
```
Welcome to SkillSync - Verify Your Email
```

**Message Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0C3B2E; font-size: 28px; margin: 0; font-weight: 700;">Welcome to SkillSync!</h1>
  </div>

  <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Thanks for signing up! We're excited to help you discover your perfect career path.
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Please verify your email address to complete your account setup and start your personalized career assessment.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background-color: #6D9773; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Verify Email Address
      </a>
    </div>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #6D9773; font-size: 12px; word-break: break-all; margin: 0;">
      {{ .ConfirmationURL }}
    </p>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
      If you didn't create an account with SkillSync, you can safely ignore this email.
    </p>
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
      Questions? Contact us at support@skillsync.com
    </p>
  </div>
</div>
```

---

## 2. Invite User

**Subject:**
```
You've been invited to SkillSync
```

**Message Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0C3B2E; font-size: 28px; margin: 0; font-weight: 700;">You're Invited!</h1>
  </div>

  <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      You've been invited to join SkillSync, the platform that helps you discover your perfect career path through personalized assessments and recommendations.
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Click the button below to accept your invitation and create your account.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background-color: #6D9773; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Accept Invitation
      </a>
    </div>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #6D9773; font-size: 12px; word-break: break-all; margin: 0;">
      {{ .ConfirmationURL }}
    </p>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
      This invitation will expire in 24 hours.
    </p>
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
      Questions? Contact us at support@skillsync.com
    </p>
  </div>
</div>
```

---

## 3. Magic Link

**Subject:**
```
Your SkillSync Sign-In Link
```

**Message Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0C3B2E; font-size: 28px; margin: 0; font-weight: 700;">Sign In to SkillSync</h1>
  </div>

  <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Click the button below to sign in to your SkillSync account. No password needed!
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      This secure link will automatically sign you in to your account.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background-color: #FFBA00; color: #0C3B2E; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Sign In to SkillSync
      </a>
    </div>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #6D9773; font-size: 12px; word-break: break-all; margin: 0;">
      {{ .ConfirmationURL }}
    </p>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
      This link will expire in 1 hour.
    </p>
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
      If you didn't request this link, you can safely ignore this email.
    </p>
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
      Questions? Contact us at support@skillsync.com
    </p>
  </div>
</div>
```

---

## 4. Change Email Address

**Subject:**
```
Confirm Your New Email Address
```

**Message Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0C3B2E; font-size: 28px; margin: 0; font-weight: 700;">Confirm Email Change</h1>
  </div>

  <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      We received a request to change your SkillSync account email address to <strong>{{ .Email }}</strong>.
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Click the button below to confirm this email change. If you didn't request this change, please ignore this email.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background-color: #6D9773; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Confirm Email Change
      </a>
    </div>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #6D9773; font-size: 12px; word-break: break-all; margin: 0;">
      {{ .ConfirmationURL }}
    </p>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
      <strong>Security Note:</strong> If you didn't request this email change, please contact us immediately at support@skillsync.com.
    </p>
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
      This confirmation link will expire in 1 hour.
    </p>
  </div>
</div>
```

---

## 5. Reset Password

**Subject:**
```
Reset Your SkillSync Password
```

**Message Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0C3B2E; font-size: 28px; margin: 0; font-weight: 700;">Password Reset Request</h1>
  </div>

  <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      We received a request to reset your password for your SkillSync account.
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Click the button below to create a new password. If you didn't request this, you can safely ignore this email.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background-color: #BB8A52; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Reset Password
      </a>
    </div>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #6D9773; font-size: 12px; word-break: break-all; margin: 0;">
      {{ .ConfirmationURL }}
    </p>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
      <strong>This link will expire in 1 hour.</strong>
    </p>
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
      If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
    </p>
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
      Questions? Contact us at support@skillsync.com
    </p>
  </div>
</div>
```

---

## 6. Reauthentication

**Subject:**
```
Verify Your Identity - SkillSync
```

**Message Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0C3B2E; font-size: 28px; margin: 0; font-weight: 700;">Verify Your Identity</h1>
  </div>

  <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      For security purposes, we need to verify your identity before you can complete this action.
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Click the button below to verify your identity and continue.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background-color: #6D9773; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Verify Identity
      </a>
    </div>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #6D9773; font-size: 12px; word-break: break-all; margin: 0;">
      {{ .ConfirmationURL }}
    </p>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
      <strong>Security Note:</strong> This verification link will expire in 15 minutes.
    </p>
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
      If you didn't initiate this action, please contact us immediately at support@skillsync.com.
    </p>
    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
      Questions? Contact us at support@skillsync.com
    </p>
  </div>
</div>
```

---

## How to Use These Templates

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Navigate to**: Authentication → Email Templates
3. **Select each template type** from the dropdown
4. **Copy the Subject** line into the Subject field
5. **Copy the Message Body** HTML into the Message Body field
6. **Click Save** for each template

## Template Variables Reference

These variables are automatically replaced by Supabase:

- `{{ .ConfirmationURL }}` - The confirmation/action link
- `{{ .Token }}` - The authentication token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address
- `{{ .Data }}` - Additional data (if provided)
- `{{ .RedirectTo }}` - Redirect URL after confirmation

## Color Palette Used

- **Primary Green**: `#6D9773` (buttons, links)
- **Dark Teal**: `#0C3B2E` (headings, text)
- **Warm Brown**: `#BB8A52` (reset password button)
- **Bright Yellow**: `#FFBA00` (magic link button)

## Notes

- All templates use inline styles for maximum email client compatibility
- Templates are responsive and mobile-friendly
- Links expire after the specified time periods
- Security messaging included where appropriate
- Support contact information included in all templates

