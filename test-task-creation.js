const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://msfwykwgukbazmhsmjso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZnd5a3dndWtiYXptaHNtanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3NTk0NjcsImV4cCI6MjA0MzMzNTQ2N30.jDmLCmVDTVzr46pCJ8LDO1vb2nR7Qm_jhyoXlkVwFfI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testTaskCreation() {
  console.log('🔍 Testing task creation with current auth...\n');
  
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
  
  // Try to create a test task
  console.log('🔵 Attempting to create test task...');
  const testTask = {
    user_id: session.user.id,
    title: 'Test Task from Script',
    description: 'Testing RLS policies',
    category: 'personal',
    priority: 'low',
    completed: false,
    created_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('tasks')
    .insert([testTask])
    .select()
    .single();
    
  if (error) {
    console.log('❌ FAILED to create task');
    console.log('   Error code:', error.code);
    console.log('   Error message:', error.message);
    console.log('   Error details:', JSON.stringify(error.details, null, 2));
    
    if (error.code === '42501') {
      console.log('\n🔴 RLS POLICY ERROR DETECTED!');
      console.log('   The migration was NOT applied correctly.');
      console.log('   Go to Supabase Dashboard and run the SQL migration again.\n');
    }
  } else {
    console.log('✅ SUCCESS! Task created:');
    console.log('   Task ID:', data.id);
    console.log('   Title:', data.title);
    console.log('\n🎉 Everything is working! The RLS policy is fixed.\n');
    
    // Clean up - delete the test task
    await supabase.from('tasks').delete().eq('id', data.id);
    console.log('🧹 Cleaned up test task.\n');
  }
}

testTaskCreation().catch(console.error);
