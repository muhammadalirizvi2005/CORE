// Test script to check RLS policies and authentication
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msfwykwgukbazmhsmjso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZnd5a3dndWtiYXptaHNtanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NDAxMjEsImV4cCI6MjA3NDQxNjEyMX0.fJ7XirbFdFwF6piyaHzOyUy4AwdFWxRwccR-o_p7RzM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('\n🔍 Testing Supabase Connection...\n');
  
  // Check current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('❌ Session error:', sessionError);
    return;
  }
  
  if (!session) {
    console.log('⚠️  No active session found. You need to login first.');
    console.log('   Please login through your app at http://localhost:5174\n');
    return;
  }
  
  console.log('✅ Session found!');
  console.log('   User ID:', session.user.id);
  console.log('   Email:', session.user.email);
  
  // Test creating a task
  console.log('\n🧪 Testing task creation...\n');
  
  const testTask = {
    user_id: session.user.id,
    title: 'Test Task from Script',
    description: 'Testing RLS policies',
    category: 'personal',
    priority: 'medium',
    completed: false,
    course_code: 'TEST101',
    due_date: null
  };
  
  console.log('📝 Attempting to insert task...');
  const { data, error } = await supabase
    .from('tasks')
    .insert([testTask])
    .select()
    .single();
  
  if (error) {
    console.error('❌ Error creating task:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    console.error('   Details:', error.details);
    console.error('   Hint:', error.hint);
    console.log('\n🔧 Fix: You need to run the migration in Supabase SQL Editor!');
    console.log('   Go to: https://supabase.com/dashboard/project/msfwykwgukbazmhsmjso/sql');
    console.log('   Run the SQL from: supabase/migrations/20251119_fix_tasks_rls_policy.sql\n');
  } else {
    console.log('✅ Task created successfully!');
    console.log('   Task ID:', data.id);
    console.log('   Title:', data.title);
    
    // Clean up - delete the test task
    await supabase.from('tasks').delete().eq('id', data.id);
    console.log('🧹 Test task cleaned up\n');
  }
}

testAuth().catch(console.error);
