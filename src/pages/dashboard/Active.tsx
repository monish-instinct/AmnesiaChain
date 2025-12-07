import { motion } from 'framer-motion';
import { Zap, Archive, Trash2, Database, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { fetchMemoryNodesByState, archiveMemoryNode, forgetMemoryNode, formatBytes, formatTimeAgo, type MemoryNode } from '@/lib/memoryLifecycle';
import { useToast } from '@/hooks/use-toast';

const DashboardActive = () => {
  const [activeData, setActiveData] = useState<MemoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadActiveData();
    
    // Listen for updates
    const handleUpdate = () => loadActiveData();
    window.addEventListener('memoryLifecycleUpdate', handleUpdate);
    return () => window.removeEventListener('memoryLifecycleUpdate', handleUpdate);
  }, []);

  const loadActiveData = async () => {
    try {
      const data = await fetchMemoryNodesByState('active');
      setActiveData(data);
    } catch (error) {
      console.error('Error loading active data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load active data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (nodeId: string) => {
    setActionLoading(nodeId);
    try {
      await archiveMemoryNode(nodeId);
      toast({
        title: 'Data Archived',
        description: 'Memory node has been archived and uploaded to IPFS',
      });
      await loadActiveData();
    } catch (error) {
      console.error('Error archiving node:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive data',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleForget = async (nodeId: string) => {
    setActionLoading(nodeId);
    try {
      await forgetMemoryNode(nodeId);
      toast({
        title: 'Data Forgotten',
        description: 'Memory node has been uploaded to IPFS and marked as dead',
      });
      await loadActiveData();
    } catch (error) {
      console.error('Error forgetting node:', error);
      toast({
        title: 'Error',
        description: 'Failed to forget data',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const totalSize = activeData.reduce((sum, node) => sum + (node.metadata?.size_bytes || 0), 0);
  const avgCognitiveScore = activeData.length > 0 
    ? activeData.reduce((sum, node) => sum + node.cognitive_score, 0) / activeData.length * 100 
    : 0;
  const totalAccess = activeData.reduce((sum, node) => sum + node.access_count, 0);

  const activeStats = [
    { label: 'Active Memory', value: formatBytes(totalSize), progress: 85, icon: Database },
    { label: 'Memory Nodes', value: activeData.length.toString(), progress: 78, icon: Activity },
    { label: 'Avg. Cognitive Score', value: `${avgCognitiveScore.toFixed(1)}%`, progress: avgCognitiveScore, icon: Zap },
  ];

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
            Active Memory Data
          </h1>
          <p className="text-muted-foreground font-inter">
            Real-time blockchain memory nodes in active state
          </p>
        </div>
        <Badge variant="outline" className="border-neon-green/30 text-neon-green text-lg px-4 py-2">
          <Activity className="h-4 w-4 mr-2" />
          {activeData.length} Active Nodes
        </Badge>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="bg-card-glass backdrop-blur-sm border-glass-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground font-inter">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-neon-blue font-mono">
                        {stat.value}
                      </p>
                    </div>
                    <stat.icon className="h-6 w-6 text-neon-blue" />
                  </div>
                  <Progress value={stat.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Memory Nodes List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-card-glass backdrop-blur-sm border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-inter">
              <Zap className="h-5 w-5 text-neon-blue" />
              Active Memory Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : activeData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active data</div>
            ) : (
              <div className="space-y-4">
                {activeData.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    className="p-6 rounded-lg border border-glass-border hover:border-neon-blue/30 transition-all duration-300 bg-gradient-to-r from-neon-blue/5 to-transparent"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 font-inter">
                          {item.metadata?.content_type || 'Memory Data'}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-inter">Node Address:</span>
                            <span className="font-mono text-xs">{item.node_address.substring(0, 16)}...</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-inter">Size:</span>
                            <span className="font-mono">{formatBytes(item.metadata?.size_bytes || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-inter">Access Count:</span>
                            <span className="font-mono text-neon-green">{item.access_count}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-inter">Last Accessed:</span>
                            <span className="font-inter">{formatTimeAgo(item.last_accessed || item.updated_at)}</span>
                          </div>
                          {(item.metadata as any)?.description && (
                            <div className="text-xs text-muted-foreground mt-2 italic">
                              {(item.metadata as any).description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col justify-between">
                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold text-neon-blue mb-1 font-mono">
                            {(item.cognitive_score * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground font-inter">
                            Cognitive Score
                          </div>
                          <Progress value={item.cognitive_score * 100} className="h-2 mt-2" />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 border-neon-purple text-neon-purple hover:bg-neon-purple/10"
                            onClick={() => handleArchive(item.id)}
                            disabled={actionLoading === item.id}
                          >
                            {actionLoading === item.id ? (
                              'Processing...'
                            ) : (
                              <>
                                <Archive className="h-4 w-4 mr-1" />
                                Archive to IPFS
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => handleForget(item.id)}
                            disabled={actionLoading === item.id}
                          >
                            {actionLoading === item.id ? (
                              'Processing...'
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Forget
                              </>
                            )}
                          </Button>
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

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border-neon-blue/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Database className="h-6 w-6 text-neon-blue mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-neon-blue mb-2 font-inter">
                  IPFS Blockchain Storage
                </h3>
                <p className="text-muted-foreground font-inter leading-relaxed">
                  When you archive or forget data, it's automatically uploaded to IPFS (InterPlanetary File System) 
                  via Pinata, ensuring decentralized, permanent storage. All transactions are recorded on the 
                  AmnesiaChain blockchain for complete transparency and immutability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardActive;
