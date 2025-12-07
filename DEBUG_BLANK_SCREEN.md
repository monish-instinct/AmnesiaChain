# Debug Blank Screen Issue

## Current Status
I've added comprehensive error handling and debugging tools to help identify why the dashboard goes blank after loading.

## What I've Added

### 1. Error Boundary (`ErrorBoundary.tsx`)
- Catches React errors and displays them instead of blank screen
- Shows detailed error information in development mode
- Provides retry and reload options

### 2. Enhanced Error Handling
- Better error handling in `useUserData` hook
- Safe data type checking and fallbacks
- Improved error messages with details

### 3. Diagnostic Panel (`DiagnosticPanel.tsx`)
- Real-time system health checks
- Tests Supabase connection, tables, and functions
- Shows detailed error messages

## How to Debug

### Step 1: Check the Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Connect your wallet and navigate to dashboard
4. Look for any red error messages

### Step 2: Use the Diagnostic Panel
1. After connecting your wallet, you'll see a "System Diagnostics" card
2. Click "Run Diagnostics" to test all systems
3. Check for any red X marks indicating failures

### Step 3: Common Issues and Solutions

#### Issue: Supabase Connection Failed
**Solution**: Check your `.env` file:
```bash
# Make sure these are set correctly
VITE_SUPABASE_URL=https://chhbooncjwppnrfcjmla.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Issue: RPC Functions Missing
**Solution**: Run this in your Supabase SQL Editor:
```sql
-- Copy and paste the entire complete-supabase-setup.sql file
```

#### Issue: Database Tables Don't Exist
**Solution**: Check your Supabase database has these tables:
- `user_profiles`
- `data_records` 
- `activity_logs`
- `transactions`

#### Issue: JavaScript Error
**Solution**: The error boundary will show the exact error. Common issues:
- Missing dependencies
- Type errors in data
- Network connectivity issues

### Step 4: Create Sample Data
1. After diagnostics pass, use the "Create Sample Data" button
2. This will populate your database with test data
3. The dashboard should then display properly

## Quick Fixes to Try

1. **Hard Refresh**: Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)

2. **Clear Cache**: 
   ```bash
   # Stop dev server, then:
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **Check Network Tab**: Look for failed API requests to Supabase

4. **Test Supabase Directly**: 
   - Go to your Supabase dashboard
   - Try running: `SELECT * FROM user_profiles LIMIT 1;`

## What to Do Next

1. **Connect your wallet** and go to the dashboard
2. **Check the browser console** for any error messages
3. **Use the diagnostic panel** to identify specific issues
4. **Report back** with any error messages you see

The error boundary and diagnostic tools will now show you exactly what's causing the blank screen instead of failing silently.

## Expected Console Output

When working correctly, you should see:
```
🔍 Debug Info:
Wallet Address: 0x...
🔄 Loading data for wallet: 0x...
✅ Data loaded: { records: [...], activities: [...], stats: {...} }
```

If you see errors, please share them so I can provide specific fixes!
