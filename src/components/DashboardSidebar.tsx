import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Database, 
  Archive, 
  Trash2, 
  Settings, 
  Brain,
  Menu
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { motion } from 'framer-motion';

const navigationItems = [
  {
    title: 'Overview',
    url: '/dashboard',
    icon: BarChart3,
  },
  {
    title: 'Active Data',
    url: '/dashboard/active',
    icon: Database,
  },
  {
    title: 'Archived Data',
    url: '/dashboard/archived',
    icon: Archive,
  },
  {
    title: 'Dead Data',
    url: '/dashboard/dead',
    icon: Trash2,
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r border-glass-border bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-xl">
      <SidebarContent className="p-4 h-full">
        {/* Logo */}
        <motion.div 
          className="flex items-center gap-3 mb-8 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-neon-blue/30">
            <Brain className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="font-inter font-bold text-xl bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-green bg-clip-text text-transparent">
                AmnesiaChain
              </span>
              <p className="text-xs text-gray-400 font-medium">Memory Management</p>
            </motion.div>
          )}
        </motion.div>

        <SidebarGroup>
          <SidebarGroupLabel className={`${isCollapsed ? 'sr-only' : ''} text-gray-300 font-inter font-semibold text-xs uppercase tracking-wider mb-4 px-2`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item, index) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === '/dashboard'}
                          className={`group flex items-center gap-3 px-3 py-3 mx-1 rounded-xl font-inter font-medium transition-all duration-300 ${
                            active
                              ? 'bg-gradient-to-r from-neon-blue/20 to-neon-cyan/20 text-white border border-neon-blue/30 shadow-lg shadow-neon-blue/20'
                              : 'text-gray-300 hover:text-white hover:bg-white/10 hover:border hover:border-white/20 rounded-xl'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors duration-300 ${
                            active 
                              ? 'text-neon-cyan' 
                              : 'text-gray-400 group-hover:text-neon-cyan'
                          } ${isCollapsed ? 'mx-auto' : ''}`} />
                          {!isCollapsed && (
                            <span className="truncate">
                              {item.title}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </motion.div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Memory Status */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-auto mb-6 mx-1 p-4 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 backdrop-blur-sm"
          >
            <h3 className="text-sm font-semibold text-white mb-3 font-inter flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              Memory Usage
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-300 font-inter">Active Storage</span>
                <span className="text-xs font-mono text-neon-green font-semibold">2.4GB</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-neon-green to-neon-cyan h-full rounded-full w-3/4 shadow-sm shadow-neon-green/50 transition-all duration-1000"></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-inter">
                <span className="text-gray-300">75% efficient</span>
                <span className="text-right text-neon-cyan font-semibold">24.7GB saved</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Collapsed trigger */}
        {isCollapsed && (
          <div className="mt-auto mb-6 flex justify-center">
            <SidebarTrigger className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-neon-cyan/50 transition-all duration-300">
              <Menu className="h-5 w-5 text-gray-300 hover:text-neon-cyan" />
            </SidebarTrigger>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}