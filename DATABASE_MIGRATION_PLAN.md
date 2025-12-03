# Database Migration Plan - Move from localStorage to Database

## Current State
Several features are storing data in localStorage instead of the database:

### Data Currently in localStorage:
1. **User Profile** (`Settings.tsx`)
   - Name, email, university, graduation year
   - Currently: `localStorage.getItem('profile_university')`

2. **Dean's List GPA** (`GradeTracker.tsx`)
   - Custom GPA requirement
   - Currently: `localStorage.getItem('deansListGPA')`

3. **Course Platform Links** (`Settings.tsx`)
   - Moodle, Blackboard, etc. links
   - Currently: `localStorage.getItem('courseLinks')`

4. **Notifications Settings** (`Settings.tsx`)
   - Task reminders, wellness check-ins, etc.
   - Currently: `localStorage.setItem('notifications', JSON.stringify(notifications))`

5. **Theme Preference** (`Settings.tsx`, `Navbar.tsx`)
   - light/dark/auto mode
   - Currently: `localStorage.getItem('theme')`

6. **Pomodoro Custom Times** (`PomodoroTimer.tsx`)
   - Work/break durations
   - Currently: `localStorage.getItem('pomodoro_customTimes')`

7. **Quick Notes** (`PomodoroTimer.tsx`)
   - Notes from Pomodoro sessions
   - Currently: `localStorage.getItem('quick_notes')`

8. **Chat History** (`AIChatbot.tsx`)
   - AI chat messages
   - Currently: `localStorage.getItem('chatHistory')`
   - **Note**: This can stay in localStorage (not critical data)

9. **Canvas/Calendar URLs** (`Settings.tsx`)
   - Already saved to database via `authService.updateUserConnections()`
   - ✅ Already implemented correctly

## Solution

### Step 1: Run Database Migrations ✅
- [x] `20251202_sync_auth_users.sql` - Sync auth users to public.users
- [ ] `20251202_add_user_profile_fields.sql` - Add profile fields and new tables

### Step 2: Update Database Service ✅
- [x] Add types: `UserProfile`, `CourseLink`, `QuickNote`
- [x] Add methods:
  - `getUserProfile()`, `updateUserProfile()`
  - `getCourseLinks()`, `createCourseLink()`, `deleteCourseLink()`
  - `getQuickNotes()`, `saveQuickNote()`, `deleteQuickNote()`

### Step 3: Update Components
Need to update these components to use database instead of localStorage:

#### A. Settings.tsx
**Profile Section:**
```typescript
// OLD:
const saveProfile = () => {
  localStorage.setItem('profile_name', profile.name);
  // ...
};

// NEW:
const saveProfile = async () => {
  await databaseService.updateUserProfile(userId, {
    full_name: profile.name,
    university: profile.university,
    graduation_year: profile.graduationYear
  });
};
```

**Course Links Section:**
```typescript
// OLD:
const addCourseLink = (name: string, url: string, platform: string) => {
  const updated = [...courseLinks, { id: Date.now().toString(), name, url, platform }];
  setCourseLinks(updated);
  localStorage.setItem('courseLinks', JSON.stringify(updated));
};

// NEW:
const addCourseLink = async (name: string, url: string, platform: string) => {
  const newLink = await databaseService.createCourseLink(userId, { name, url, platform });
  setCourseLinks([...courseLinks, newLink]);
};
```

**Notifications Section:**
```typescript
// OLD:
const toggleNotification = (key: keyof Notifications) => {
  const updated = { ...notifications, [key]: !notifications[key] };
  setNotifications(updated);
  localStorage.setItem('notifications', JSON.stringify(updated));
};

// NEW:
const toggleNotification = async (key: keyof Notifications) => {
  const updated = { ...notifications, [key]: !notifications[key] };
  setNotifications(updated);
  await databaseService.updateUserProfile(userId, { notifications: updated });
};
```

**Theme Section:**
```typescript
// NEW:
const handleThemeChange = async (newTheme: ThemeMode) => {
  setTheme(newTheme);
  applyAppTheme(newTheme);
  await databaseService.updateUserProfile(userId, { theme: newTheme });
};
```

#### B. GradeTracker.tsx
**Dean's List GPA:**
```typescript
// OLD:
const [deansListGPA, setDeansListGPA] = useState<number>(() => {
  const saved = localStorage.getItem('deansListGPA');
  return saved ? parseFloat(saved) : 3.5;
});

// NEW:
const [deansListGPA, setDeansListGPA] = useState<number>(3.5);

// Load from database on mount
useEffect(() => {
  const loadProfile = async () => {
    const profile = await databaseService.getUserProfile(user.id);
    if (profile) {
      setDeansListGPA(profile.deans_list_gpa);
    }
  };
  loadProfile();
}, []);

// Save to database on change
const updateDeansListGPA = async (value: number) => {
  setDeansListGPA(value);
  await databaseService.updateUserProfile(userId, { deans_list_gpa: value });
};
```

#### C. PomodoroTimer.tsx
**Custom Times:**
```typescript
// OLD:
const [customTimes, setCustomTimes] = useState(() => {
  const saved = localStorage.getItem('pomodoro_customTimes');
  return saved ? JSON.parse(saved) : { work: 25, shortBreak: 5, longBreak: 15 };
});

// NEW:
const [customTimes, setCustomTimes] = useState({ work: 25, shortBreak: 5, longBreak: 15 });

// Load from database
useEffect(() => {
  const loadProfile = async () => {
    const profile = await databaseService.getUserProfile(user.id);
    if (profile?.pomodoro_custom_times) {
      setCustomTimes(profile.pomodoro_custom_times);
    }
  };
  loadProfile();
}, []);

// Save to database
const saveCustomTimes = async (times) => {
  setCustomTimes(times);
  await databaseService.updateUserProfile(userId, { pomodoro_custom_times: times });
};
```

**Quick Notes:**
```typescript
// OLD:
const [quickNotes, setQuickNotes] = useState<string[]>(() => {
  const saved = localStorage.getItem('quick_notes');
  return saved ? JSON.parse(saved) : [];
});

// NEW:
const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);

// Load from database
useEffect(() => {
  const loadNotes = async () => {
    const notes = await databaseService.getQuickNotes(user.id);
    setQuickNotes(notes);
  };
  loadNotes();
}, []);

// Save note
const addNote = async (content: string) => {
  const newNote = await databaseService.saveQuickNote(userId, content);
  setQuickNotes([newNote, ...quickNotes]);
};
```

### Step 4: Migration Script (Optional)
Create a one-time script to migrate existing localStorage data to database:

```typescript
const migrateLocalStorageToDatabase = async (userId: string) => {
  // Migrate profile
  const university = localStorage.getItem('profile_university');
  const graduationYear = localStorage.getItem('profile_graduationYear');
  if (university || graduationYear) {
    await databaseService.updateUserProfile(userId, {
      university,
      graduation_year: graduationYear
    });
  }

  // Migrate Dean's List GPA
  const deansListGPA = localStorage.getItem('deansListGPA');
  if (deansListGPA) {
    await databaseService.updateUserProfile(userId, {
      deans_list_gpa: parseFloat(deansListGPA)
    });
  }

  // Migrate course links
  const courseLinksStr = localStorage.getItem('courseLinks');
  if (courseLinksStr) {
    const links = JSON.parse(courseLinksStr);
    for (const link of links) {
      await databaseService.createCourseLink(userId, link);
    }
  }

  // Migrate quick notes
  const notesStr = localStorage.getItem('quick_notes');
  if (notesStr) {
    const notes = JSON.parse(notesStr);
    for (const note of notes) {
      await databaseService.saveQuickNote(userId, note);
    }
  }

  // Clean up localStorage
  localStorage.removeItem('profile_university');
  localStorage.removeItem('profile_graduationYear');
  localStorage.removeItem('deansListGPA');
  localStorage.removeItem('courseLinks');
  localStorage.removeItem('quick_notes');
};
```

## Benefits of Database Storage

1. **Data Persistence**: Works across devices and browsers
2. **Data Security**: RLS policies protect user data
3. **Backup**: Automatic backups via Supabase
4. **Sync**: Real-time sync across sessions
5. **Scalability**: Can handle large amounts of data
6. **Analytics**: Can query user data for insights

## Implementation Priority

### High Priority (Do First):
1. ✅ Run migrations
2. Profile fields (university, graduation year)
3. Dean's List GPA
4. Course platform links

### Medium Priority:
5. Notifications settings
6. Theme preference (enhance UX)
7. Pomodoro custom times

### Low Priority:
8. Quick notes (nice to have)
9. Chat history (can stay in localStorage)

## Testing Plan

After each component update:
1. Clear localStorage
2. Log in
3. Test the feature
4. Verify data saves to database
5. Log out and log back in
6. Verify data persists
7. Check Supabase dashboard to see data

## Rollout Strategy

1. **Phase 1**: Run migrations, update database service (✅ Done)
2. **Phase 2**: Update Settings component (profile + course links)
3. **Phase 3**: Update GradeTracker (Dean's List GPA)
4. **Phase 4**: Update PomodoroTimer (custom times + quick notes)
5. **Phase 5**: Add migration helper for existing users
6. **Phase 6**: Test thoroughly, commit, push, deploy

## Current Status

- [x] Migration files created
- [x] Database service updated with new methods
- [ ] Settings component needs update
- [ ] GradeTracker component needs update
- [ ] PomodoroTimer component needs update
- [ ] Testing needed
- [ ] Deployment pending
