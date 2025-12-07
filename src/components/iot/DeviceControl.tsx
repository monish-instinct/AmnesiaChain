import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DeviceControlProps {
  deviceName: string;
  deviceType: string;
  isActive: boolean;
  icon: LucideIcon;
  onToggle: () => void;
}

export const DeviceControl = ({ 
  deviceName, 
  deviceType, 
  isActive, 
  icon: Icon,
  onToggle 
}: DeviceControlProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`transition-all duration-300 ${
        isActive 
          ? 'bg-primary/10 border-primary shadow-neon' 
          : 'bg-card border-glass-border'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isActive ? 'bg-primary/20' : 'bg-muted'
              }`}>
                <Icon className={`h-5 w-5 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>
              <div>
                <CardTitle className="text-base">{deviceName}</CardTitle>
                <Badge variant={isActive ? 'default' : 'secondary'} className="mt-1">
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={onToggle}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground capitalize">
            {deviceType} Control
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
