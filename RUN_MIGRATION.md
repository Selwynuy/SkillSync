# How to Run the Database Migration

## Quick Start (Recommended)

### Option 1: Supabase Dashboard (Easiest)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/audidgordwfztfvaqxrr/sql
   - Or: Your Supabase Dashboard → SQL Editor

2. **Create New Query**
   - Click "New Query"

3. **Copy Migration SQL**
   - Open file: `supabase/migrations/20250103_enhance_user_grades_to_personal_info.sql`
   - Copy all content (Ctrl+A, Ctrl+C)

4. **Paste and Run**
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter

5. **Verify Success**
   - You should see "Success. No rows returned" or similar
   - Check for any error messages

### Option 2: Command Line (If you have psql installed)

```bash
# Navigate to project directory
cd D:\Projects\SkillSync

# Run migration
psql postgresql://postgres:dWvtV8W4CHC1eJ2E@db.audidgordwfztfvaqxrr.supabase.co:5432/postgres -f supabase/migrations/20250103_enhance_user_grades_to_personal_info.sql
```

## Verification

After running the migration, verify it worked:

### Check 1: Verify New Columns Exist

Run this query in Supabase SQL Editor:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_grades'
  AND column_name IN (
    'grade_7_filipino',
    'grade_7_total_average',
    'grade_7_custom_subjects',
    'achievements',
    'hobbies',
    'extracurriculars',
    'skills',
    'languages'
  )
ORDER BY column_name;
```

You should see 8 rows returned.

### Check 2: Verify Indexes

```sql
SELECT indexname
FROM pg_indexes
WHERE tablename = 'user_grades'
  AND indexname LIKE '%achievements%'
     OR indexname LIKE '%hobbies%'
     OR indexname LIKE '%extracurriculars%'
     OR indexname LIKE '%skills%';
```

You should see 4 indexes.

## What This Migration Does

✅ Adds Filipino subject for all grades (7-12)
✅ Adds Total Average field for all grades (7-12)
✅ Adds Custom Subjects (JSONB) for all grades (7-12)
✅ Adds Grade 11 and 12 support (all subjects)
✅ Adds Achievements/Awards (JSONB)
✅ Adds Hobbies/Interests (JSONB)
✅ Adds Extracurricular Activities (JSONB)
✅ Adds Skills (JSONB array)
✅ Adds Languages (JSONB array)
✅ Creates performance indexes

## Troubleshooting

### Error: "column already exists"
**Solution:** The migration has already been run. You're good to go!

### Error: "relation user_grades does not exist"
**Solution:** Run the base migration first:
1. Find `supabase-migration-user-grades.sql`
2. Run that migration first
3. Then run this enhancement migration

### Error: "permission denied"
**Solution:** Make sure you're using the service role key, not the anon key.

### Still having issues?
1. Check that you're connected to the correct Supabase project
2. Verify your credentials in `.env.local`
3. Try refreshing the Supabase dashboard
4. Check the Supabase logs for more details

## Next Steps

After successful migration:

1. **Test the Form**
   - Navigate to: http://localhost:3000/assessments/grades
   - Try adding custom subjects, achievements, hobbies
   - Save and verify data persists

2. **Check Dashboard**
   - Go to: http://localhost:3000/dashboard
   - Verify personal information displays correctly

3. **Test AI Recommendations**
   - Complete an assessment
   - Verify that achievements and hobbies influence recommendations

## Migration is Safe

- ✅ **Non-destructive**: Adds new columns, doesn't delete anything
- ✅ **Backwards compatible**: Existing data works fine
- ✅ **Default values**: New columns have sensible defaults
- ✅ **Can rollback**: If needed, just drop the new columns

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs
3. Verify migration SQL syntax
4. Ensure database connection is working

---

**Ready to migrate?** Just follow Option 1 above - it takes less than 2 minutes! 🚀
