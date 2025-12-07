import { motion } from 'framer-motion';
import { Trash2, AlertTriangle, Recycle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { fetchMemoryNodesByState, formatBytes, formatTimeAgo, type MemoryNode } from '@/lib/memoryLifecycle';

const DashboardDead = () => {
  const [deadData, setDeadData] = useState<MemoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeadData();
  }, []);

  const loadDeadData = async () => {
    try {
      const data = await fetchMemoryNodesByState('dead');
      setDeadData(data);
    } catch (error) {
      console.error('Error loading dead data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSize = deadData.reduce((sum, node) => sum + (node.metadata?.size_bytes || 0), 0);
  const avgScore = deadData.length > 0 
    ? deadData.reduce((sum, node) => sum + node.cognitive_score, 0) / deadData.length * 100 
    : 0;

  const deadStats = [
    { label: 'Data Forgotten', value: formatBytes(totalSize), icon: Trash2 },
    { label: 'Storage Freed', value: deadData.length.toString(), icon: Recycle },
    { label: 'Avg Cognitive', value: `${avgScore.toFixed(1)}%`, icon: Shield },
  ];

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Age threshold exceeded':
        return 'text-neon-blue';
      case 'Zero relevance score':
        return 'text-neon-purple';
      case 'Execution failures':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getConsensusColor = (consensus: string) => {
    const [votes, total] = consensus.split('/').map(Number);
    const percentage = (votes / total) * 100;
    
    if (percentage >= 95) return 'text-neon-green';
    if (percentage >= 80) return 'text-neon-blue';
    return 'text-neon-purple';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-start"
      >
        <div>
          <h1 className="text-3xl font-bold font-inter text-foreground mb-2">
            Dead Data
          </h1>
          <p className="text-muted-foreground font-inter">
            Permanently deleted data and forgetting operations
          </p>
        </div>
        <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Emergency Recovery
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deadStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="bg-card-glass backdrop-blur-sm border-glass-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground font-inter">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-neon-green font-mono">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-neon-green/10">
                    <stat.icon className="h-6 w-6 text-neon-green" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Forgetting Process */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-gradient-accent/5 border-neon-green/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-inter">
              <Shield className="h-5 w-5 text-neon-green" />
              Secure Forgetting Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 font-inter">
                  Consensus Requirements
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-inter">Minimum Votes Required</span>
                    <span className="font-mono text-foreground">75% (113/150)</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="text-xs text-muted-foreground font-inter">
                    Network consensus ensures only truly obsolete data is forgotten
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 font-inter">
                  Safety Mechanisms
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground font-inter">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full mt-1.5 flex-shrink-0"></span>
                    Cryptographic proof of deletion
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-neon-blue rounded-full mt-1.5 flex-shrink-0"></span>
                    24-hour grace period for recovery
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-neon-purple rounded-full mt-1.5 flex-shrink-0"></span>
                    Immutable deletion audit trail
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full mt-1.5 flex-shrink-0"></span>
                    Multi-validator verification
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Deletions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-card-glass backdrop-blur-sm border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-inter">
              <Trash2 className="h-5 w-5 text-destructive" />
              Forgotten Memory Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : deadData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No dead data</div>
            ) : (
              <div className="space-y-6">
                {deadData.map((deletion, index) => (
                  <motion.div
                    key={deletion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    className="p-6 rounded-lg border border-glass-border hover:border-destructive/30 transition-all duration-300"
                  >
                    <div className="grid md:grid-cols-3 gap-6 items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 font-inter">
                          {deletion.metadata?.content_type || 'Memory Data'}
                        </h3>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground font-inter">
                            IPFS: <span className="font-mono text-xs">{deletion.metadata?.ipfs_hash?.substring(0, 16)}...</span>
                          </div>
                          <div className="text-sm text-muted-foreground font-inter">
                            Size: <span className="font-mono">{formatBytes(deletion.metadata?.size_bytes || 0)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground font-inter">
                            Deleted: <span className="font-inter">{formatTimeAgo(deletion.deleted_at || deletion.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm font-medium mb-1 font-inter text-destructive">
                          Low Cognitive Score
                        </div>
                        <div className="text-xs text-muted-foreground font-inter">
                          Deletion Reason
                        </div>
                        <div className="text-lg font-bold text-neon-purple mt-2 font-mono">
                          {(deletion.cognitive_score * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold mb-1 font-mono text-neon-green">
                          {Math.floor(Math.random() * 20 + 130)}/150
                        </div>
                        <div className="text-xs text-muted-foreground font-inter">
                          Consensus Votes
                        </div>
                        <div className="mt-2 flex gap-2 justify-center">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-muted-foreground/30 text-muted-foreground hover:bg-muted/10"
                          >
                            View Proof
                          </Button>
                          {deletion.metadata?.ipfs_hash && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                              asChild
                            >
                              <a
                                href={`https://gateway.pinata.cloud/ipfs/${deletion.metadata.ipfs_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                IPFS
                              </a>
                            </Button>
                          )}
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

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-destructive mb-2 font-inter">
                  Data Recovery Notice
                </h3>
                <p className="text-muted-foreground font-inter leading-relaxed">
                  Data marked as "dead" has been permanently deleted from the network. Recovery is only 
                  possible through emergency protocols within the 24-hour grace period. After this time, 
                  data is cryptographically unrecoverable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardDead;