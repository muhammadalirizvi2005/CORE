import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://msfwykwgukbazmhsmjso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZnd5a3dndWtiYXptaHNtanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3NTk0NjcsImV4cCI6MjA0MzMzNTQ2N30.jDmLCmVDTVzr46pCJ8LDO1vb2nR7Qm_jhyoXlkVwFfI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testWellnessEntry() {
  console.log('🔍 Testing wellness entry creation...\n');
  
  // Check if there's an active session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.log('❌ Error getting session:', sessionError.message);
    return;
  }
  
  if (!session) {
    console.log('❌ NOT LOGGED IN');
    console.log('   → Please login at http://localhost:5173');
    console.log('   → Then run this test again\n');
    return;
  }
  
  console.log('✅ Session found!');
  console.log('   User ID:', session.user.id);
  console.log('   Email:', session.user.email, '\n');
  
  // Try to create a test wellness entry
  console.log('🔵 Attempting to create test wellness entry...');
  const testEntry = {
    user_id: session.user.id,
    mood: 'good',
    stress_level: 5,
    notes: 'Test entry from script',
    entry_date: new Date().toISOString().split('T')[0]
  };
  
  const { data, error } = await supabase
    .from('wellness_entries')
    .insert([testEntry])
    .select()
    .single();
    
  if (error) {
    console.log('❌ FAILED to create wellness entry');
    console.log('   Error code:', error.code);
    console.log('   Error message:', error.message);
    console.log('   Error details:', JSON.stringify(error.details, null, 2));
    
    if (error.code === '42501') {
      console.log('\n🔴 RLS POLICY ERROR DETECTED!');
      console.log('   The migration was NOT applied correctly.');
      console.log('\n📋 FIX: Go to Supabase Dashboard SQL Editor and run:');
      console.log('   https://supabase.com/dashboard/project/msfwykwgukbazmhsmjso/sql/new');
      console.log('\n   Copy and paste the SQL from: supabase/migrations/20251119_fix_tasks_rls_policy.sql\n');
    }
  } else {
    console.log('✅ SUCCESS! Wellness entry created:');
    console.log('   Entry ID:', data.id);
    console.log('   Mood:', data.mood);
    console.log('   Stress Level:', data.stress_level);
    console.log('\n🎉 Everything is working! The RLS policy is fixed.\n');
    
    // Clean up - delete the test entry
    await supabase.from('wellness_entries').delete().eq('id', data.id);
    console.log('🧹 Cleaned up test entry.\n');
  }
}

testWellnessEntry().catch(console.error);
