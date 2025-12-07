-- Temporarily disable RLS for easier data insertion
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Function to create sample data for any wallet address
CREATE OR REPLACE FUNCTION create_sample_data_for_wallet(
    wallet_addr TEXT,
    chain_type_param TEXT DEFAULT 'ethereum'
)
RETURNS TEXT AS $$
DECLARE
    sample_records_created INTEGER;
    sample_logs_created INTEGER;
BEGIN
    -- Create or update user profile
    INSERT INTO user_profiles (
        wallet_address,
        chain_type,
        total_data_active,
        total_data_archived,
        total_data_forgotten,
        storage_saved_gb,
        cost_reduction_percentage,
        preferences
    ) VALUES (
        wallet_addr,
        chain_type_param,
        3,
        2,
        1,
        1.5,
        18.2,
        '{"theme": "dark", "notifications": true, "autoArchive": false}'::jsonb
    ) ON CONFLICT (wallet_address) DO UPDATE SET
        total_data_active = 3,
        total_data_archived = 2,
        total_data_forgotten = 1,
        storage_saved_gb = 1.5,
        cost_reduction_percentage = 18.2,
        updated_at = NOW();

    -- Create sample data records
    INSERT INTO data_records (
        user_wallet,
        data_hash,
        data_type,
        size_bytes,
        status,
        relevance_score,
        gas_used,
        transaction_hash
    ) VALUES 
    (
        wallet_addr,
        'QmX4e7B9n2K8mC5tF3wH6vY1jR9sL7pQ2aD8fG4hJ6kM9',
        'document',
        2097152,
        'active',
        0.85,
        21000,
        CASE WHEN chain_type_param = 'ethereum' 
             THEN '0xabc123def456789012345678901234567890abcdef123456789012345678901234'
             ELSE '5J7K8L9M0N1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P'
        END
    ),
    (
        wallet_addr,
        'QmY9f8C0o3L9nD6uG4xI7wZ2kS8qM8pR3bE9gH5iK7lN0',
        'image',
        5242880,
        'archived',
        0.60,
        25000,
        CASE WHEN chain_type_param = 'ethereum' 
             THEN '0xdef456ghi789012345678901234567890abcdef123456789012345678901234'
             ELSE '6K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P'
        END
    ),
    (
        wallet_addr,
        'QmZ0g9D1p4M0oE7vH5yJ8xA3lT9rN9qS4cF0hI6jL8mO1',
        'video',
        20971520,
        'active',
        0.92,
        35000,
        CASE WHEN chain_type_param = 'ethereum' 
             THEN '0xghi789jkl012345678901234567890abcdef123456789012345678901234567'
             ELSE '7L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q'
        END
    ),
    (
        wallet_addr,
        'QmA1h2I3j4K5l6M7n8O9p0Q1r2S3t4U5v6W7x8Y9z0A1b',
        'document',
        1048576,
        'dead',
        0.30,
        15000,
        CASE WHEN chain_type_param = 'ethereum' 
             THEN '0xjkl012mno345678901234567890abcdef123456789012345678901234567890'
             ELSE '8M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R'
        END
    ),
    (
        wallet_addr,
        'QmB2i3J4k5L6m7N8o9P0q1R2s3T4u5V6w7X8y9Z0b1C2d',
        'image',
        3145728,
        'archived',
        0.75,
        28000,
        CASE WHEN chain_type_param = 'ethereum' 
             THEN '0xmno345pqr678901234567890abcdef123456789012345678901234567890abc'
             ELSE '9N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S'
        END
    );

    GET DIAGNOSTICS sample_records_created = ROW_COUNT;

    -- Create sample activity logs
    INSERT INTO activity_logs (
        user_wallet,
        action,
        description
    ) VALUES 
    (wallet_addr, 'create', 'Created new document record - Project whitepaper.pdf'),
    (wallet_addr, 'archive', 'Archived image data to cold storage - banner.jpg'),
    (wallet_addr, 'create', 'Created new video record - demo_presentation.mp4'),
    (wallet_addr, 'forget', 'Permanently deleted old backup file - temp_backup.zip'),
    (wallet_addr, 'archive', 'Archived user profile picture - avatar.png'),
    (wallet_addr, 'promote', 'Restored important document from archive - contract.pdf');

    GET DIAGNOSTICS sample_logs_created = ROW_COUNT;

    -- Re-enable RLS
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE data_records ENABLE ROW LEVEL SECURITY;
    ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

    RETURN format('Sample data created successfully! Records: %s, Activity Logs: %s', 
                  sample_records_created, sample_logs_created);
END;
$$ LANGUAGE plpgsql;

-- Instructions for usage:
-- To create sample data for a wallet address, run:
-- SELECT create_sample_data_for_wallet('YOUR_WALLET_ADDRESS_HERE', 'ethereum');
-- or
-- SELECT create_sample_data_for_wallet('YOUR_WALLET_ADDRESS_HERE', 'solana');
