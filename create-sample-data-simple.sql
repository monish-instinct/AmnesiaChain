-- Simple Sample Data Creation Function (No Conflicts)
-- Run this after running the schema setup

-- Drop existing functions first
DROP FUNCTION IF EXISTS create_quick_sample(TEXT, TEXT);
DROP FUNCTION IF EXISTS create_sample_data_for_wallet(TEXT, TEXT);

-- Create new simple sample data function
CREATE OR REPLACE FUNCTION create_quick_sample(wallet_addr TEXT, chain_type TEXT DEFAULT 'ethereum')
RETURNS TEXT AS $$
DECLARE
    profile_exists BOOLEAN;
    data_count INTEGER;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE wallet_address = wallet_addr) INTO profile_exists;
    
    -- Check if data already exists
    SELECT COUNT(*) FROM data_records WHERE user_wallet = wallet_addr INTO data_count;
    
    -- If data already exists, return message
    IF data_count > 0 THEN
        RETURN 'Sample data already exists for wallet: ' || wallet_addr || '. Found ' || data_count || ' records.';
    END IF;
    
    -- Create user profile if it doesn't exist
    IF NOT profile_exists THEN
        INSERT INTO user_profiles (
            wallet_address, chain_type, total_data_active, total_data_archived,
            total_data_forgotten, storage_saved_gb, cost_reduction_percentage
        ) VALUES (
            wallet_addr, chain_type, 3, 2, 1, 1.5, 18.2
        );
    ELSE
        -- Update existing profile
        UPDATE user_profiles SET
            total_data_active = 3,
            total_data_archived = 2, 
            total_data_forgotten = 1,
            storage_saved_gb = 1.5,
            cost_reduction_percentage = 18.2,
            updated_at = NOW()
        WHERE wallet_address = wallet_addr;
    END IF;

    -- Create sample data records (these should be unique due to different hashes)
    INSERT INTO data_records (
        user_wallet, data_hash, data_type, size_bytes, status, relevance_score, gas_used, last_accessed, transaction_hash
    ) VALUES 
    (wallet_addr, 'QmX4e7B9n2K8mC5tF3wH6vY1jR9sL7pQ2aD8fG4hJ6kM9', 'document', 2097152, 'active', 0.85, 21000, NOW() - INTERVAL '5 minutes', '0xabc123001'),
    (wallet_addr, 'QmY9f8C0o3L9nD6uG4xI7wZ2kS8qM8pR3bE9gH5iK7lN0', 'image', 5242880, 'archived', 0.60, 25000, NOW() - INTERVAL '2 hours', '0xdef456002'),
    (wallet_addr, 'QmZ0g9D1p4M0oE7vH5yJ8xA3lT9rN9qS4cF0hI6jL8mO1', 'video', 20971520, 'active', 0.92, 35000, NOW() - INTERVAL '10 minutes', '0xghi789003'),
    (wallet_addr, 'QmA1h2I3j4K5l6M7n8O9p0Q1r2S3t4U5v6W7x8Y9z0A1b', 'document', 1048576, 'dead', 0.30, 15000, NOW() - INTERVAL '1 day', '0xjkl012004'),
    (wallet_addr, 'QmB2i3J4k5L6m7N8o9P0q1R2s3T4u5V6w7X8y9Z0b1C2d', 'image', 3145728, 'archived', 0.75, 28000, NOW() - INTERVAL '4 hours', '0xmno345005'),
    (wallet_addr, 'QmC3j4K5l6M7n8O9p0Q1r2S3t4U5v6W7x8Y9z0A1b2C3e', 'video', 15728640, 'active', 0.88, 42000, NOW() - INTERVAL '30 minutes', '0xpqr678006');

    -- Create activity logs
    INSERT INTO activity_logs (user_wallet, action, description) VALUES 
    (wallet_addr, 'create', 'Created new document record - Project whitepaper.pdf'),
    (wallet_addr, 'archive', 'Archived image data to cold storage - banner.jpg'),
    (wallet_addr, 'create', 'Created new video record - demo_presentation.mp4'),
    (wallet_addr, 'forget', 'Permanently deleted old backup file - temp_backup.zip'),
    (wallet_addr, 'archive', 'Archived user profile picture - avatar.png'),
    (wallet_addr, 'promote', 'Restored important document from archive - contract.pdf');
    
    RETURN 'Sample data created successfully for wallet: ' || wallet_addr || '. Created 6 data records and 6 activity logs.';
END;
$$ LANGUAGE plpgsql;

-- Create get_user_stats function
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

-- Create helper function to clean data for testing
CREATE OR REPLACE FUNCTION clean_sample_data(wallet_addr TEXT)
RETURNS TEXT AS $$
BEGIN
    DELETE FROM activity_logs WHERE user_wallet = wallet_addr;
    DELETE FROM data_records WHERE user_wallet = wallet_addr;
    DELETE FROM user_profiles WHERE wallet_address = wallet_addr;
    
    RETURN 'Cleaned all sample data for wallet: ' || wallet_addr;
END;
$$ LANGUAGE plpgsql;

-- Instructions
SELECT 'Setup complete! You can now:
1. Run: SELECT create_quick_sample(''YOUR_WALLET_ADDRESS'', ''ethereum'');
2. To clean data: SELECT clean_sample_data(''YOUR_WALLET_ADDRESS'');
3. Check the frontend - it should now work!' as instructions;
