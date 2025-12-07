// Test Supabase connection and create sample data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chhbooncjwppnrfcjmla.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaGJvb25jandwcG5yZmNqbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTc2MDksImV4cCI6MjA3Mzc5MzYwOX0.Y6kEJUYbrZVsfVEH11nHbKTxUNbRl9DjPzabBKr_B3c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  // Test basic connection
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);
      
    if (error) {
      console.error('❌ Supabase error:', error);
    } else {
      console.log('✅ Connection successful!');
      console.log('📊 Sample user profiles:', data);
    }
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
}

async function createSampleDataForWallet(walletAddress, chainType) {
  console.log(`🔧 Creating sample data for wallet: ${walletAddress}`);
  
  try {
    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        wallet_address: walletAddress,
        chain_type: chainType,
        total_data_active: 5,
        total_data_archived: 3,
        total_data_forgotten: 1,
        storage_saved_gb: 1.2,
        cost_reduction_percentage: 15.5,
        preferences: {
          theme: 'dark',
          notifications: true,
          autoArchive: false
        }
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return;
    }
    
    console.log('✅ Profile created:', profile);

    // Create sample data records
    const dataRecords = [
      {
        user_wallet: walletAddress,
        data_hash: 'QmX4e7B9n2K8mC5tF3wH6vY1jR9sL7pQ2aD8fG4hJ6kM9',
        data_type: 'document',
        size_bytes: 2097152, // 2MB
        status: 'active',
        relevance_score: 0.85,
        gas_used: 21000,
        transaction_hash: chainType === 'ethereum' ? '0xabc123def456...' : '5J7K8L9M0N1P2Q3R4S5T6U7V8W9X0Y1Z...'
      },
      {
        user_wallet: walletAddress,
        data_hash: 'QmY9f8C0o3L9nD6uG4xI7wZ2kS8qM8pR3bE9gH5iK7lN0',
        data_type: 'image',
        size_bytes: 5242880, // 5MB
        status: 'archived',
        relevance_score: 0.60,
        gas_used: 25000,
        transaction_hash: chainType === 'ethereum' ? '0xdef456ghi789...' : '6K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z...'
      },
      {
        user_wallet: walletAddress,
        data_hash: 'QmZ0g9D1p4M0oE7vH5yJ8xA3lT9rN9qS4cF0hI6jL8mO1',
        data_type: 'video',
        size_bytes: 20971520, // 20MB
        status: 'active',
        relevance_score: 0.92,
        gas_used: 35000,
        transaction_hash: chainType === 'ethereum' ? '0xghi789jkl012...' : '7L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A...'
      }
    ];

    const { data: records, error: recordsError } = await supabase
      .from('data_records')
      .insert(dataRecords)
      .select();

    if (recordsError) {
      console.error('❌ Records error:', recordsError);
      return;
    }

    console.log('✅ Data records created:', records.length);

    // Create activity logs
    const activities = [
      {
        user_wallet: walletAddress,
        action: 'create',
        description: 'Created new document record - Project whitepaper.pdf'
      },
      {
        user_wallet: walletAddress,
        action: 'archive',
        description: 'Archived image data to cold storage - banner.jpg'
      },
      {
        user_wallet: walletAddress,
        action: 'create',
        description: 'Created new video record - demo_presentation.mp4'
      }
    ];

    const { data: logs, error: logsError } = await supabase
      .from('activity_logs')
      .insert(activities)
      .select();

    if (logsError) {
      console.error('❌ Activity logs error:', logsError);
      return;
    }

    console.log('✅ Activity logs created:', logs.length);
    console.log('🎉 Sample data setup complete!');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

// Test connection first
testConnection();

// Instructions for user
console.log('\n📝 To create sample data for your wallet:');
console.log('1. Connect your wallet in the app');
console.log('2. Copy your wallet address');
console.log('3. Run: createSampleDataForWallet("YOUR_WALLET_ADDRESS", "ethereum")');
console.log('4. Or for Solana: createSampleDataForWallet("YOUR_WALLET_ADDRESS", "solana")');
console.log('\n🔧 Making these functions available globally...');

// Make functions available globally for easy use
global.createSampleDataForWallet = createSampleDataForWallet;
global.testConnection = testConnection;
