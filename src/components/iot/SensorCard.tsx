import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SensorCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: 'up' | 'down' | 'stable';
}

export const SensorCard = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  iconColor,
  trend 
}: SensorCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-card hover:shadow-neon transition-all duration-300 border-glass-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {typeof value === 'number' ? value.toFixed(1) : value}
            </span>
            <span className="text-lg text-muted-foreground">{unit}</span>
          </div>
          {trend && (
            <p className={`text-xs mt-2 ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 
              'text-muted-foreground'
            }`}>
              {trend === 'up' ? '↑ Increasing' : 
               trend === 'down' ? '↓ Decreasing' : 
               '→ Stable'}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
