import { supabase, DataRecord, UserProfile, Transaction, ActivityLog } from './supabase';

// Export types for use in other modules
export type { DataRecord, UserProfile, Transaction, ActivityLog } from './supabase';

// User Profile Management
export const getUserProfile = async (walletAddress: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase not configured, using mock data');
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Supabase not configured, using mock data');
    return null;
  }
};

export const createOrUpdateUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profile, { onConflict: 'wallet_address' })
    .select()
    .single();

  if (error) {
    console.error('Error creating/updating user profile:', error);
    return null;
  }

  return data;
};

// Data Records Management
export const getDataRecords = async (
  walletAddress: string,
  status?: 'active' | 'archived' | 'dead'
): Promise<DataRecord[]> => {
  let query = supabase
    .from('data_records')
    .select('*')
    .eq('user_wallet', walletAddress)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching data records:', error);
    return [];
  }

  return data || [];
};

export const createDataRecord = async (record: Omit<DataRecord, 'id' | 'created_at' | 'updated_at'>): Promise<DataRecord | null> => {
  const { data, error } = await supabase
    .from('data_records')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('Error creating data record:', error);
    return null;
  }

  return data;
};

export const updateDataRecord = async (id: string, updates: Partial<DataRecord>): Promise<DataRecord | null> => {
  const { data, error } = await supabase
    .from('data_records')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating data record:', error);
    return null;
  }

  return data;
};

export const deleteDataRecord = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('data_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting data record:', error);
    return false;
  }

  return true;
};

// Transaction Management
export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return null;
  }

  return data;
};

export const getTransactions = async (walletAddress: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_wallet', walletAddress)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data || [];
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    return null;
  }

  return data;
};

// Activity Log Management
export const createActivityLog = async (activity: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog | null> => {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert(activity)
    .select()
    .single();

  if (error) {
    console.error('Error creating activity log:', error);
    return null;
  }

  return data;
};

export const getActivityLogs = async (walletAddress: string, limit: number = 50): Promise<ActivityLog[]> => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_wallet', walletAddress)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }

  return data || [];
};

// Statistics
export const getUserStats = async (walletAddress: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_stats', { wallet_addr: walletAddress });

    if (error) {
      console.error('Error fetching user stats:', error);
      return {
        activeData: 0,
        archivedData: 0,
        deadData: 0,
        totalStorageSaved: 0,
        averageRelevance: 0,
        totalGasUsed: 0,
        costReduction: 0
      };
    }

    // Handle different response formats from Supabase RPC
    if (Array.isArray(data) && data.length > 0) {
      return data[0]; // RPC functions return arrays
    } else if (data && typeof data === 'object') {
      return data;
    }

    // Fallback if no data
    return {
      activeData: 0,
      archivedData: 0,
      deadData: 0,
      totalStorageSaved: 0,
      averageRelevance: 0,
      totalGasUsed: 0,
      costReduction: 0
    };
  } catch (err) {
    console.error('Exception in getUserStats:', err);
    return {
      activeData: 0,
      archivedData: 0,
      deadData: 0,
      totalStorageSaved: 0,
      averageRelevance: 0,
      totalGasUsed: 0,
      costReduction: 0
    };
  }
};
