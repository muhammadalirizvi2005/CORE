#!/bin/bash

echo "================================================"
echo "🔧 Supabase RLS Policy Fix Verification"
echo "================================================"
echo ""
echo "This script will help you verify if the RLS policies are fixed."
echo ""
echo "📋 BEFORE running this script, you MUST:"
echo "   1. Go to: https://supabase.com/dashboard/project/msfwykwgukbazmhsmjso/sql"
echo "   2. Run the SQL from: FIX_403_ERROR.md"
echo "   3. Make sure you're logged into your app"
echo ""
read -p "Have you completed the steps above? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Please complete the steps above first!"
    echo "   Read FIX_403_ERROR.md for detailed instructions"
    exit 1
fi

echo ""
echo "🧪 Running verification test..."
echo ""

# Run the test script
node test-rls.js

echo ""
echo "================================================"
echo "📝 Next Steps:"
echo "================================================"
echo ""
echo "If you see '✅ Task created successfully!':"
echo "  → Your RLS policies are FIXED! 🎉"
echo "  → You can now use your app normally"
echo ""
echo "If you see '❌ Error creating task':"
echo "  → Make sure you logged into the app first"
echo "  → Make sure you ran the SQL in Supabase Dashboard"
echo "  → Check FIX_403_ERROR.md for detailed instructions"
echo ""
