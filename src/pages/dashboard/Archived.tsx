import { motion } from 'framer-motion';
import { Archive, RotateCcw, Trash2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { fetchMemoryNodesByState, promoteMemoryNode, forgetMemoryNode, formatBytes, formatTimeAgo, type MemoryNode } from '@/lib/memoryLifecycle';
import { useToast } from '@/hooks/use-toast';

const DashboardArchived = () => {
  const [archivedData, setArchivedData] = useState<MemoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadArchivedData();
  }, []);

  const loadArchivedData = async () => {
    try {
      const data = await fetchMemoryNodesByState('archived');
      setArchivedData(data);
    } catch (error) {
      console.error('Error loading archived data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load archived data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (nodeId: string) => {
    setActionLoading(nodeId);
    try {
      await promoteMemoryNode(nodeId);
      toast({
        title: 'Data Promoted',
        description: 'Memory node moved back to active state',
      });
      await loadArchivedData();
    } catch (error) {
      console.error('Error promoting node:', error);
      toast({
        title: 'Error',
        description: 'Failed to promote data',
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
        description: 'Memory node marked as dead',
      });
      await loadArchivedData();
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

  const totalSize = archivedData.reduce((sum, node) => sum + (node.metadata?.size_bytes || 0), 0);
  const totalCompressed = archivedData.reduce((sum, node) => sum + (node.metadata?.compressed_size || 0), 0);
  const avgCompression = totalSize > 0 ? ((totalSize - totalCompressed) / totalSize * 100).toFixed(1) : '0';

  const archivedStats = [
    { label: 'Cold Storage', value: formatBytes(totalCompressed), progress: 65 },
    { label: 'Archived Records', value: archivedData.length.toString(), progress: 78 },
    { label: 'Avg. Compression', value: `${avgCompression}%`, progress: parseInt(avgCompression) },
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
            Archived Data
          </h1>
          <p className="text-muted-foreground font-inter">
            Data in cold storage with optimized compression
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-glass-border">
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore Selected
          </Button>
          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Forever
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {archivedStats.map((stat, index) => (
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
                      <p className="text-2xl font-bold text-neon-purple font-mono">
                        {stat.value}
                      </p>
                    </div>
                    <Archive className="h-6 w-6 text-neon-purple" />
                  </div>
                  <Progress value={stat.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Compression Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-gradient-secondary/5 border-neon-purple/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-inter">
              <Archive className="h-5 w-5 text-neon-purple" />
              Storage Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 font-inter">
                  Compression Benefits
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-inter">Average Compression</span>
                    <span className="font-mono text-neon-green">84.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-inter">Storage Saved</span>
                    <span className="font-mono text-neon-blue">46.2 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-inter">Cost Reduction</span>
                    <span className="font-mono text-neon-purple">$1,847/month</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 font-inter">
                  Access Patterns
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-inter">Restoration Time</span>
                    <span className="font-mono text-neon-cyan">~2.3s avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-inter">Access Frequency</span>
                    <span className="font-mono text-neon-green">0.8 per day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-inter">Integrity Checks</span>
                    <span className="font-mono text-neon-blue">100% pass</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Archived Data List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-card-glass backdrop-blur-sm border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-inter">
              <Clock className="h-5 w-5 text-neon-blue" />
              Archived Memory Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : archivedData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No archived data</div>
            ) : (
              <div className="space-y-4">
                {archivedData.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    className="p-6 rounded-lg border border-glass-border hover:border-neon-purple/30 transition-all duration-300"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 font-inter">
                          {item.metadata?.content_type || 'Memory Data'}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-inter">IPFS Hash:</span>
                            <span className="font-mono text-xs">{item.metadata?.ipfs_hash?.substring(0, 12)}...</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-inter">Original Size:</span>
                            <span className="font-mono">{formatBytes(item.metadata?.size_bytes || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-inter">Compressed:</span>
                            <span className="font-mono text-neon-green">{formatBytes(item.metadata?.compressed_size || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-inter">Archived:</span>
                            <span className="font-inter">{formatTimeAgo(item.archived_at || item.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between">
                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold text-neon-purple mb-1 font-mono">
                            {item.metadata?.compression_ratio?.toFixed(1) || '0'}%
                          </div>
                          <div className="text-xs text-muted-foreground font-inter">
                            Compression Ratio
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">
                            Cognitive: <span className="text-neon-cyan">{(item.cognitive_score * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 border-neon-blue text-neon-blue hover:bg-neon-blue/10"
                            onClick={() => handlePromote(item.id)}
                            disabled={actionLoading === item.id}
                          >
                            {actionLoading === item.id ? 'Processing...' : 'Restore'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => handleForget(item.id)}
                            disabled={actionLoading === item.id}
                          >
                            Delete
                          </Button>
                          {item.metadata?.ipfs_hash && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                              asChild
                            >
                              <a
                                href={`https://gateway.pinata.cloud/ipfs/${item.metadata.ipfs_hash}`}
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
    </div>
  );
};

export default DashboardArchived;