-- Complete AmnesiaChain Supabase Setup Script
-- Run this in your Supabase SQL Editor to set up all required functions

-- 1. Drop existing function if it exists (to avoid type conflicts)
DROP FUNCTION IF EXISTS get_user_stats(TEXT);

-- 2. Create the get_user_stats function (required by frontend)
CREATE OR REPLACE FUNCTION get_user_stats(wallet_addr TEXT)
RETURNS TABLE(
  activeData INTEGER,
  archivedData INTEGER,
  deadData INTEGER,
  totalStorageSaved NUMERIC,
  averageRelevance NUMERIC,
  totalGasUsed BIGINT,
  costReduction NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((SELECT COUNT(*)::INTEGER FROM data_records WHERE user_wallet = wallet_addr AND status = 'active'), 0) as activeData,
    COALESCE((SELECT COUNT(*)::INTEGER FROM data_records WHERE user_wallet = wallet_addr AND status = 'archived'), 0) as archivedData,
    COALESCE((SELECT COUNT(*)::INTEGER FROM data_records WHERE user_wallet = wallet_addr AND status = 'dead'), 0) as deadData,
    COALESCE((SELECT ROUND((SUM(size_bytes) / 1073741824.0), 2) FROM data_records WHERE user_wallet = wallet_addr AND status IN ('archived', 'dead')), 0::NUMERIC) as totalStorageSaved,
    COALESCE((SELECT ROUND(AVG(relevance_score), 3) FROM data_records WHERE user_wallet = wallet_addr), 0::NUMERIC) as averageRelevance,
    COALESCE((SELECT SUM(gas_used)::BIGINT FROM data_records WHERE user_wallet = wallet_addr), 0::BIGINT) as totalGasUsed,
    COALESCE((SELECT cost_reduction_percentage FROM user_profiles WHERE wallet_address = wallet_addr), 0::NUMERIC) as costReduction;
END;
$$ LANGUAGE plpgsql;

-- 3. Quick sample data creation function (if you haven't run it already)
CREATE OR REPLACE FUNCTION create_quick_sample(wallet_addr TEXT, chain_type TEXT DEFAULT 'ethereum')
RETURNS TEXT AS $$
BEGIN
  -- Temporarily disable RLS for data insertion
  PERFORM set_config('row_security', 'off', true);
  
  -- Create user profile
  INSERT INTO user_profiles (
    wallet_address, chain_type, total_data_active, total_data_archived,
    total_data_forgotten, storage_saved_gb, cost_reduction_percentage
  ) VALUES (
    wallet_addr, chain_type, 3, 2, 1, 1.5, 18.2
  ) ON CONFLICT (wallet_address) DO UPDATE SET
    total_data_active = 3, total_data_archived = 2, total_data_forgotten = 1,
    storage_saved_gb = 1.5, cost_reduction_percentage = 18.2;

  -- Create sample data records
  INSERT INTO data_records (
    user_wallet, data_hash, data_type, size_bytes, status, relevance_score, gas_used, last_accessed, transaction_hash
  ) VALUES 
  (wallet_addr, 'QmX4e7B9n2K8mC5tF3wH6vY1jR9sL7pQ2aD8fG4hJ6kM9', 'document', 2097152, 'active', 0.85, 21000, NOW() - INTERVAL '5 minutes', '0xabc123'),
  (wallet_addr, 'QmY9f8C0o3L9nD6uG4xI7wZ2kS8qM8pR3bE9gH5iK7lN0', 'image', 5242880, 'archived', 0.60, 25000, NOW() - INTERVAL '2 hours', '0xdef456'),
  (wallet_addr, 'QmZ0g9D1p4M0oE7vH5yJ8xA3lT9rN9qS4cF0hI6jL8mO1', 'video', 20971520, 'active', 0.92, 35000, NOW() - INTERVAL '10 minutes', '0xghi789'),
  (wallet_addr, 'QmA1h2I3j4K5l6M7n8O9p0Q1r2S3t4U5v6W7x8Y9z0A1b', 'document', 1048576, 'dead', 0.30, 15000, NOW() - INTERVAL '1 day', '0xjkl012'),
  (wallet_addr, 'QmB2i3J4k5L6m7N8o9P0q1R2s3T4u5V6w7X8y9Z0b1C2d', 'image', 3145728, 'archived', 0.75, 28000, NOW() - INTERVAL '4 hours', '0xmno345'),
  (wallet_addr, 'QmC3j4K5l6M7n8O9p0Q1r2S3t4U5v6W7x8Y9z0A1b2C3e', 'video', 15728640, 'active', 0.88, 42000, NOW() - INTERVAL '30 minutes', '0xpqr678')
  ON CONFLICT (user_wallet, data_hash) DO NOTHING;

  -- Create activity logs
  INSERT INTO activity_logs (user_wallet, action, description) VALUES 
  (wallet_addr, 'create', 'Created new document record - Project whitepaper.pdf'),
  (wallet_addr, 'archive', 'Archived image data to cold storage - banner.jpg'),
  (wallet_addr, 'create', 'Created new video record - demo_presentation.mp4'),
  (wallet_addr, 'forget', 'Permanently deleted old backup file - temp_backup.zip'),
  (wallet_addr, 'archive', 'Archived user profile picture - avatar.png'),
  (wallet_addr, 'promote', 'Restored important document from archive - contract.pdf')
  ON CONFLICT DO NOTHING;

  -- Re-enable RLS
  PERFORM set_config('row_security', 'on', true);
  
  RETURN 'Sample data created successfully for wallet: ' || wallet_addr;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to check if data exists for a wallet
CREATE OR REPLACE FUNCTION check_wallet_data(wallet_addr TEXT)
RETURNS TABLE(
  has_profile BOOLEAN,
  record_count INTEGER,
  activity_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM user_profiles WHERE wallet_address = wallet_addr) as has_profile,
    COALESCE((SELECT COUNT(*)::INTEGER FROM data_records WHERE user_wallet = wallet_addr), 0) as record_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM activity_logs WHERE user_wallet = wallet_addr), 0) as activity_count;
END;
$$ LANGUAGE plpgsql;

-- Instructions:
-- 1. After connecting your wallet in the app, get your wallet address
-- 2. Run: SELECT create_quick_sample('YOUR_WALLET_ADDRESS', 'ethereum');
-- 3. To check data: SELECT * FROM check_wallet_data('YOUR_WALLET_ADDRESS');
-- 4. The frontend will now display your data!

-- Example for testing (replace with actual wallet address):
-- SELECT create_quick_sample('0x742d35cc6cF21f0B8B0Fb90e2f6dDe5E67a3e23D', 'ethereum');
