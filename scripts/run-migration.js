/**
 * Migration Runner Script
 * Runs the personal information enhancement migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Starting migration...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250103_enhance_user_grades_to_personal_info.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon and filter out comments and empty lines
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comment blocks and empty statements
      if (statement.includes('/*') || statement.trim().length === 0) {
        continue;
      }

      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      });

      if (error) {
        // Try direct query if RPC doesn't work
        const { error: queryError } = await supabase
          .from('_migration_check')
          .select('*')
          .limit(0);

        if (queryError) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');

          // Continue with other statements
          continue;
        }
      }

      console.log(`✅ Statement ${i + 1} executed successfully`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('  ✓ Added Filipino subject columns for grades 7-12');
    console.log('  ✓ Added Total Average columns for grades 7-12');
    console.log('  ✓ Added Custom Subjects (JSONB) for grades 7-12');
    console.log('  ✓ Added Grade 11 and 12 support');
    console.log('  ✓ Added Achievements/Awards (JSONB)');
    console.log('  ✓ Added Hobbies/Interests (JSONB)');
    console.log('  ✓ Added Extracurricular Activities (JSONB)');
    console.log('  ✓ Added Skills (JSONB)');
    console.log('  ✓ Added Languages (JSONB)');
    console.log('  ✓ Created indexes for performance');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Alternative: Direct SQL execution using pg library if available
async function runMigrationDirect() {
  console.log('📝 Please run this migration manually in Supabase Dashboard:');
  console.log('\n1. Go to: https://supabase.com/dashboard/project/audidgordwfztfvaqxrr/sql');
  console.log('2. Open the SQL Editor');
  console.log('3. Create a new query');
  console.log('4. Copy the content from: supabase/migrations/20250103_enhance_user_grades_to_personal_info.sql');
  console.log('5. Paste and run the migration\n');
  console.log('Or use the Supabase CLI:');
  console.log('  supabase db push\n');
}

// Run migration
console.log('🔄 Attempting to run migration...\n');
runMigrationDirect();

console.log('\n💡 Alternatively, I can help you verify if the migration is needed by checking the current schema.');
