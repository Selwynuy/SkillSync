# Supabase Email Configuration Guide

This guide provides detailed instructions for setting up email functionality in your SkillSync application using Supabase.

## Table of Contents

1. [Overview](#overview)
2. [Email Providers](#email-providers)
3. [Quick Setup (Default Supabase Email)](#quick-setup-default-supabase-email)
4. [Custom SMTP Setup](#custom-smtp-setup)
5. [Email Templates](#email-templates)
6. [Email Verification](#email-verification)
7. [Password Reset](#password-reset)
8. [Magic Links](#magic-links)
9. [Testing Email Delivery](#testing-email-delivery)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Supabase provides two options for sending emails:

1. **Default Supabase Email Service** (Quick Setup)
   - Built-in email service
   - Easy to set up
   - Limited customization
   - Best for development and testing
   - Rate limits apply

2. **Custom SMTP Provider** (Production Recommended)
   - Use your own email service (SendGrid, Mailgun, AWS SES, etc.)
   - Full control over email delivery
   - Better deliverability
   - Custom branding and domains
   - Best for production

---

## Email Providers

### Recommended SMTP Providers

| Provider | Free Tier | Best For | Setup Difficulty |
|----------|-----------|----------|------------------|
| **SendGrid** | 100 emails/day | Production apps | Easy |
| **Mailgun** | 5,000 emails/month | High volume | Easy |
| **AWS SES** | 62,000 emails/month | Cost-effective scaling | Moderate |
| **Postmark** | 100 emails/month | Transactional emails | Easy |
| **Resend** | 3,000 emails/month | Modern API | Easy |

---

## Quick Setup (Default Supabase Email)

This is the fastest way to get started. Supabase will send emails on your behalf.

### Step 1: Access Email Settings

1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your project: **SkillSync** (audidgordwfztfvaqxrr)
3. Navigate to: **Authentication** → **Email Templates**

### Step 2: Enable Email Features

1. Click on **Settings** in the left sidebar
2. Go to **Authentication** section
3. Scroll to **Email Auth**

**Important Settings:**

```
Enable Email Confirmations: ✓ ON (recommended for production)
Enable Email Change Confirmations: ✓ ON
Secure Email Change: ✓ ON
```

### Step 3: Configure Site URL

1. In Authentication Settings, find **Site URL**
2. Set to your application URL:
   - **Development**: `http://localhost:3000`
   - **Production**: `https://yourdomain.com`

3. Add **Redirect URLs** (one per line):
   ```
   http://localhost:3000/**
   https://yourdomain.com/**
   ```

### Step 4: Test the Setup

1. Go to your app: http://localhost:3000/auth/signup
2. Create a new account
3. Check your email inbox for confirmation

**Expected Email:**
- **From**: noreply@mail.app.supabase.io
- **Subject**: "Confirm Your Email"
- **Contains**: Confirmation link

---

## Custom SMTP Setup

For production, use your own SMTP provider for better deliverability and branding.

### Step 1: Choose and Configure Provider

#### Option A: SendGrid (Recommended)

1. **Sign up**: https://sendgrid.com/
2. **Create API Key**:
   - Settings → API Keys → Create API Key
   - Choose "Restricted Access"
   - Enable "Mail Send" permissions
   - Copy the API key (you won't see it again!)

3. **Verify Domain** (Optional but recommended):
   - Settings → Sender Authentication
   - Authenticate Your Domain
   - Follow DNS setup instructions

4. **Get SMTP Credentials**:
   ```
   Host: smtp.sendgrid.net
   Port: 587 (TLS) or 465 (SSL)
   Username: apikey
   Password: YOUR_API_KEY
   ```

#### Option B: Mailgun

1. **Sign up**: https://www.mailgun.com/
2. **Get SMTP Credentials**:
   - Sending → Domain Settings → SMTP Credentials
   ```
   Host: smtp.mailgun.org
   Port: 587
   Username: postmaster@your-domain.mailgun.org
   Password: YOUR_PASSWORD
   ```

#### Option C: AWS SES

1. **Set up AWS SES**: https://aws.amazon.com/ses/
2. **Verify Email or Domain**
3. **Create SMTP Credentials**:
   - SMTP Settings → Create My SMTP Credentials
   ```
   Host: email-smtp.us-east-1.amazonaws.com (region-specific)
   Port: 587
   Username: YOUR_SMTP_USERNAME
   Password: YOUR_SMTP_PASSWORD
   ```

### Step 2: Configure in Supabase

1. **Go to Supabase Dashboard**
2. Navigate to: **Project Settings** → **Auth**
3. Scroll to **SMTP Settings**
4. Toggle **Enable Custom SMTP**

**Fill in the form:**

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: YOUR_API_KEY
Sender Email: noreply@yourdomain.com
Sender Name: SkillSync
Enable TLS: ✓ ON
```

5. Click **Save**

### Step 3: Verify SMTP Connection

1. Send a test email through the Supabase dashboard
2. Check your inbox
3. Verify email arrives from your custom sender address

---

## Email Templates

Customize the emails your users receive.

### Available Templates

Supabase provides templates for:
1. **Confirm Signup** - Email verification after registration
2. **Magic Link** - Passwordless login
3. **Change Email Address** - Confirm new email
4. **Reset Password** - Password recovery

### Accessing Templates

1. **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select a template from the dropdown

### Template Structure

Each template has:
- **Subject Line** - Email subject (can use variables)
- **Message Body** - HTML/Markdown content

### Available Variables

Use these variables in your templates:

```
{{ .SiteURL }}         - Your site URL
{{ .ConfirmationURL }} - Confirmation link
{{ .Token }}           - Authentication token
{{ .TokenHash }}       - Hashed token
{{ .RedirectTo }}      - Redirect URL after confirmation
```

### Example: Custom Signup Confirmation

**Subject:**
```
Welcome to SkillSync - Verify Your Email
```

**Body:**
```html
<h2>Welcome to SkillSync!</h2>

<p>Thanks for signing up. Click the button below to verify your email address and get started with your career assessment.</p>

<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
  Verify Email Address
</a>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<hr>

<p style="color: #6b7280; font-size: 14px;">
  If you didn't create an account with SkillSync, you can safely ignore this email.
</p>

<p style="color: #6b7280; font-size: 14px;">
  Questions? Contact us at support@yourdomain.com
</p>
```

### Example: Custom Password Reset

**Subject:**
```
Reset Your SkillSync Password
```

**Body:**
```html
<h2>Password Reset Request</h2>

<p>We received a request to reset your password for your SkillSync account.</p>

<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
  Reset Password
</a>

<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>

<p style="color: #6b7280;">This link will expire in 1 hour.</p>

<hr>

<p style="color: #6b7280; font-size: 14px;">
  If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
</p>
```

### Styling Tips

1. **Use inline styles** - Email clients strip `<style>` tags
2. **Keep it simple** - Complex layouts may break
3. **Test across clients** - Gmail, Outlook, Apple Mail
4. **Mobile responsive** - Use max-width and percentage widths
5. **Include plain text fallback** - For text-only clients

---

## Email Verification

Require users to verify their email before accessing the app.

### Step 1: Enable Email Confirmation

1. **Supabase Dashboard** → **Authentication** → **Settings**
2. Find **Email Confirmations**
3. Toggle **Enable email confirmations**: **ON**

### Step 2: Update Your Code

When email confirmation is enabled, new users need to verify their email before they can sign in.

**Current behavior** (in `app/auth/signup/page.tsx`):
```typescript
// User can sign in immediately after signup
const result = await signIn("credentials", {
  email,
  password,
  redirect: false,
})
```

**Recommended behavior with email verification**:

Update `app/auth/signup/page.tsx`:

```typescript
async function onSubmit(e: React.FormEvent) {
  e.preventDefault()

  // ... validation code ...

  setIsLoading(true)

  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error(data.error || "Sign up failed")
      return
    }

    // If email verification is enabled
    toast.success("Account created! Please check your email to verify your account.")

    // Redirect to sign in with a message
    router.push("/auth/signin?message=verify-email")

  } catch (error) {
    toast.error("An error occurred. Please try again.")
  } finally {
    setIsLoading(false)
  }
}
```

Update `app/auth/signin/page.tsx` to show verification message:

```typescript
function SignInForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

  useEffect(() => {
    if (message === "verify-email") {
      toast.info("Please verify your email address before signing in. Check your inbox!")
    }
  }, [message])

  // ... rest of component
}
```

### Step 3: Handle Email Confirmation

Create a callback route to handle email confirmations.

**Create**: `app/auth/confirm/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const next = searchParams.get("next") || "/dashboard"

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (!error) {
      // Email verified successfully
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Error occurred, redirect to error page
  return NextResponse.redirect(new URL("/auth/signin?error=verification-failed", request.url))
}
```

### Step 4: Update Supabase Redirect URL

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/confirm
   https://yourdomain.com/auth/confirm
   ```

---

## Password Reset

Implement password reset functionality.

### Step 1: Create Password Reset Request Page

**Create**: `app/auth/reset/page.tsx`

```typescript
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Mail } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset/confirm`,
      })

      if (error) {
        toast.error(error.message)
      } else {
        setSubmitted(true)
        toast.success("Password reset email sent! Check your inbox.")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/auth/signin" className="w-full">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            <Link href="/auth/signin" className="w-full">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
```

### Step 2: Create Password Reset Confirmation Page

**Create**: `app/auth/reset/confirm/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Lock } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function ResetPasswordConfirmPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Password updated successfully!")
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
```

### Step 3: Add Reset Link to Sign In Page

Update `app/auth/signin/page.tsx` to add back the "Forgot password?" link:

```typescript
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Label htmlFor="password">Password</Label>
    <Link
      href="/auth/reset"
      className="text-sm text-muted-foreground hover:text-primary"
    >
      Forgot password?
    </Link>
  </div>
  <div className="relative">
    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input
      id="password"
      type="password"
      placeholder="••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="pl-10"
      required
      disabled={isLoading}
    />
  </div>
</div>
```

---

## Magic Links

Enable passwordless authentication with magic links.

### How It Works

1. User enters their email address
2. Receives an email with a unique login link
3. Clicks the link and is automatically signed in
4. No password required

### Step 1: Create Magic Link Page

You already have this! `app/auth/magic/page.tsx` is referenced in your sign in page.

**Create**: `app/auth/magic/page.tsx`

```typescript
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Mail, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function MagicLinkPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (error) {
        toast.error(error.message)
      } else {
        setSubmitted(true)
        toast.success("Magic link sent! Check your email.")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex justify-center">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent a magic link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click the link in the email to sign in instantly. The link will expire in 1 hour.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSubmitted(false)}
            >
              Send Another Link
            </Button>
            <Link href="/auth/signin" className="w-full">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex justify-center">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Sign in with Magic Link</CardTitle>
          <CardDescription>
            No password needed. We'll email you a secure link.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Magic Link"}
            </Button>
            <Link href="/auth/signin" className="w-full">
              <Button variant="ghost" className="w-full">
                Sign in with Password
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
```

### Step 2: Customize Magic Link Email Template

1. **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select **Magic Link** from dropdown
3. Customize the template:

**Subject:**
```
Your SkillSync Magic Link
```

**Body:**
```html
<h2>Sign in to SkillSync</h2>

<p>Click the button below to sign in to your account. No password needed!</p>

<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
  Sign In to SkillSync
</a>

<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>

<p style="color: #6b7280;">This link will expire in 1 hour.</p>

<hr>

<p style="color: #6b7280; font-size: 14px;">
  If you didn't request this link, you can safely ignore this email.
</p>
```

---

## Testing Email Delivery

### Local Testing

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Sign Up**
   - Go to http://localhost:3000/auth/signup
   - Create an account with a real email you have access to
   - Check your inbox

3. **Test Magic Link**
   - Go to http://localhost:3000/auth/magic
   - Enter your email
   - Check your inbox

4. **Test Password Reset**
   - Go to http://localhost:3000/auth/reset
   - Enter your email
   - Check your inbox

### What to Check

- Email arrives within 1-2 minutes
- Links are not broken
- Redirects work correctly
- Styling looks good
- Mobile responsive
- Works in spam folder (if SMTP configured)

### Common Issues

**Email not arriving:**
- Check spam folder
- Verify SMTP credentials
- Check Supabase logs: Dashboard → Logs
- Verify email address is correct

**Link broken:**
- Check Site URL in Supabase settings
- Verify redirect URLs are correct
- Check for trailing slashes

**Email in spam:**
- Set up SPF, DKIM, DMARC records (custom SMTP only)
- Use verified domain
- Avoid spam trigger words

---

## Troubleshooting

### Issue: Emails Not Sending

**Check Supabase Logs:**
1. Supabase Dashboard → Logs
2. Filter by "Auth" or "Email"
3. Look for error messages

**Common Causes:**
- SMTP credentials incorrect
- Port blocked by firewall
- Rate limit exceeded
- Domain not verified

**Solution:**
- Double-check SMTP settings
- Try different port (587 vs 465)
- Upgrade plan or wait for rate limit reset
- Complete domain verification

### Issue: Emails Going to Spam

**Causes:**
- Using default Supabase email
- Domain not verified
- No SPF/DKIM records

**Solution:**
1. Set up custom SMTP
2. Verify your domain
3. Add SPF record to DNS:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.sendgrid.net ~all
   ```
4. Add DKIM record (provided by your email provider)

### Issue: Confirmation Link Not Working

**Check:**
- Site URL matches your app URL
- Redirect URLs include the confirmation path
- Token hasn't expired (1 hour default)

**Solution:**
1. Update Site URL in Supabase
2. Add all possible redirect URLs
3. Implement proper error handling

### Issue: Rate Limit Exceeded

**Default Limits:**
- Supabase email: ~60 emails/hour
- Custom SMTP: Depends on provider

**Solution:**
- Use custom SMTP provider
- Upgrade Supabase plan
- Implement email queuing for bulk sends

---

## Next Steps

### Production Checklist

Before deploying to production:

- [ ] Set up custom SMTP provider
- [ ] Verify your domain
- [ ] Configure SPF, DKIM, DMARC records
- [ ] Customize all email templates
- [ ] Enable email verification
- [ ] Test all email flows
- [ ] Set up monitoring for email delivery
- [ ] Update Site URL to production domain
- [ ] Add production redirect URLs
- [ ] Test from multiple email clients
- [ ] Check mobile email rendering

### Additional Features

Consider adding:

1. **Email Preferences**
   - Let users opt in/out of marketing emails
   - Manage notification preferences

2. **Email Notifications**
   - New assessment completed
   - Milestone achieved
   - Weekly progress reports

3. **Transactional Emails**
   - Account settings changed
   - Password changed
   - New device login alert

---

## Resources

### Official Documentation

- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Email Templates**: https://supabase.com/docs/guides/auth/auth-email-templates
- **SMTP Setup**: https://supabase.com/docs/guides/auth/auth-smtp

### SMTP Provider Docs

- **SendGrid**: https://docs.sendgrid.com/
- **Mailgun**: https://documentation.mailgun.com/
- **AWS SES**: https://docs.aws.amazon.com/ses/
- **Postmark**: https://postmarkapp.com/developer
- **Resend**: https://resend.com/docs

### Testing Tools

- **Mail Tester**: https://www.mail-tester.com/ (Check spam score)
- **MX Toolbox**: https://mxtoolbox.com/ (DNS verification)
- **Litmus**: https://www.litmus.com/ (Email preview across clients)

---

## Summary

You now have comprehensive instructions for:

1. Setting up email with default Supabase service
2. Configuring custom SMTP providers
3. Customizing email templates
4. Implementing email verification
5. Adding password reset functionality
6. Enabling magic link authentication
7. Testing and troubleshooting

**For immediate development:**
- Use default Supabase email service
- Test with your own email address
- Customize templates as needed

**For production:**
- Set up SendGrid or another SMTP provider
- Verify your domain
- Enable email verification
- Test thoroughly before launch

**Questions?**
- Check Supabase documentation
- Review SMTP provider docs
- Test in development first
- Monitor Supabase logs for errors
