-- AmnesiaChain Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    wallet_address TEXT PRIMARY KEY,
    chain_type TEXT NOT NULL CHECK (chain_type IN ('ethereum', 'solana')),
    total_data_active INTEGER DEFAULT 0,
    total_data_archived INTEGER DEFAULT 0,
    total_data_forgotten INTEGER DEFAULT 0,
    storage_saved_gb DECIMAL(10,2) DEFAULT 0,
    cost_reduction_percentage DECIMAL(5,2) DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Records Table
CREATE TABLE IF NOT EXISTS data_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_wallet TEXT NOT NULL REFERENCES user_profiles(wallet_address) ON DELETE CASCADE,
    data_hash TEXT NOT NULL,
    data_type TEXT CHECK (data_type IN ('document', 'image', 'video', 'audio', 'other')) DEFAULT 'other',
    size_bytes BIGINT NOT NULL,
    status TEXT CHECK (status IN ('active', 'archived', 'dead')) DEFAULT 'active',
    relevance_score DECIMAL(3,2) DEFAULT 0.5,
    gas_used INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    transaction_hash TEXT,
    compression_ratio DECIMAL(5,2),
    original_size BIGINT,
    deletion_reason TEXT,
    consensus_votes INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_wallet TEXT NOT NULL REFERENCES user_profiles(wallet_address) ON DELETE CASCADE,
    data_id UUID REFERENCES data_records(id) ON DELETE SET NULL,
    transaction_type TEXT CHECK (transaction_type IN ('archive', 'promote', 'forget')) NOT NULL,
    transaction_hash TEXT NOT NULL UNIQUE,
    gas_used INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
    block_number BIGINT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_wallet TEXT NOT NULL REFERENCES user_profiles(wallet_address) ON DELETE CASCADE,
    action TEXT CHECK (action IN ('archive', 'promote', 'forget', 'create')) NOT NULL,
    data_id UUID REFERENCES data_records(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_data_records_user_wallet ON data_records(user_wallet);
CREATE INDEX IF NOT EXISTS idx_data_records_status ON data_records(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_wallet ON transactions(user_wallet);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_wallet ON activity_logs(user_wallet);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(wallet_addr TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'activeData', COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0),
        'archivedData', COALESCE(SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END), 0),
        'deadData', COALESCE(SUM(CASE WHEN status = 'dead' THEN 1 ELSE 0 END), 0),
        'totalStorageSaved', COALESCE(SUM(CASE WHEN status = 'archived' THEN size_bytes ELSE 0 END) / 1073741824.0, 0),
        'averageRelevance', COALESCE(AVG(relevance_score), 0),
        'totalGasUsed', COALESCE(SUM(gas_used), 0),
        'costReduction', COALESCE(
            CASE WHEN SUM(size_bytes) > 0 THEN
                (SUM(CASE WHEN status = 'archived' THEN size_bytes ELSE 0 END) / SUM(size_bytes)::DECIMAL * 100)
            ELSE 0 END, 0
        )
    ) INTO result
    FROM data_records 
    WHERE user_wallet = wallet_addr;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow users to see only their own data)
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (wallet_address = current_setting('app.current_user_wallet', true));

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR ALL USING (wallet_address = current_setting('app.current_user_wallet', true));

CREATE POLICY "Users can view own data records" ON data_records
    FOR SELECT USING (user_wallet = current_setting('app.current_user_wallet', true));

CREATE POLICY "Users can manage own data records" ON data_records
    FOR ALL USING (user_wallet = current_setting('app.current_user_wallet', true));

CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (user_wallet = current_setting('app.current_user_wallet', true));

CREATE POLICY "Users can manage own transactions" ON transactions
    FOR ALL USING (user_wallet = current_setting('app.current_user_wallet', true));

CREATE POLICY "Users can view own activity logs" ON activity_logs
    FOR SELECT USING (user_wallet = current_setting('app.current_user_wallet', true));

CREATE POLICY "Users can manage own activity logs" ON activity_logs
    FOR ALL USING (user_wallet = current_setting('app.current_user_wallet', true));

-- Create some sample data for testing (optional)
INSERT INTO user_profiles (wallet_address, chain_type, total_data_active, total_data_archived, total_data_forgotten, storage_saved_gb, cost_reduction_percentage) 
VALUES 
    ('0x1234567890123456789012345678901234567890', 'ethereum', 15, 8, 3, 2.5, 15.8),
    ('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'solana', 12, 6, 2, 1.8, 12.3)
ON CONFLICT (wallet_address) DO NOTHING;

-- Create sample data records
INSERT INTO data_records (user_wallet, data_hash, data_type, size_bytes, status, relevance_score, gas_used, transaction_hash)
VALUES 
    ('0x1234567890123456789012345678901234567890', 'hash123...', 'document', 1048576, 'active', 0.85, 21000, '0xabc123...'),
    ('0x1234567890123456789012345678901234567890', 'hash456...', 'image', 2097152, 'archived', 0.60, 25000, '0xdef456...'),
    ('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'hash789...', 'video', 10485760, 'active', 0.90, 35000, 'sig789...')
ON CONFLICT (id) DO NOTHING;

-- Create sample activity logs
INSERT INTO activity_logs (user_wallet, action, description)
VALUES 
    ('0x1234567890123456789012345678901234567890', 'create', 'Created new document record'),
    ('0x1234567890123456789012345678901234567890', 'archive', 'Archived image data to cold storage'),
    ('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'create', 'Created new video record')
ON CONFLICT (id) DO NOTHING;
