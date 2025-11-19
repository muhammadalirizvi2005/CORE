// Enhanced diagnostic script to check RLS and auth issues
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msfwykwgukbazmhsmjso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZnd5a3dndWtiYXptaHNtanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NDAxMjEsImV4cCI6MjA3NDQxNjEyMX0.fJ7XirbFdFwF6piyaHzOyUy4AwdFWxRwccR-o_p7RzM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('\n═══════════════════════════════════════════════════');
console.log('🔍 SUPABASE RLS DIAGNOSTIC TOOL');
console.log('═══════════════════════════════════════════════════\n');

// Check if policies exist
async function checkPolicies() {
  console.log('📋 Step 1: Checking RLS Policies...\n');
  
  const { data, error } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'tasks');
  
  if (error) {
    console.log('⚠️  Could not check policies (this is normal with anon key)');
  } else if (data && data.length > 0) {
    console.log('✅ Found', data.length, 'policies on tasks table');
    data.forEach(policy => {
      console.log('   -', policy.policyname);
    });
  }
  console.log('');
}

// Check current user
async function checkAuth() {
  console.log('👤 Step 2: Checking Authentication...\n');
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.log('❌ Session error:', error.message);
    return null;
  }
  
  if (!session) {
    console.log('❌ NOT LOGGED IN');
    console.log('   → You need to login first at http://localhost:5174');
    console.log('   → Then run this script again\n');
    return null;
  }
  
  console.log('✅ LOGGED IN');
  console.log('   User ID:', session.user.id);
  console.log('   Email:', session.user.email);
  console.log('   Auth Provider:', session.user.app_metadata.provider || 'email');
  console.log('');
  
  return session.user;
}

// Test task creation
async function testTaskCreation(user) {
  console.log('🧪 Step 3: Testing Task Creation...\n');
  
  const testTask = {
    user_id: user.id,
    title: 'Diagnostic Test Task',
    description: 'Testing RLS policies',
    category: 'personal',
    priority: 'medium',
    completed: false,
    course_code: 'TEST',
    due_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('📝 Attempting to insert task with user_id:', user.id.substring(0, 8) + '...');
  
  const { data, error } = await supabase
    .from('tasks')
    .insert([testTask])
    .select()
    .single();
  
  if (error) {
    console.log('\n❌ TASK CREATION FAILED\n');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    
    if (error.code === '42501' || error.message.includes('policy')) {
      console.log('\n🔧 RLS POLICY ISSUE DETECTED!\n');
      console.log('The RLS policy is blocking your insert. This means:');
      console.log('1. The SQL migration was NOT applied correctly in Supabase');
      console.log('2. OR you applied it to the wrong project');
      console.log('3. OR there\'s a mismatch in user_id');
      console.log('\n📋 TO FIX:');
      console.log('1. Go to: https://supabase.com/dashboard/project/msfwykwgukbazmhsmjso/sql');
      console.log('2. Click "New query"');
      console.log('3. Paste this EXACT SQL:\n');
      console.log('   DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;');
      console.log('   CREATE POLICY "Users can manage their own tasks"');
      console.log('     ON tasks FOR ALL TO authenticated');
      console.log('     USING (user_id = auth.uid())');
      console.log('     WITH CHECK (user_id = auth.uid());');
      console.log('\n4. Click RUN');
      console.log('5. Run this script again\n');
    } else {
      console.log('\n🔍 Other error details:');
      console.log(JSON.stringify(error, null, 2));
    }
    
    return false;
  }
  
  console.log('✅ TASK CREATED SUCCESSFULLY!\n');
  console.log('   Task ID:', data.id);
  console.log('   Title:', data.title);
  console.log('\n🎉 Your RLS policies are working correctly!');
  
  // Clean up
  await supabase.from('tasks').delete().eq('id', data.id);
  console.log('🧹 Test task cleaned up\n');
  
  return true;
}

// Main execution
async function runDiagnostics() {
  try {
    await checkPolicies();
    const user = await checkAuth();
    
    if (!user) {
      console.log('═══════════════════════════════════════════════════');
      console.log('⚠️  Cannot proceed without authentication');
      console.log('═══════════════════════════════════════════════════\n');
      return;
    }
    
    const success = await testTaskCreation(user);
    
    console.log('═══════════════════════════════════════════════════');
    if (success) {
      console.log('✅ ALL TESTS PASSED - Your app should work now!');
    } else {
      console.log('❌ TESTS FAILED - Follow the fix instructions above');
    }
    console.log('═══════════════════════════════════════════════════\n');
    
  } catch (err) {
    console.error('\n❌ Unexpected error:', err);
  }
}

runDiagnostics();
