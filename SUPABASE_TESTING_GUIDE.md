# Supabase Integration Testing Guide

This guide will help you verify that the Supabase integration is working correctly.

## Prerequisites

Before testing, ensure:
- ✅ Your `.env.local` file has all Supabase credentials filled in
- ✅ You ran the SQL schema in Supabase Dashboard
- ✅ You can see the 6 tables in Supabase Table Editor

## Step 1: Start the Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

**Expected Result**: Application loads without errors in the console.

---

## Step 2: Test User Registration

1. **Navigate to Sign Up**
   - Click "Sign Up" in the navigation
   - Or go to: http://localhost:3000/auth/signup

2. **Create a Test Account**
   - Email: `test@skillsync.com`
   - Password: `TestPassword123!`
   - Name: `Test User`
   - Click "Sign Up"

**Expected Result**:
- ✅ No errors in browser console
- ✅ Redirected to dashboard or assessments page
- ✅ You are logged in

3. **Verify in Supabase**
   - Open Supabase Dashboard > Table Editor
   - Click on `users` table
   - You should see your new user with hashed password

---

## Step 3: Test Sign In

1. **Sign Out** (if logged in)
   - Click "Sign Out" in navigation

2. **Sign In Again**
   - Go to http://localhost:3000/auth/signin
   - Email: `test@skillsync.com`
   - Password: `TestPassword123!`
   - Click "Sign In"

**Expected Result**:
- ✅ Successfully logged in
- ✅ Redirected to dashboard

---

## Step 4: Test Assessment Flow

1. **Start an Assessment**
   - Click "Take Assessment" or go to http://localhost:3000/assessments
   - Click "Start Assessment"

2. **Answer Some Questions**
   - Answer at least 3-5 questions
   - Click "Next" between questions

3. **Verify Auto-Save**
   - Open Supabase Dashboard > Table Editor
   - Click on `assessment_progress` table
   - You should see a row with your user_id and responses

4. **Close Browser Tab** (to test auto-save)
   - Close the assessment tab
   - Reopen http://localhost:3000/assessments
   - Click the in-progress assessment

**Expected Result**:
- ✅ Your progress is restored
- ✅ You're on the same question where you left off

5. **Complete the Assessment**
   - Answer all remaining questions
   - Click "Complete Assessment" on the last question

6. **Verify in Database**
   - Supabase Dashboard > `assessment_attempts` table
   - You should see a completed attempt with trait_vector and trait_summary
   - Check `assessment_responses` table - all your answers are saved
   - Check `assessment_progress` table - the in-progress record is deleted

**Expected Result**:
- ✅ Redirected to recommendations page
- ✅ See personalized career recommendations

---

## Step 5: Test Saved Job Paths

1. **Save a Career Path**
   - On the recommendations page, click the bookmark icon on any career
   - The icon should fill in (become solid)

2. **Verify in Database**
   - Supabase Dashboard > `saved_job_paths` table
   - You should see a row with your user_id and the job_path_id

3. **View Saved Paths**
   - Go to http://localhost:3000/dashboard
   - Scroll to "Saved Job Paths" section
   - Your saved career should appear

4. **Remove a Saved Path**
   - Hover over a saved career card
   - Click the trash icon
   - Confirm removal

**Expected Result**:
- ✅ Career is removed from the list
- ✅ Toast notification appears
- ✅ Database record is deleted

---

## Step 6: Test Milestones

1. **Navigate to Dashboard**
   - Go to http://localhost:3000/dashboard
   - Scroll to "Milestones" section

2. **Select a Career Path**
   - Choose a saved career from the dropdown

3. **Add Milestones**
   - Type a milestone: "Complete online course"
   - Press Enter
   - Add 2-3 more milestones

4. **Click Save**
   - Click "Save Milestones" button

5. **Verify in Database**
   - Supabase Dashboard > `user_milestones` table
   - You should see a row with your milestones as a JSON array

6. **Toggle Completion**
   - Check off a milestone
   - Click "Save Milestones"
   - Refresh the page

**Expected Result**:
- ✅ Milestones persist across page refreshes
- ✅ Completed milestones show completion date
- ✅ Progress bar updates correctly

---

## Step 7: Test Data Export

1. **Navigate to Settings**
   - Go to http://localhost:3000/settings

2. **Export Your Data**
   - Click "Export Data" button
   - A JSON file downloads

3. **Open the Downloaded File**
   - Open the JSON file in a text editor
   - Verify it contains:
     - Your user profile
     - Assessment attempts
     - Saved job paths
     - Milestones

**Expected Result**:
- ✅ File downloads successfully
- ✅ Contains all your data in readable JSON format

---

## Step 8: Test Account Deletion

**⚠️ WARNING**: This will permanently delete all data!

1. **Create a Throwaway Account** (don't use your main test account)
   - Sign out
   - Create a new account: `delete-test@skillsync.com`

2. **Add Some Data**
   - Complete an assessment
   - Save a career path

3. **Delete the Account**
   - Go to Settings
   - Scroll to "Delete Account"
   - Type "DELETE" in the input
   - Click "Delete Account"
   - Confirm in the browser alert

4. **Verify Deletion**
   - Supabase Dashboard > `users` table
   - The user should be gone
   - Check other tables - all related data should be deleted (CASCADE)

**Expected Result**:
- ✅ Account deleted successfully
- ✅ Signed out and redirected to home page
- ✅ All user data removed from database

---

## Step 9: Test Row Level Security (RLS)

This test ensures users can't access other users' data.

1. **Create Two Accounts**
   - Account A: `alice@skillsync.com`
   - Account B: `bob@skillsync.com`

2. **As Alice**
   - Complete an assessment
   - Save a career path
   - Note the IDs from the database

3. **As Bob**
   - Open browser console (F12)
   - Try to access Alice's data directly:
   ```javascript
   // This should fail due to RLS
   await fetch('/api/dashboard/attempts')
   ```

4. **Check Database Directly**
   - Supabase Dashboard > SQL Editor
   - Run this query (replace with Alice's ID):
   ```sql
   SELECT * FROM assessment_attempts WHERE user_id = 'alice-user-id';
   ```

**Expected Result**:
- ✅ Bob cannot see Alice's data through the API
- ✅ Only admin queries in Supabase Dashboard can see all data
- ✅ Each user only sees their own data

---

## Common Issues & Solutions

### Issue: "Missing environment variables" error

**Solution**:
- Check `.env.local` file exists in project root
- Verify all Supabase variables are filled in
- Restart the dev server: `npm run dev`

### Issue: "Failed to fetch" or network errors

**Solution**:
- Verify Supabase project is active (not paused)
- Check Supabase API URL is correct
- Verify your internet connection

### Issue: "Row Level Security policy violation"

**Solution**:
- Make sure you ran the entire SQL schema
- Check that RLS policies were created
- Verify user is authenticated

### Issue: Data not appearing in tables

**Solution**:
- Check browser console for errors
- Verify API route is being called
- Check Supabase logs in Dashboard > Logs

### Issue: Build fails with TypeScript errors

**Solution**:
- Run: `npm run build`
- Read the error message carefully
- Verify all imports are correct

---

## Next Steps After Testing

Once all tests pass:

1. **Push to Git**
   ```bash
   git push origin main
   ```

2. **Deploy to Vercel** (optional)
   - Connect your GitHub repo to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Enable Email Verification** (production)
   - Supabase Dashboard > Authentication > Email Templates
   - Customize email templates
   - Enable "Confirm email" toggle

4. **Set Up Row Level Security Monitoring**
   - Supabase Dashboard > Logs
   - Monitor for any RLS violations

5. **Configure Backup Policy**
   - Supabase Pro plan includes automatic backups
   - Free tier: manually export data periodically

---

## Performance Tips

1. **Database Indexes**
   - Already created in schema for common queries
   - Monitor slow queries in Supabase Dashboard

2. **Connection Pooling**
   - Already configured in Supabase client

3. **Caching**
   - Consider adding React Query or SWR for client-side caching
   - Use Supabase's built-in caching features

---

## Monitoring & Maintenance

### Daily Checks
- ✅ Application loads without errors
- ✅ Users can sign up and sign in

### Weekly Checks
- ✅ Check Supabase Dashboard > Logs for errors
- ✅ Verify database size is within limits
- ✅ Review user growth metrics

### Monthly Checks
- ✅ Update Supabase client library: `npm update @supabase/supabase-js`
- ✅ Review and optimize slow queries
- ✅ Check for security updates

---

## Troubleshooting Commands

```bash
# Restart dev server
npm run dev

# Check for TypeScript errors
npm run build

# View Supabase connection
# In browser console on any page:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## Support Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Next.js Documentation**: https://nextjs.org/docs
- **Project Repository**: Your GitHub repo

---

## Success Criteria

You've successfully integrated Supabase when:
- ✅ All 9 test steps above pass
- ✅ Build completes without errors
- ✅ Data persists across browser refreshes
- ✅ Multiple users can use the app simultaneously
- ✅ RLS prevents data leakage between users

**Congratulations! Your SkillSync application is now production-ready!** 🎉
