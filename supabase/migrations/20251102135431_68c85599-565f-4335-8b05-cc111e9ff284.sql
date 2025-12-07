-- Clean up all RLS policies and create wallet-friendly ones
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow reading profiles" ON profiles;
DROP POLICY IF EXISTS "Allow wallet registration" ON profiles;
DROP POLICY IF EXISTS "Allow updating own profile" ON profiles;

-- Create simple, permissive policies for wallet-based auth
CREATE POLICY "Enable read access for all users" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON profiles FOR UPDATE 
USING (true);