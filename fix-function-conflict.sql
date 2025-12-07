-- Quick Fix for Function Conflict
-- Run this FIRST in your Supabase SQL Editor

-- Drop the existing function that has wrong return type
DROP FUNCTION IF EXISTS get_user_stats(TEXT);

-- Also drop any other variations that might exist
DROP FUNCTION IF EXISTS get_user_stats(TEXT, TEXT);
DROP FUNCTION IF EXISTS get_user_stats();

-- Now you can run the complete-supabase-setup.sql script without errors
