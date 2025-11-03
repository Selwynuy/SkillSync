# Manual Testing Steps for Email Signup

## Step-by-Step Manual Test

### Step 1: Start the Development Server

Open your terminal and run:
```bash
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

### Step 2: Open Signup Page

1. Open your browser
2. Go to: **http://localhost:3000/auth/signup**
3. You should see the signup form

### Step 3: Fill Out the Form

Fill in these fields:
- **Name**: `Test User` (or any name)
- **Email**: Use your real email (or a test email you can access)
- **Password**: `test123` (at least 6 characters)
- **Confirm Password**: `test123`

### Step 4: Submit the Form

1. Click the **"Sign Up"** button
2. You should see a loading state
3. Watch for:
   - ✅ Success toast: "Account created successfully! Please check your email..."
   - ❌ Error toast: Check the message

### Step 5: Check for Verification Link

#### Option A: If Email Provider is Configured
1. **Check your email inbox** (and spam folder)
2. You should receive an email from SkillSync
3. The email contains a verification link
4. **Click the verification link**

#### Option B: If No Email Provider (Development Mode)
1. **Look at your terminal/console** where `npm run dev` is running
2. You should see output like:
   ```
   ==============================================
   📧 VERIFICATION EMAIL (Development Mode)
   ==============================================
   To: your-email@example.com
   Name: Test User
   
   Verification Link:
   http://localhost:3000/api/auth/verify-email?token=...
   ```
3. **Copy the verification link** from the terminal
4. **Paste it in your browser** and press Enter

### Step 6: Verify Email Confirmation

After clicking the verification link:

1. You should be **redirected** to: `http://localhost:3000/auth/signin?verified=true`
2. You should see a success message
3. The page should show the sign-in form

### Step 7: Verify in Supabase Dashboard

1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **Users**
4. Find the user you just created
5. Check:
   - ✅ User exists in the list
   - ✅ Email is correct
   - ✅ `Email Confirmed` status (should be `true` after verification)

### Step 8: Test Sign In

1. On the sign-in page (`/auth/signin`)
2. Enter:
   - **Email**: The email you used to sign up
   - **Password**: The password you used
3. Click **"Sign In"**
4. You should successfully sign in!

## What to Check in Terminal

While testing, watch your terminal for:

✅ **Success messages:**
- `Account created successfully`
- `Verification email sent` (if email provider configured)
- `User created in Supabase Auth`

❌ **Error messages:**
- `Error creating user in Supabase Auth: ...`
- `Failed to send verification email`
- `User already exists`
- Any red error logs

## Common Issues & Solutions

### Issue: "User already exists"
**Solution:**
- Use a different email address
- Or delete the user from Supabase Auth dashboard first

### Issue: No verification email received
**Solution:**
- Check spam/junk folder
- Check terminal - link is printed there in dev mode
- Verify email provider API key is correct

### Issue: Verification link doesn't work
**Solution:**
- Make sure `NEXT_PUBLIC_APP_URL=http://localhost:3000` is in `.env.local`
- Check that server is still running
- Token expires after 24 hours - try signing up again

### Issue: Can't sign in after verification
**Solution:**
- Make sure email is verified (check Supabase dashboard)
- Check that password is correct
- Check server logs for authentication errors

## Quick Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Can access signup page
- [ ] Can submit form without errors
- [ ] See success message after signup
- [ ] Receive verification link (email or terminal)
- [ ] Verification link works and redirects
- [ ] User appears in Supabase Auth dashboard
- [ ] Email is marked as confirmed after verification
- [ ] Can sign in with verified account

## Testing Different Scenarios

### Test 1: Valid Signup
- Use a new email address
- Fill all fields correctly
- Should succeed

### Test 2: Duplicate Email
- Try to sign up with same email twice
- Should show "User already exists" error

### Test 3: Invalid Password
- Password less than 6 characters
- Should show validation error

### Test 4: Password Mismatch
- Password and confirm password don't match
- Should show "Passwords do not match" error


