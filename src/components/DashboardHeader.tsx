import { motion } from 'framer-motion';
import { useAccount, useBalance } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Wallet, 
  User, 
  Bell, 
  Copy, 
  Search,
  Menu,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DashboardHeader() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { walletAddress, chainType, logout } = useWalletAuth();

  const handleLogout = () => {
    logout();
    toast({
      title: "Wallet Disconnected",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: any) => {
    if (!bal) return '0.000';
    return parseFloat(bal.formatted).toFixed(3);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-r from-background via-background/95 to-background backdrop-blur-xl"
    >
      <div className="flex h-16 items-center px-4 lg:px-6 gap-4">
        {/* Mobile Sidebar Trigger */}
        <SidebarTrigger className="lg:hidden">
          <Button variant="ghost" size="sm" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SidebarTrigger>
        
        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xl">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search memory nodes, blocks, transactions..."
              className="pl-10 h-9 bg-card/50 border-border/60 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative h-9 w-9 rounded-lg hover:bg-accent"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
              3
            </span>
          </Button>

          {/* Professional Wallet Display */}
          {walletAddress && (
            <motion.div 
              className="hidden sm:flex items-center bg-card/50 rounded-lg px-3 py-1.5 border border-border/60 gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/80 rounded-md flex items-center justify-center">
                  <Wallet className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-foreground">
                      {formatAddress(walletAddress)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-accent rounded"
                      onClick={copyAddress}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {chainType === 'ethereum' ? formatBalance(balance) + ' ETH' : 'Solana'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mobile wallet info */}
          {walletAddress && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="sm:hidden h-9 w-9 rounded-lg"
            >
              <Wallet className="h-4 w-4" />
            </Button>
          )}

          {/* Professional User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1.5 h-9 px-2 rounded-lg hover:bg-accent"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-muted-foreground/80 to-muted-foreground rounded-md flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-background" />
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-card border-border shadow-lg rounded-lg p-2"
            >
              {/* Profile Header */}
              <div className="px-2 py-2 border-b border-border/50 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-md flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">
                      {chainType === 'ethereum' ? 'Ethereum' : 'Solana'}
                    </div>
                    {walletAddress && (
                      <>
                        <div className="text-xs font-mono text-muted-foreground truncate">
                          {formatAddress(walletAddress)}
                        </div>
                        {chainType === 'ethereum' && balance && (
                          <div className="text-xs text-muted-foreground">
                            {formatBalance(balance)} ETH
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="py-1">
                <DropdownMenuItem className="rounded-md hover:bg-accent cursor-pointer">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="rounded-md hover:bg-destructive/10 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnect Wallet</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3 border-t border-border/40">
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search blocks, transactions..."
            className="pl-10 h-9 bg-card/50 border-border/60 rounded-lg"
          />
        </div>
      </div>
    </motion.header>
  );
}
