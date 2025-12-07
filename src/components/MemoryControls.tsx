import { useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, RotateCcw, Trash2, Zap, ChevronRight, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/hooks/useUserData';

interface MemoryAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: 'archive' | 'promote' | 'forget';
  color: string;
  bgColor: string;
}

const memoryActions: MemoryAction[] = [
  {
    id: 'archive',
    title: 'Archive Data',
    description: 'Move active data to cold storage',
    icon: Archive,
    action: 'archive',
    color: 'text-neon-blue',
    bgColor: 'bg-neon-blue/10'
  },
  {
    id: 'promote',
    title: 'Promote Data',
    description: 'Move cold data back to active state',
    icon: RotateCcw,
    action: 'promote',
    color: 'text-neon-green',
    bgColor: 'bg-neon-green/10'
  },
  {
    id: 'forget',
    title: 'Forget Data',
    description: 'Permanently delete obsolete data',
    icon: Trash2,
    action: 'forget',
    color: 'text-neon-purple',
    bgColor: 'bg-neon-purple/10'
  },
];

export function MemoryControls() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { userStats, refreshData } = useUserData();
  
  const safeUserStats = {
    activeData: 0,
    archivedData: 0,
    deadData: 0,
    ...userStats
  };

  const handleMemoryAction = async (action: MemoryAction) => {
    setIsLoading(action.id);
    setProgress(0);

    // Simulate smart contract interaction with more realistic progress
    const progressSteps = [0, 25, 50, 75, 90, 100];
    let stepIndex = 0;
    
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setProgress(progressSteps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(progressInterval);
      }
    }, 300);

    await new Promise(resolve => setTimeout(resolve, 2100));

    setIsLoading(null);
    setProgress(0);
    
    // Refresh data after action
    await refreshData();

    // Trigger page reload to show updated data
    window.dispatchEvent(new Event('memoryLifecycleUpdate'));

    toast({
      title: `${action.title} Complete`,
      description: `Blockchain transaction confirmed - Data lifecycle updated`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-card-glass backdrop-blur-md border-glass-border hover:border-glass-border/60 transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-inter text-lg">
                <Zap className="h-5 w-5 text-neon-cyan" />
                Memory Controls
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Blockchain-powered data lifecycle management
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total Data</div>
              <div className="text-lg font-mono text-neon-cyan">
                {safeUserStats.activeData + safeUserStats.archivedData + safeUserStats.deadData}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {memoryActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              <Button
                variant="ghost"
                className={`w-full h-auto p-4 border border-glass-border hover:border-${action.color.replace('text-', '')}/30 transition-all duration-300 group bg-gradient-to-r from-white/5 to-transparent hover:from-white/10`}
                onClick={() => handleMemoryAction(action)}
                disabled={isLoading !== null}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${action.bgColor} border border-white/10 group-hover:scale-105 group-hover:border-white/20 transition-all duration-300`}>
                      <action.icon className={`h-4 w-4 ${action.color}`} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold font-inter text-foreground text-sm group-hover:text-white">
                        {action.title}
                      </div>
                      <div className="text-xs text-muted-foreground font-inter">
                        {action.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isLoading === action.id ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full"
                      />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-neon-cyan transition-colors duration-300" />
                    )}
                  </div>
                </div>
              </Button>

              {/* Progress Bar */}
              {isLoading === action.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-0 left-0 right-0 px-4 pb-2"
                >
                  <div className="relative">
                    <Progress 
                      value={progress} 
                      className="h-2 bg-black/30" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 rounded-full" style={{width: `${progress}%`}} />
                  </div>
                  <div className="text-xs text-neon-cyan font-mono mt-1 text-center">
                    Processing on-chain... {progress}%
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Current Data Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4 p-4 rounded-xl bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white font-inter flex items-center gap-2">
                <Database className="h-4 w-4 text-neon-blue" />
                Current Distribution
              </h4>
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-mono text-neon-blue">{safeUserStats.activeData}</div>
                <div className="text-xs text-gray-300">Active</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-mono text-neon-green">{safeUserStats.archivedData}</div>
                <div className="text-xs text-gray-300">Archived</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-mono text-neon-purple">{safeUserStats.deadData}</div>
                <div className="text-xs text-gray-300">Dead</div>
              </div>
            </div>
          </motion.div>
          
          {/* Smart Contract Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <p className="text-xs text-gray-300 font-inter leading-relaxed text-center">
              <span className="text-neon-cyan font-semibold">Blockchain-Powered:</span> All operations create immutable records on AmnesiaChain
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}