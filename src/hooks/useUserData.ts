import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  getUserProfile, 
  createOrUpdateUserProfile, 
  getDataRecords, 
  getActivityLogs,
  getUserStats,
  DataRecord,
  ActivityLog,
  UserProfile
} from '@/lib/database';
import { supabase } from '@/lib/supabase';

export interface UserStats {
  activeData: number;
  archivedData: number;
  deadData: number;
  totalStorageSaved: number;
  averageRelevance: number;
  totalGasUsed: number;
  costReduction: number;
}

export const useUserData = () => {
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { publicKey, connected: solanaConnected } = useWallet();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dataRecords, setDataRecords] = useState<DataRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    activeData: 0,
    archivedData: 0,
    deadData: 0,
    totalStorageSaved: 0,
    averageRelevance: 0,
    totalGasUsed: 0,
    costReduction: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current wallet address
  const walletAddress = ethConnected && ethAddress ? (ethAddress as string) : 
                       solanaConnected && publicKey ? publicKey.toString() : null;

  const chainType = ethConnected ? 'ethereum' : solanaConnected ? 'solana' : null;

  // Initialize user profile
  const initializeUserProfile = async (wallet: string, chain: 'ethereum' | 'solana') => {
    try {
      let profile = await getUserProfile(wallet);
      
      if (!profile) {
        // Create new profile
        profile = await createOrUpdateUserProfile({
          wallet_address: wallet,
          chain_type: chain,
          total_data_active: 0,
          total_data_archived: 0,
          total_data_forgotten: 0,
          storage_saved_gb: 0,
          cost_reduction_percentage: 0,
          preferences: {
            theme: 'dark',
            notifications: true,
            autoArchive: false
          }
        });
      }
      
      setUserProfile(profile);
    } catch (err) {
      console.error('Error initializing user profile:', err);
      setError('Failed to initialize user profile');
    }
  };

  // Load user data
  const loadUserData = async (wallet: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading data for wallet:', wallet);

      // Load all data in parallel
      const [records, activities, stats] = await Promise.all([
        getDataRecords(wallet),
        getActivityLogs(wallet, 20),
        getUserStats(wallet)
      ]);

      console.log('✅ Data loaded:', { records, activities, stats });

      // Ensure data is in expected format
      setDataRecords(Array.isArray(records) ? records : []);
      setActivityLogs(Array.isArray(activities) ? activities : []);
      setUserStats(stats && typeof stats === 'object' ? stats : {
        activeData: 0,
        archivedData: 0,
        deadData: 0,
        totalStorageSaved: 0,
        averageRelevance: 0,
        totalGasUsed: 0,
        costReduction: 0
      });

    } catch (err) {
      console.error('❌ Error loading user data:', err);
      setError(`Failed to load user data: ${err instanceof Error ? err.message : String(err)}`);
      
      // Set safe defaults on error
      setDataRecords([]);
      setActivityLogs([]);
      setUserStats({
        activeData: 0,
        archivedData: 0,
        deadData: 0,
        totalStorageSaved: 0,
        averageRelevance: 0,
        totalGasUsed: 0,
        costReduction: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    if (walletAddress) {
      await loadUserData(walletAddress);
    }
  };

  // Get filtered data records
  const getFilteredRecords = (status: 'active' | 'archived' | 'dead') => {
    return dataRecords.filter(record => record.status === status);
  };

  // Initialize when wallet connects
  useEffect(() => {
    if (walletAddress && chainType) {
      initializeUserProfile(walletAddress, chainType);
      loadUserData(walletAddress);
    } else {
      setUserProfile(null);
      setDataRecords([]);
      setActivityLogs([]);
      setLoading(false);
    }
  }, [walletAddress, chainType]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!walletAddress) return;

    // Subscribe to data record changes
    const dataSubscription = supabase
      .channel('data_records_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'data_records',
          filter: `user_wallet=eq.${walletAddress}`
        },
        () => {
          refreshData();
        }
      )
      .subscribe();

    // Subscribe to activity log changes
    const activitySubscription = supabase
      .channel('activity_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_wallet=eq.${walletAddress}`
        },
        () => {
          refreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dataSubscription);
      supabase.removeChannel(activitySubscription);
    };
  }, [walletAddress]);

  return {
    walletAddress,
    chainType,
    userProfile,
    dataRecords,
    activityLogs,
    userStats,
    loading,
    error,
    refreshData,
    getFilteredRecords
  };
};