# Fix ON CONFLICT Error - Complete Setup Guide

## Issue
The "Create Sample Data" button throws an error: "there is no unique or exclusion constraint matching the ON CONFLICT specification"

## Root Cause
The database tables either don't exist or don't have the proper primary keys and unique constraints that our sample data creation function expects.

## Solution - Follow These Steps

### Step 1: Create Complete Database Schema

1. **Go to your Supabase Dashboard** → SQL Editor
2. **Copy and paste the contents of `create-database-schema.sql`**
3. **Click "Run"** to create all tables with proper constraints

This will create:
- ✅ `user_profiles` table with `wallet_address` as primary key
- ✅ `data_records` table with unique constraint on `(user_wallet, data_hash)`
- ✅ `activity_logs` table with proper structure
- ✅ `transactions` table with proper structure
- ✅ All necessary indexes and foreign keys
- ✅ Row Level Security policies

### Step 2: Create Sample Data Functions

1. **In the same SQL Editor**, copy and paste the contents of `create-sample-data-simple.sql`
2. **Click "Run"** to create the functions

This will create:
- ✅ `create_quick_sample()` function (fixed version without conflicts)
- ✅ `get_user_stats()` function for dashboard statistics
- ✅ `clean_sample_data()` helper function for testing

### Step 3: Test the Setup

1. **Connect your wallet** in the frontend application
2. **Copy your wallet address** from the browser console or UI
3. **Test manually in SQL Editor**:
   ```sql
   -- Replace with your actual wallet address
   SELECT create_quick_sample('0x742d35cc6cF21f0B8B0Fb90e2f6dDe5E67a3e23D', 'ethereum');
   ```

### Step 4: Use the Frontend

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R / Cmd+Shift+R)
2. **Connect your wallet**
3. **Click "Create Sample Data"** - it should now work without errors!

## What Changed

### Previous Issue:
```sql
-- This caused the error because tables didn't have proper unique constraints
INSERT ... ON CONFLICT (wallet_address) DO UPDATE SET ...
```

### Fixed Approach:
```sql
-- Check if data exists first, then insert or update accordingly
IF NOT profile_exists THEN
    INSERT INTO user_profiles ...
ELSE
    UPDATE user_profiles SET ...
END IF;
```

## Verification Steps

After running the setup, verify everything works:

### 1. Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'data_records', 'activity_logs', 'transactions');
```

### 2. Check Constraints
```sql
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass;
```

### 3. Test Sample Data Creation
```sql
-- Should return success message
SELECT create_quick_sample('0xTEST123', 'ethereum');
```

### 4. Test Stats Function
```sql
-- Should return statistics
SELECT * FROM get_user_stats('0xTEST123');
```

## Troubleshooting

### If you still get errors:

1. **Check existing tables**: Your database might have incomplete tables from before
   ```sql
   DROP TABLE IF EXISTS activity_logs CASCADE;
   DROP TABLE IF EXISTS data_records CASCADE; 
   DROP TABLE IF EXISTS transactions CASCADE;
   DROP TABLE IF EXISTS user_profiles CASCADE;
   ```
   Then re-run the schema creation script.

2. **Check RLS policies**: Make sure you have the right permissions
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('user_profiles', 'data_records');
   ```

3. **Check function exists**:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'create_quick_sample';
   ```

## Expected Results

After completing this setup:

✅ **Frontend loads without blank screen**  
✅ **"Create Sample Data" button works**  
✅ **Dashboard shows real data from Supabase**  
✅ **Statistics cards display correct numbers**  
✅ **Activity logs show recent actions**  
✅ **Active/Archived/Dead pages work**

Your AmnesiaChain dashboard will be fully functional with real data from Supabase! 🚀
