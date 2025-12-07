import { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';

export const useWalletAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainType, setChainType] = useState<'ethereum' | 'solana' | null>(null);

  // Ethereum wallet
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { disconnect: ethDisconnect } = useDisconnect();
  
  // Solana wallet
  const { publicKey: solanaPublicKey, connected: solanaConnected, disconnect: solanaDisconnect } = useWallet();

  useEffect(() => {
    let mounted = true;

    const registerWallet = async (address: string, chain: 'ethereum' | 'solana') => {
      if (!mounted) return;

      try {
        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', address)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
        }

        if (!existingProfile && mounted) {
          // Create new profile with wallet address
          const profileId = crypto.randomUUID();
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: profileId,
              wallet_address: address,
              display_name: `${chain === 'ethereum' ? 'ETH' : 'SOL'} User ${address.slice(0, 6)}`,
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            // Continue anyway - profile might exist from another session
          }
        }

        if (mounted) {
          setWalletAddress(address);
          setChainType(chain);
          setIsAuthenticated(true);
          localStorage.setItem('wallet_auth', JSON.stringify({ address, chain }));
          setLoading(false);
        }
      } catch (error) {
        console.error('Error registering wallet:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    };

    // Check localStorage first for existing auth
    const storedAuth = localStorage.getItem('wallet_auth');
    if (storedAuth) {
      try {
        const { address, chain } = JSON.parse(storedAuth);
        if (mounted) {
          setWalletAddress(address);
          setChainType(chain);
          setIsAuthenticated(true);
          setLoading(false);
        }
        return;
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('wallet_auth');
      }
    }

    // Handle Ethereum wallet
    if (ethConnected && ethAddress) {
      registerWallet(ethAddress, 'ethereum');
    }
    // Handle Solana wallet
    else if (solanaConnected && solanaPublicKey) {
      registerWallet(solanaPublicKey.toString(), 'solana');
    }
    // No wallet connected and no stored auth
    else if (mounted) {
      setIsAuthenticated(false);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [ethConnected, ethAddress, solanaConnected, solanaPublicKey]);

  const logout = () => {
    // Disconnect wallets
    if (ethConnected) ethDisconnect();
    if (solanaConnected) solanaDisconnect();
    
    // Clear state
    setIsAuthenticated(false);
    setWalletAddress(null);
    setChainType(null);
    localStorage.removeItem('wallet_auth');
  };

  return {
    isAuthenticated,
    loading,
    walletAddress,
    chainType,
    logout,
  };
};
