import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Wallet, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { connect, connectors, isPending, error } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connected: solanaConnected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Redirect to dashboard if already connected (either Ethereum or Solana)
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (isConnected && address) {
        toast({
          title: "Ethereum Wallet Connected",
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
        // Small delay to ensure wallet registration completes
        setTimeout(() => navigate('/dashboard'), 500);
      } else if (solanaConnected && publicKey) {
        toast({
          title: "Solana Wallet Connected", 
          description: `Connected to ${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-4)}`,
        });
        // Small delay to ensure wallet registration completes
        setTimeout(() => navigate('/dashboard'), 500);
      }
    };

    handleWalletConnection();
  }, [isConnected, address, solanaConnected, publicKey, navigate, toast]);

  const handleConnect = async (connector: any) => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      await connect({ connector });
    } catch (error) {
      const errorMessage = "Failed to connect Ethereum wallet. Please try again.";
      setConnectionError(errorMessage);
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSolanaConnect = () => {
    try {
      setConnectionError(null);
      setVisible(true);
    } catch (error) {
      const errorMessage = "Failed to connect Solana wallet. Please try again.";
      setConnectionError(errorMessage);
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getConnectorIcon = (connectorName: string) => {
    switch (connectorName.toLowerCase()) {
      case 'metamask':
        return '🦊';
      case 'walletconnect':
        return '🔗';
      default:
        return '👛';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-blue rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </motion.div>

          {/* Main Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-card-glass backdrop-blur-md border-glass-border shadow-neon">
              <CardHeader className="text-center pb-6">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="inline-flex p-4 rounded-full bg-gradient-primary/20 mb-4">
                    <Wallet className="h-8 w-8 text-neon-blue" />
                  </div>
                  <CardTitle className="text-2xl font-bold font-inter text-foreground">
                    Connect Your Wallet
                  </CardTitle>
                  <p className="text-muted-foreground mt-2 font-inter">
                    Connect your wallet to access AmnesiaChain dashboard and manage your data lifecycle
                  </p>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Connection Status */}
                {(error || connectionError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3"
                  >
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <p className="text-destructive font-inter text-sm">
                      {error ? error.message : connectionError}
                    </p>
                  </motion.div>
                )}

                {/* Ethereum Wallet Options */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Ethereum Wallets</h3>
                  {connectors.map((connector, index) => (
                    <motion.div
                      key={connector.uid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-14 border-glass-border hover:border-neon-blue/50 hover:bg-neon-blue/5 transition-all duration-300 group"
                        onClick={() => handleConnect(connector)}
                        disabled={isPending || isConnecting}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {getConnectorIcon(connector.name)}
                            </span>
                            <div className="text-left">
                              <div className="font-semibold font-inter text-foreground">
                                {connector.name}
                              </div>
                              <div className="text-xs text-muted-foreground font-inter">
                                {connector.name === 'MetaMask' && 'Browser Extension'}
                                {connector.name === 'WalletConnect' && 'Mobile & Desktop'}
                                {connector.name === 'Injected' && 'Injected Wallet'}
                              </div>
                            </div>
                          </div>
                          {(isPending || isConnecting) && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full"
                            />
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Solana Wallet Options */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Solana Wallets</h3>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-14 border-glass-border hover:border-neon-purple/50 hover:bg-neon-purple/5 transition-all duration-300"
                      onClick={handleSolanaConnect}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">👻</span>
                          <div className="text-left">
                            <div className="font-semibold font-inter text-foreground">
                              Phantom (Solana)
                            </div>
                            <div className="text-xs text-muted-foreground font-inter">
                              Solana Blockchain
                            </div>
                          </div>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                </div>

                {/* Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="mt-6 p-4 rounded-lg bg-neon-green/5 border border-neon-green/20"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-neon-green mt-0.5" />
                    <div className="text-sm font-inter">
                      <p className="text-foreground font-semibold mb-1">Secure Connection</p>
                      <p className="text-muted-foreground">
                        Your wallet remains in your control. AmnesiaChain never stores your private keys.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;