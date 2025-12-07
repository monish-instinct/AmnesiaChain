import { useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import ErrorBoundary from '@/components/ErrorBoundary';
import DashboardOverview from '@/pages/dashboard/Overview';
import DashboardActive from '@/pages/dashboard/Active';
import DashboardArchived from '@/pages/dashboard/Archived';
import DashboardDead from '@/pages/dashboard/Dead';
import DashboardSettings from '@/pages/dashboard/Settings';
import { useWalletAuth } from '@/hooks/useWalletAuth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useWalletAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          
          <div className="flex-1 flex flex-col min-w-0">
            <DashboardHeader />
            
            <main className="flex-1 overflow-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="container mx-auto p-4 md:p-6 max-w-7xl"
              >
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<DashboardOverview />} />
                    <Route path="/active" element={<DashboardActive />} />
                    <Route path="/archived" element={<DashboardArchived />} />
                    <Route path="/dead" element={<DashboardDead />} />
                    <Route path="/settings" element={<DashboardSettings />} />
                  </Routes>
                </ErrorBoundary>
              </motion.div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default Dashboard;