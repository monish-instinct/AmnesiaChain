# AmnesiaChain Setup Guide

## 🚀 Quick Setup Steps

### 1. Get Your Supabase API Key

1. Go to [supabase.com](https://supabase.com) and sign in
2. Navigate to your project: `chhbooncjwppnrfcjmla`
3. Go to **Settings** → **API**
4. Copy the **"anon" public key**

### 2. Update Environment Configuration

Open your `.env` file and replace `your-supabase-anon-key-here` with your actual Supabase anon key:

```bash
# AmnesiaChain Environment Configuration

# Supabase Configuration
VITE_SUPABASE_URL=https://chhbooncjwppnrfcjmla.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Your actual key here

# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=75d1d118b26ea19c6147e33b01607cc1

# Optional: API Configuration
VITE_API_URL=http://localhost:3001
```

### 3. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `setup-database.sql`
3. Paste and run the SQL script
4. This will create all necessary tables, indexes, and sample data

### 4. Test the Application

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080) to see your app!

## 🔧 Configuration Details

### Project IDs Set Up:
✅ **Supabase Project ID**: `chhbooncjwppnrfcjmla`
✅ **WalletConnect Project ID**: `75d1d118b26ea19c6147e33b01607cc1`

### Database Tables Created:
- `user_profiles` - User wallet information and preferences
- `data_records` - Data storage records with lifecycle status
- `transactions` - Blockchain transaction tracking
- `activity_logs` - User action history

### Features Ready:
- ✅ Ethereum wallet support (MetaMask, WalletConnect)
- ✅ Solana wallet support (Phantom)
- ✅ Real-time database subscriptions
- ✅ Data lifecycle management
- ✅ Dashboard with analytics
- ✅ Row-level security for data privacy

## 🎯 Next Steps

1. **Get Supabase API Key** (the only missing piece!)
2. **Test wallet connections** with MetaMask and Phantom
3. **Create data records** through the dashboard
4. **Watch real-time updates** as data moves through lifecycle stages

## 🐛 Troubleshooting

**If you see "Supabase not configured" warnings:**
- Check that your API key is correctly set in `.env`
- Make sure the database tables are created
- Restart the dev server after changing `.env`

**If wallet connections fail:**
- Ensure you have MetaMask or Phantom installed
- Check browser console for specific error messages
- Verify WalletConnect project ID is correct

## 📚 Database Schema

The database includes these main entities:

```sql
user_profiles (wallet_address, chain_type, stats...)
data_records (id, user_wallet, data_hash, status, size...)
transactions (id, user_wallet, transaction_type, hash...)
activity_logs (id, user_wallet, action, description...)
```

All tables have Row Level Security (RLS) enabled for data privacy.
