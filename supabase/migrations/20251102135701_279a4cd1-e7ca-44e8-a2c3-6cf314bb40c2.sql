-- Fix RLS policies for wallet-based authentication on IoT tables
-- Since we're using wallet auth (no Supabase auth), we need permissive policies

-- Drop existing restrictive policies on iot_devices
DROP POLICY IF EXISTS "Users can view own devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can insert own devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can update own devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can delete own devices" ON iot_devices;

-- Create permissive policies for iot_devices
CREATE POLICY "Enable read access for all users" 
ON iot_devices FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON iot_devices FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON iot_devices FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON iot_devices FOR DELETE 
USING (true);

-- Drop existing restrictive policies on sensor_readings
DROP POLICY IF EXISTS "Users can view own readings" ON sensor_readings;
DROP POLICY IF EXISTS "Users can insert own readings" ON sensor_readings;

-- Create permissive policies for sensor_readings
CREATE POLICY "Enable read access for all users" 
ON sensor_readings FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON sensor_readings FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON sensor_readings FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON sensor_readings FOR DELETE 
USING (true);