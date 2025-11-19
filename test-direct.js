// Direct test - bypassing the app
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msfwykwgukbazmhsmjso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZnd5a3dndWtiYXptaHNtanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NDAxMjEsImV4cCI6MjA3NDQxNjEyMX0.fJ7XirbFdFwF6piyaHzOyUy4AwdFWxRwccR-o_p7RzM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDirect() {
  console.log('\n🧪 DIRECT TEST - Checking RLS Policies\n');
  
  // First, let's check if there's a session in localStorage
  const stored = localStorage.getItem('sb-msfwykwgukbazmhsmjso-auth-token');
  console.log('LocalStorage auth token:', stored ? 'EXISTS' : 'NOT FOUND');
  
  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('❌ Session error:', sessionError);
    return;
  }
  
  if (!session) {
    console.log('❌ NO SESSION - You need to login in the browser first');
    console.log('   Open http://localhost:5173 and login');
    console.log('   Then run this test again\n');
    return;
  }
  
  console.log('✅ Session found');
  console.log('   User ID:', session.user.id);
  console.log('   Email:', session.user.email);
  
  // Test task creation with direct insert
  console.log('\n🧪 Testing direct task insert...\n');
  
  const testTask = {
    user_id: session.user.id,
    title: 'Direct Test Task',
    description: 'Testing RLS',
    category: 'personal',
    priority: 'medium',
    completed: false,
    course_code: 'TEST',
    due_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('tasks')
    .insert([testTask])
    .select()
    .single();
  
  if (error) {
    console.log('❌ FAILED TO INSERT TASK\n');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Error details:', error.details);
    console.log('Error hint:', error.hint);
    
    console.log('\n🔍 DIAGNOSIS:');
    if (error.code === '42501' || error.message.includes('policy')) {
      console.log('❌ RLS POLICY IS STILL BLOCKING INSERTS');
      console.log('\nThe SQL migration was NOT applied correctly.');
      console.log('Did you run it in the CORRECT Supabase project?');
      console.log('\nVerify your project URL matches:');
      console.log('  Expected: https://msfwykwgukbazmhsmjso.supabase.co');
      console.log('  Check at: https://supabase.com/dashboard/projects');
    }
  } else {
    console.log('✅ TASK INSERTED SUCCESSFULLY!\n');
    console.log('Task ID:', data.id);
    console.log('Title:', data.title);
    
    // Clean up
    await supabase.from('tasks').delete().eq('id', data.id);
    console.log('✅ Test task deleted\n');
    console.log('🎉 YOUR RLS POLICIES ARE WORKING!');
    console.log('   The issue must be somewhere else in your app code.\n');
  }
}

testDirect().catch(console.error);
