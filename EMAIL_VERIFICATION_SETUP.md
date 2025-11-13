# Email Verification Setup Guide

## Problem

You're experiencing two issues:
1. **Database Error**: Missing `verification_token` columns in the `users` table
2. **No Emails Sent**: Email provider not configured

## Solution

### Step 1: Run the Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add verification token columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMPTZ;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token
ON public.users(verification_token)
WHERE verification_token IS NOT NULL;

-- Add comments
COMMENT ON COLUMN public.users.verification_token IS 'Token used for email verification';
COMMENT ON COLUMN public.users.verification_token_expires IS 'Expiration timestamp for verification token';
```

**Or** copy the migration file content from:
`supabase/migrations/20250102_add_verification_token_columns.sql`

### Step 2: Configure Email Provider

You need to set up ONE of these free email providers:

#### Option 1: Resend (Recommended - Easiest)
✅ **100 emails/day free**
✅ **No domain verification needed for testing**

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add to your `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=Puhon <onboarding@resend.dev>  # Use this for testing!
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For production**: Verify your own domain in Resend dashboard, then change `EMAIL_FROM` to:
```bash
EMAIL_FROM=Puhon <noreply@yourdomain.com>
```

#### Option 2: Brevo (Sendinblue)
✅ **300 emails/day free**
✅ **No domain verification needed**

1. Sign up at [brevo.com](https://brevo.com)
2. Get your API key from Settings > SMTP & API
3. Add to your `.env.local`:

```bash
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxx
EMAIL_FROM=noreply@brevo.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Option 3: SendGrid
✅ **100 emails/day free**
⚠️ **Requires sender verification**

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify a sender email address
3. Get your API key
4. Add to your `.env.local`:

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=your-verified-email@domain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Option 4: Mailgun
✅ **5,000 emails/month free**
⚠️ **Requires domain verification**

1. Sign up at [mailgun.com](https://mailgun.com)
2. Add and verify a domain
3. Get your API key
4. Add to your `.env.local`:

```bash
MAILGUN_API_KEY=xxxxxxxxxxxxx
MAILGUN_DOMAIN=yourdomain.com
EMAIL_FROM=Puhon <noreply@yourdomain.com>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Test the Setup

1. **Restart your development server** after adding environment variables:
   ```bash
   npm run dev
   ```

2. **Try signing up again** with a test email

3. **Check for success**:
   - No database errors about `verification_token`
   - Email sent successfully
   - Check your inbox (and spam folder!)

### Development Mode (No Email Provider)

If you don't configure an email provider, the system will still work in development mode and will log the verification link to the console:

```
==============================================
📧 VERIFICATION EMAIL (Development Mode)
==============================================
To: user@example.com
Name: John Doe

Verification Link:
http://localhost:3000/api/auth/verify-email?token=abc123...

💡 FREE EMAIL OPTIONS: ...
==============================================
```

You can click that link to verify the email manually during development.

## Email Template

The verification email includes:
- Branded Puhon welcome message
- Clear "Verify Email Address" button
- Backup verification link (if button doesn't work)
- 24-hour expiration notice
- Professional design

## Troubleshooting

### Database Error Still Happening?
- Make sure you ran the SQL migration in Supabase
- Refresh your Supabase schema cache
- Check the `users` table has the new columns

### Emails Not Arriving?
1. **Check spam folder** - First-time emails often go to spam
2. **Verify API key is correct** - Check for typos
3. **Check the server logs** - Look for email provider errors
4. **Test with a different email** - Some providers block certain domains
5. **For Resend**: Make sure you're using `onboarding@resend.dev` for testing

### Gmail Specific Issues?
- Gmail may mark first-time emails as spam
- Check your Promotions or Spam folders
- For production, use a verified domain to improve deliverability

## Production Checklist

Before deploying to production:

- [ ] Database migration applied in production Supabase
- [ ] Email provider API key added to production environment variables
- [ ] `NEXT_PUBLIC_APP_URL` set to your production URL (e.g., `https://puhon.com`)
- [ ] For Resend/Mailgun/SendGrid: Verify your domain
- [ ] Update `EMAIL_FROM` to use your verified domain
- [ ] Test signup flow in production
- [ ] Check email deliverability (test with multiple email providers)

## Need Help?

- Check server logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure database migration was successful
- Test with different email addresses
