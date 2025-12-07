import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export const DiagnosticPanel = () => {
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { publicKey, connected: solanaConnected } = useWallet();
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const walletAddress = ethConnected && ethAddress ? ethAddress : 
                       solanaConnected && publicKey ? publicKey.toString() : null;

  const runDiagnostics = async () => {
    setLoading(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      walletConnected: false,
      walletAddress: null,
      supabaseConnection: false,
      tablesExist: false,
      functionsExist: false,
      dataExists: false,
      errors: []
    };

    try {
      // Check wallet connection
      results.walletConnected = !!(ethConnected || solanaConnected);
      results.walletAddress = walletAddress;

      if (walletAddress) {
        // Test Supabase connection
        try {
          const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
          results.supabaseConnection = !error;
          results.tablesExist = !error;
          if (error) results.errors.push(`Table access error: ${error.message}`);
        } catch (err: any) {
          results.supabaseConnection = false;
          results.errors.push(`Supabase connection error: ${err.message}`);
        }

        // Test RPC function
        try {
          const { data, error } = await supabase.rpc('get_user_stats', { wallet_addr: walletAddress });
          results.functionsExist = !error;
          if (error) results.errors.push(`RPC function error: ${error.message}`);
          if (data) console.log('RPC Response:', data);
        } catch (err: any) {
          results.functionsExist = false;
          results.errors.push(`RPC function error: ${err.message}`);
        }

        // Check for existing data
        try {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('wallet_address', walletAddress)
            .single();
          
          const { data: recordsData } = await supabase
            .from('data_records')
            .select('count')
            .eq('user_wallet', walletAddress);

          results.dataExists = !!(profileData || (recordsData && recordsData.length > 0));
        } catch (err: any) {
          results.errors.push(`Data check error: ${err.message}`);
        }
      }

    } catch (err: any) {
      results.errors.push(`General error: ${err.message}`);
    }

    setDiagnostics(results);
    setLoading(false);
  };

  useEffect(() => {
    if (walletAddress) {
      runDiagnostics();
    }
  }, [walletAddress]);

  const StatusIcon = ({ status }: { status: boolean }) => 
    status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;

  return (
    <Card className="bg-card-glass backdrop-blur-md border-glass-border mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          System Diagnostics
        </CardTitle>
        <CardDescription>
          Debug information for troubleshooting the blank screen issue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button onClick={runDiagnostics} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Run Diagnostics
          </Button>
          {diagnostics.timestamp && (
            <span className="text-xs text-muted-foreground">
              Last run: {new Date(diagnostics.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>

        {diagnostics.timestamp && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Wallet Connected</span>
                <StatusIcon status={diagnostics.walletConnected} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Supabase Connection</span>
                <StatusIcon status={diagnostics.supabaseConnection} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Tables</span>
                <StatusIcon status={diagnostics.tablesExist} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">RPC Functions</span>
                <StatusIcon status={diagnostics.functionsExist} />
              </div>
            </div>

            {diagnostics.walletAddress && (
              <div className="p-3 bg-muted/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Wallet Address:</p>
                <code className="text-xs font-mono break-all">{diagnostics.walletAddress}</code>
              </div>
            )}

            {diagnostics.errors.length > 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-semibold text-destructive mb-2">Errors Found:</p>
                <ul className="space-y-1">
                  {diagnostics.errors.map((error: string, index: number) => (
                    <li key={index} className="text-xs text-destructive">• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {diagnostics.dataExists === false && diagnostics.walletConnected && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600">
                  No data found for your wallet. Create sample data to populate the dashboard.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
