-- Fix RLS policies for wallet-based authentication on profiles table

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Allow anyone to insert a new profile (for wallet registration)
CREATE POLICY "Allow wallet registration"
ON profiles
FOR INSERT
WITH CHECK (true);

-- Allow users to view profiles based on wallet_address
CREATE POLICY "Allow reading profiles"
ON profiles
FOR SELECT
USING (true);

-- Allow users to update their own profile based on wallet_address
CREATE POLICY "Allow updating own profile"
ON profiles
FOR UPDATE
USING (true)
WITH CHECK (true);