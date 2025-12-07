import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Blocks, Activity, Shield, Zap, ExternalLink, Clock } from 'lucide-react';
import { useBlockchainContract } from '@/hooks/useBlockchainContract';
import { formatTimeAgo } from '@/lib/memoryLifecycle';

export function BlockchainExplorer() {
  const { transactions, blockchainState, isConnected } = useBlockchainContract();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
      case 'pending': return 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
      case 'failed': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CREATE': return 'text-neon-green';
      case 'ARCHIVE': return 'text-neon-blue';
      case 'PROMOTE': return 'text-neon-cyan';
      case 'FORGET': return 'text-neon-purple';
      case 'TRANSFER': return 'text-neon-pink';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Blockchain Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-card-glass backdrop-blur-md border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Block Height</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    #{blockchainState.blockHeight}
                  </p>
                </div>
                <Blocks className="h-8 w-8 text-neon-blue" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-card-glass backdrop-blur-md border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Validators</p>
                  <p className="text-2xl font-bold text-foreground">
                    {blockchainState.activeValidators}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-neon-green" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-card-glass backdrop-blur-md border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chain Integrity</p>
                  <p className="text-2xl font-bold text-neon-green">
                    {blockchainState.chainIntegrity ? '100%' : '99.9%'}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-neon-cyan" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-card-glass backdrop-blur-md border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Memory</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {(blockchainState.totalMemoryWeight / 1000).toFixed(1)}K
                  </p>
                </div>
                <Zap className="h-8 w-8 text-neon-purple" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-card-glass backdrop-blur-md border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-inter">
              <Activity className="h-5 w-5 text-neon-cyan" />
              Recent Blockchain Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="text-center py-8 text-muted-foreground">
                Connect your wallet to view transactions
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet. Perform an action to create your first transaction.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="p-4 rounded-lg border border-glass-border hover:border-neon-cyan/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(tx.status)}>
                            {tx.status.toUpperCase()}
                          </Badge>
                          <span className={`text-sm font-semibold ${getTypeColor(tx.type)}`}>
                            {tx.type}
                          </span>
                          {tx.blockNumber && (
                            <span className="text-xs text-muted-foreground font-mono">
                              Block #{tx.blockNumber}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">TX Hash:</span>
                            <code className="text-xs font-mono text-neon-cyan">
                              {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                            </code>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">From:</span>
                            <code className="text-xs font-mono">
                              {tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)}
                            </code>
                          </div>
                          
                          {tx.gasUsed && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Gas Used:</span>
                              <span className="text-xs font-mono text-neon-green">
                                {tx.gasUsed.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(tx.timestamp.toISOString())}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Smart Contract Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border-neon-blue/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-inter text-sm">
              <Shield className="h-4 w-4 text-neon-blue" />
              Smart Contract Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">AmnesiaChain Contract:</p>
                <code className="text-xs font-mono text-neon-cyan">
                  0x1234...7890
                </code>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Memory Token:</p>
                <code className="text-xs font-mono text-neon-cyan">
                  0xAbCd...Ef12
                </code>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Cognitive Consensus:</p>
                <code className="text-xs font-mono text-neon-cyan">
                  0x9876...3210
                </code>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Memory Block:</p>
                <code className="text-xs font-mono text-neon-cyan">
                  0x742d...bEb0
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
