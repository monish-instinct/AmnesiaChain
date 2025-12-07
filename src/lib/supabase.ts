import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with environment variables and fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface DataRecord {
  id: string;
  user_wallet: string;
  data_hash: string;
  data_type: 'document' | 'image' | 'video' | 'audio' | 'other';
  size_bytes: number;
  status: 'active' | 'archived' | 'dead';
  relevance_score: number;
  gas_used: number;
  last_accessed: string;
  created_at: string;
  updated_at: string;
  transaction_hash?: string;
  compression_ratio?: number;
  original_size?: number;
  deletion_reason?: string;
  consensus_votes?: number;
  metadata?: any;
}

export interface UserProfile {
  wallet_address: string;
  chain_type: 'ethereum' | 'solana';
  total_data_active: number;
  total_data_archived: number;
  total_data_forgotten: number;
  storage_saved_gb: number;
  cost_reduction_percentage: number;
  created_at: string;
  updated_at: string;
  preferences?: any;
}

export interface Transaction {
  id: string;
  user_wallet: string;
  data_id: string;
  transaction_type: 'archive' | 'promote' | 'forget';
  transaction_hash: string;
  gas_used: number;
  status: 'pending' | 'confirmed' | 'failed';
  block_number?: number;
  created_at: string;
  metadata?: any;
}

export interface ActivityLog {
  id: string;
  user_wallet: string;
  action: 'archive' | 'promote' | 'forget' | 'create';
  data_id?: string;
  description: string;
  created_at: string;
  metadata?: any;
}