# Canvas Grades Integration

## Overview
The Grade Tracker now automatically syncs your grades directly from Canvas! No need to manually enter courses or assignments - just connect Canvas and click "Sync Canvas".

## How It Works

### 1. **Connect Canvas** (First Time Setup)
   - Go to **Settings** tab
   - Find the "Canvas" section
   - Click "Connect Canvas"
   - Enter your Canvas domain (e.g., `your-school.instructure.com`)
   - Complete the OAuth flow to authorize the connection

### 2. **Sync Your Grades**
   - Go to the **Grade Tracker** tab
   - Click the **"Sync Canvas"** button (green button with refresh icon)
   - Wait for the sync to complete
   - Your courses and grades will be automatically updated!

### 3. **What Gets Synced**
   - ✅ All active courses
   - ✅ Current grades for each course
   - ✅ Assignments with scores
   - ✅ Due dates and submission status
   - ✅ GPA calculations

## Features

### Automatic Grade Updates
- Click "Sync Canvas" whenever you want to refresh your grades
- All courses and assignments are updated in real-time
- Existing courses get updated, new courses are added

### Grade Display
- **Current Grade**: Shows your current grade percentage from Canvas
- **GPA Calculation**: Automatically calculates your GPA
- **Assignments**: View all graded assignments for each course
- **Grade Distribution**: See your performance across all courses

### Manual Additions
- You can still manually add courses that aren't on Canvas
- Edit course details (credits, target grade, color)
- The system handles both Canvas-synced and manual courses

## Troubleshooting

### "Please connect Canvas in Settings first"
- You need to connect Canvas before syncing
- Go to Settings → Connect Canvas
- Complete the authorization process

### "Failed to sync Canvas grades"
- Check your Canvas connection in Settings
- Make sure you're logged into Canvas
- Try disconnecting and reconnecting Canvas
- Check browser console for detailed error messages

### Canvas Token Expired
- If you get authentication errors, try:
  1. Go to Settings
  2. Disconnect Canvas
  3. Reconnect Canvas
  4. Try syncing again

### Missing Courses
- Only **active** courses are synced
- Completed/archived courses won't appear
- Check Canvas to verify course status

## Privacy & Data

- Your Canvas grades are stored locally in your Supabase database
- Only you can access your grade data
- Canvas credentials are securely stored using OAuth
- You can disconnect Canvas anytime from Settings

## Tips

1. **Sync Regularly**: Click "Sync Canvas" before checking your grades to get the latest updates
2. **Set Target Grades**: After syncing, edit each course to set your target grade
3. **Track Progress**: Use the GPA overview to monitor your academic performance
4. **Combine with Tasks**: Create tasks for upcoming assignments to stay organized

## Technical Details

### Canvas API
- Uses Canvas REST API v1
- Fetches courses with `/api/v1/courses`
- Fetches assignments with `/api/v1/courses/{id}/assignments`
- Requires OAuth token for authentication

### Database Storage
- Courses stored in `courses` table
- Assignments stored in `assignments` table
- Syncing updates existing records and creates new ones
- No duplicates - matches by course code and assignment name

### Sync Process
1. Fetch all active courses from Canvas
2. For each course, get current grade and enrollment info
3. Fetch all graded assignments for the course
4. Update or create course records in database
5. Update or create assignment records in database
6. Refresh UI with latest data

---

**Need help?** Check the browser console (F12) for detailed logs when syncing Canvas grades.
