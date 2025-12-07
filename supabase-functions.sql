-- Create the get_user_stats function that's called by the frontend
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

-- Create sample data population script with instructions
-- You can run this in your Supabase SQL editor after connecting a wallet
CREATE OR REPLACE FUNCTION populate_sample_data_for_connected_wallet()
RETURNS TEXT AS $$
BEGIN
  RETURN 'To populate sample data, connect your wallet in the app first, then run: SELECT create_sample_data_for_wallet(''YOUR_WALLET_ADDRESS'', ''ethereum''); in the SQL editor';
END;
$$ LANGUAGE plpgsql;
