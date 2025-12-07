import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Activity, Archive, Trash2, TrendingUp, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserData } from '@/hooks/useUserData';

// Colors from our neon theme
const COLORS = {
  active: '#00d4ff', // neon-blue
  archived: '#00ff88', // neon-green  
  dead: '#b347ff', // neon-purple
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function DataLifecycleChart() {
  const { userStats, dataRecords, loading } = useUserData();
  
  // Calculate memory distribution from real data
  const safeUserStats = {
    activeData: 0,
    archivedData: 0,
    deadData: 0,
    ...userStats
  };
  
  const totalData = safeUserStats.activeData + safeUserStats.archivedData + safeUserStats.deadData;
  
  const memoryData = totalData > 0 ? [
    { 
      name: 'Active', 
      value: safeUserStats.activeData, 
      percentage: ((safeUserStats.activeData / totalData) * 100).toFixed(1),
      color: COLORS.active, 
      icon: Database 
    },
    { 
      name: 'Archived', 
      value: safeUserStats.archivedData, 
      percentage: ((safeUserStats.archivedData / totalData) * 100).toFixed(1),
      color: COLORS.archived, 
      icon: Archive 
    },
    { 
      name: 'Dead', 
      value: safeUserStats.deadData, 
      percentage: ((safeUserStats.deadData / totalData) * 100).toFixed(1),
      color: COLORS.dead, 
      icon: Trash2 
    },
  ] : [
    { name: 'Active', value: 1, percentage: '33.3', color: COLORS.active, icon: Database },
    { name: 'Archived', value: 1, percentage: '33.3', color: COLORS.archived, icon: Archive },
    { name: 'Dead', value: 1, percentage: '33.4', color: COLORS.dead, icon: Trash2 },
  ];
  
  // Generate weekly trends from data records (simulated for now)
  const weeklyData = [
    { name: 'Mon', active: safeUserStats.activeData * 0.9, archived: safeUserStats.archivedData * 0.8, dead: safeUserStats.deadData * 0.7 },
    { name: 'Tue', active: safeUserStats.activeData * 0.95, archived: safeUserStats.archivedData * 0.85, dead: safeUserStats.deadData * 0.8 },
    { name: 'Wed', active: safeUserStats.activeData * 0.85, archived: safeUserStats.archivedData * 0.9, dead: safeUserStats.deadData * 0.9 },
    { name: 'Thu', active: safeUserStats.activeData * 0.8, archived: safeUserStats.archivedData * 0.95, dead: safeUserStats.deadData * 0.95 },
    { name: 'Fri', active: safeUserStats.activeData * 0.75, archived: safeUserStats.archivedData, dead: safeUserStats.deadData },
    { name: 'Sat', active: safeUserStats.activeData * 0.9, archived: safeUserStats.archivedData * 1.05, dead: safeUserStats.deadData * 1.1 },
    { name: 'Sun', active: safeUserStats.activeData, archived: safeUserStats.archivedData * 1.1, dead: safeUserStats.deadData * 1.2 },
  ];
  
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-card-glass backdrop-blur-md border-glass-border">
            <CardContent className="p-6">
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid md:grid-cols-2 gap-6 w-full">
      {/* Memory Distribution Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-card-glass backdrop-blur-md border-glass-border hover:border-glass-border/60 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between font-inter">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-neon-blue" />
                <span className="text-lg">Data Distribution</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {totalData > 0 ? `${totalData} Total Records` : 'No Data'}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={memoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={90}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                    stroke="rgba(255,255,255,0.1)"
                  >
                    {memoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `${value} records (${memoryData.find(d => d.name === name)?.percentage || 0}%)`, 
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(12px)',
                      color: 'white',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {memoryData.map((item) => (
                <div key={item.name} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5">
                  <item.icon 
                    className="h-4 w-4" 
                    style={{ color: item.color }} 
                  />
                  <span className="text-xs font-medium text-white">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Trends Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-card-glass backdrop-blur-md border-glass-border hover:border-glass-border/60 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between font-inter">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-neon-green" />
                <span className="text-lg">Weekly Trends</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Last 7 Days
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(12px)',
                      color: 'white',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="active" stackId="a" fill={COLORS.active} radius={[0, 0, 0, 0]} name="Active" />
                  <Bar dataKey="archived" stackId="a" fill={COLORS.archived} radius={[0, 0, 0, 0]} name="Archived" />
                  <Bar dataKey="dead" stackId="a" fill={COLORS.dead} radius={[4, 4, 0, 0]} name="Dead" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Mini Legend */}
            <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.active }}></div>
                <span className="text-xs text-gray-300">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.archived }}></div>
                <span className="text-xs text-gray-300">Archived</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.dead }}></div>
                <span className="text-xs text-gray-300">Dead</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}