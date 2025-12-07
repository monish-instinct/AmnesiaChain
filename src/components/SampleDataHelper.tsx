import { useEffect, useState } from 'react';
import { useUserData } from '@/hooks/useUserData';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface SampleDataHelperProps {
  onDataCreated?: () => void;
}

export const SampleDataHelper = ({ onDataCreated }: SampleDataHelperProps) => {
  const { walletAddress, chainType, dataRecords, userStats, loading } = useUserData();
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasData = dataRecords.length > 0 || userStats.activeData > 0;

  const createSampleData = async () => {
    if (!walletAddress || !chainType) return;

    setCreating(true);
    setError(null);

    try {
      // Call the Supabase function to create sample data
      const { data, error: functionError } = await supabase
        .rpc('create_quick_sample', {
          wallet_addr: walletAddress,
          chain_type: chainType
        });

      if (functionError) {
        throw functionError;
      }

      console.log('Sample data created:', data);
      setCreated(true);
      
      // Wait a moment then trigger refresh
      setTimeout(() => {
        onDataCreated?.();
      }, 1000);

    } catch (err: any) {
      console.error('Error creating sample data:', err);
      setError(err.message || 'Failed to create sample data');
    } finally {
      setCreating(false);
    }
  };

  // Don't show if wallet not connected or data already exists
  if (!walletAddress || loading || hasData) {
    return null;
  }

  return (
    <Card className="bg-card-glass backdrop-blur-md border-glass-border">
      <CardHeader>
        <CardTitle className="text-foreground font-inter flex items-center gap-2">
          <Database className="h-5 w-5 text-neon-blue" />
          Setup Required
        </CardTitle>
        <CardDescription className="text-muted-foreground font-inter">
          No data found for your wallet. Create sample data to explore the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted/10 rounded-lg">
          <p className="text-sm font-mono text-muted-foreground mb-2">
            Connected Wallet:
          </p>
          <code className="block p-2 bg-black/20 rounded text-xs text-neon-cyan font-mono break-all">
            {walletAddress}
          </code>
          <p className="text-xs text-muted-foreground mt-1">
            Chain: {chainType}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {created ? (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <p className="text-sm text-green-500">
              Sample data created successfully! Refreshing dashboard...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Click below to create sample data including:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• 3 Active data records</li>
              <li>• 2 Archived data records</li>
              <li>• 1 Dead data record</li>
              <li>• Recent activity logs</li>
              <li>• User profile with stats</li>
            </ul>
            
            <Button 
              onClick={createSampleData}
              disabled={creating}
              className="w-full bg-neon-blue hover:bg-neon-blue/80"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Sample Data...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Create Sample Data
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
