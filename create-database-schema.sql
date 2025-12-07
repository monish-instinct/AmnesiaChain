-- Complete AmnesiaChain Database Schema Setup
-- Run this in your Supabase SQL Editor to create all tables with proper constraints

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    wallet_address TEXT PRIMARY KEY,
    chain_type TEXT NOT NULL CHECK (chain_type IN ('ethereum', 'solana')),
    total_data_active INTEGER DEFAULT 0,
    total_data_archived INTEGER DEFAULT 0,
    total_data_forgotten INTEGER DEFAULT 0,
    storage_saved_gb NUMERIC DEFAULT 0,
    cost_reduction_percentage NUMERIC DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create data_records table
CREATE TABLE IF NOT EXISTS data_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_wallet TEXT NOT NULL,
    data_hash TEXT NOT NULL,
    data_type TEXT NOT NULL CHECK (data_type IN ('document', 'image', 'video', 'audio', 'other')),
    size_bytes BIGINT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'archived', 'dead')),
    relevance_score NUMERIC NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 1),
    gas_used BIGINT DEFAULT 0,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    transaction_hash TEXT,
    compression_ratio NUMERIC,
    original_size BIGINT,
    deletion_reason TEXT,
    consensus_votes INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    
    -- Add unique constraint on user_wallet + data_hash combination
    UNIQUE(user_wallet, data_hash)
);

-- 3. Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_wallet TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('archive', 'promote', 'forget', 'create')),
    data_id UUID,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 4. Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_wallet TEXT NOT NULL,
    data_id UUID,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('archive', 'promote', 'forget')),
    transaction_hash TEXT NOT NULL,
    gas_used BIGINT DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')),
    block_number BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 5. Add foreign key constraints
ALTER TABLE data_records 
    ADD CONSTRAINT fk_data_records_user 
    FOREIGN KEY (user_wallet) REFERENCES user_profiles(wallet_address) ON DELETE CASCADE;

ALTER TABLE activity_logs 
    ADD CONSTRAINT fk_activity_logs_user 
    FOREIGN KEY (user_wallet) REFERENCES user_profiles(wallet_address) ON DELETE CASCADE;

ALTER TABLE activity_logs 
    ADD CONSTRAINT fk_activity_logs_data 
    FOREIGN KEY (data_id) REFERENCES data_records(id) ON DELETE SET NULL;

ALTER TABLE transactions 
    ADD CONSTRAINT fk_transactions_user 
    FOREIGN KEY (user_wallet) REFERENCES user_profiles(wallet_address) ON DELETE CASCADE;

ALTER TABLE transactions 
    ADD CONSTRAINT fk_transactions_data 
    FOREIGN KEY (data_id) REFERENCES data_records(id) ON DELETE CASCADE;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_data_records_user_wallet ON data_records(user_wallet);
CREATE INDEX IF NOT EXISTS idx_data_records_status ON data_records(status);
CREATE INDEX IF NOT EXISTS idx_data_records_created_at ON data_records(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_wallet ON activity_logs(user_wallet);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_wallet ON transactions(user_wallet);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies (basic - allows all operations for now)
CREATE POLICY "Allow all operations on user_profiles" ON user_profiles
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on data_records" ON data_records
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on activity_logs" ON activity_logs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on transactions" ON transactions
    FOR ALL USING (true) WITH CHECK (true);

-- 9. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_records_updated_at
    BEFORE UPDATE ON data_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database schema created successfully! You can now run the sample data creation function.' as status;
