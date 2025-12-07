-- Remove foreign key constraints that require auth.users
-- This allows wallet-based authentication without Supabase auth

ALTER TABLE iot_devices DROP CONSTRAINT IF EXISTS iot_devices_user_id_fkey;
ALTER TABLE sensor_readings DROP CONSTRAINT IF EXISTS sensor_readings_user_id_fkey;

-- Make user_id nullable since we're using wallet auth
ALTER TABLE iot_devices ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE sensor_readings ALTER COLUMN user_id DROP NOT NULL;