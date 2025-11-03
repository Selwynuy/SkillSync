# Testing Email Signup

## Quick Test Guide

### 1. Check Environment Variables

Make sure you have these set in `.env.local`:

```bash
# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL (for verification links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Email provider (choose one)
# Option A: Resend (100/day free) - Use onboarding@resend.dev for testing
RESEND_API_KEY=re_your_api_key
# EMAIL_FROM="SkillSync <onboarding@resend.dev>"  # Optional, defaults to onboarding@resend.dev

# Option B: Brevo (300/day free) - No domain verification needed!
BREVO_API_KEY=your_brevo_api_key
# EMAIL_FROM="SkillSync <any-email@gmail.com>"  # Can use any email!

# Option C: SendGrid (100/day free)
SENDGRID_API_KEY=your_sendgrid_api_key

# Option D: Mailgun (5k/month free)
MAILGUN_API_KEY=your_mailgun_key
MAILGUN_DOMAIN=your_domain.com
```

### 2. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 3. Test Signup Flow

1. **Open your browser** and go to `http://localhost:3000/auth/signup`

2. **Fill in the signup form**:
   - Name: Test User
   - Email: Use a real email you can access (or a test email)
   - Password: At least 6 characters
   - Confirm Password: Same password

3. **Click "Sign Up"**

4. **Check the terminal/console** for:
   - Any error messages
   - If no email provider is configured, you'll see the verification link printed to console

### 4. What to Check

#### ✅ If Email Provider is Configured:
- Check your email inbox (and spam folder)
- You should receive a verification email
- Click the verification link
- You'll be redirected to sign in page with success message

#### ✅ If No Email Provider (Development Mode):
- Check your **terminal/console** - the verification link will be printed
- Copy the verification link
- Paste it in your browser
- You should be redirected to sign in with success message

### 5. Verify in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. You should see the new user listed
4. Check that `Email Confirmed` is `false` initially
5. After clicking verification link, it should become `true`

### 6. Test Sign In

1. After verification, go to `/auth/signin`
2. Enter the email and password you used
3. You should be able to sign in successfully

## Troubleshooting

### "Failed to create account"
- Check Supabase credentials are correct
- Check server logs for specific error
- Verify database tables exist (users table)

### "User already exists"
- Try a different email
- Or check Supabase Auth dashboard to see if user exists

### No email received
- Check spam/junk folder
- Check terminal for verification link (if no email provider)
- Verify email provider API key is correct
- Check email provider dashboard for sending limits

### Verification link doesn't work
- Make sure `NEXT_PUBLIC_APP_URL` is set correctly
- Check token hasn't expired (24 hours)
- Check server logs for errors

## Quick Email Provider Setup

### Brevo (Recommended - Easiest)
1. Sign up at https://brevo.com (free)
2. Go to Settings → SMTP & API → API Keys
3. Create an API key
4. Add to `.env.local`: `BREVO_API_KEY=your_key`
5. Done! No domain verification needed.

### Resend (If you have a domain)
1. Sign up at https://resend.com (free)
2. Get API key from dashboard
3. For testing: Use `onboarding@resend.dev` (no setup needed)
4. For production: Verify your domain
5. Add to `.env.local`: `RESEND_API_KEY=your_key`


