import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Database, Zap, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

const DashboardSettings = () => {
  const { toast } = useToast();
  const [relevanceThreshold, setRelevanceThreshold] = useState([75]);
  const [archiveDelay, setArchiveDelay] = useState([7]);
  const [deleteDelay, setDeleteDelay] = useState([30]);
  
  const [notifications, setNotifications] = useState({
    memoryAlerts: true,
    consensusUpdates: false,
    performanceReports: true,
    securityWarnings: true,
  });

  const [preferences, setPreferences] = useState({
    autoArchive: true,
    smartDeletion: true,
    realTimeSync: false,
    advancedMode: false,
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold font-inter text-foreground mb-2">
          Settings
        </h1>
        <p className="text-muted-foreground font-inter">
          Configure your AmnesiaChain memory management preferences
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Memory Management Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-card-glass backdrop-blur-sm border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-inter">
                <Database className="h-5 w-5 text-neon-blue" />
                Memory Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Relevance Threshold */}
              <div className="space-y-3">
                <Label className="text-sm font-medium font-inter">
                  Relevance Score Threshold
                </Label>
                <div className="px-3">
                  <Slider
                    value={relevanceThreshold}
                    onValueChange={setRelevanceThreshold}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-inter">
                  <span>Conservative (10%)</span>
                  <span className="font-semibold">Current: {relevanceThreshold[0]}%</span>
                  <span>Aggressive (100%)</span>
                </div>
                <p className="text-xs text-muted-foreground font-inter">
                  Data below this score will be considered for archiving
                </p>
              </div>

              {/* Archive Delay */}
              <div className="space-y-3">
                <Label className="text-sm font-medium font-inter">
                  Auto-Archive Delay (days)
                </Label>
                <div className="px-3">
                  <Slider
                    value={archiveDelay}
                    onValueChange={setArchiveDelay}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-inter">
                  <span>1 day</span>
                  <span className="font-semibold">{archiveDelay[0]} days</span>
                  <span>30 days</span>
                </div>
              </div>

              {/* Delete Delay */}
              <div className="space-y-3">
                <Label className="text-sm font-medium font-inter">
                  Deletion Grace Period (days)
                </Label>
                <div className="px-3">
                  <Slider
                    value={deleteDelay}
                    onValueChange={setDeleteDelay}
                    max={90}
                    min={7}
                    step={7}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-inter">
                  <span>7 days</span>
                  <span className="font-semibold">{deleteDelay[0]} days</span>
                  <span>90 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-card-glass backdrop-blur-sm border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-inter">
                <Bell className="h-5 w-5 text-neon-purple" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium font-inter capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-xs text-muted-foreground font-inter">
                      {key === 'memoryAlerts' && 'Get notified when memory thresholds are reached'}
                      {key === 'consensusUpdates' && 'Network consensus and voting updates'}
                      {key === 'performanceReports' && 'Weekly performance and efficiency reports'}
                      {key === 'securityWarnings' && 'Critical security alerts and warnings'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Advanced Preferences */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-card-glass backdrop-blur-sm border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-inter">
                <Zap className="h-5 w-5 text-neon-green" />
                Advanced Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(preferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium font-inter capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-xs text-muted-foreground font-inter">
                      {key === 'autoArchive' && 'Automatically archive data based on relevance scores'}
                      {key === 'smartDeletion' && 'Use AI-powered deletion recommendations'}
                      {key === 'realTimeSync' && 'Keep dashboard data synchronized in real-time'}
                      {key === 'advancedMode' && 'Show advanced metrics and debugging information'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-card-glass backdrop-blur-sm border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-inter">
                <User className="h-5 w-5 text-neon-cyan" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name" className="text-sm font-medium font-inter">
                  Display Name
                </Label>
                <Input
                  id="display-name"
                  placeholder="Enter your display name"
                  className="bg-background/50 border-glass-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium font-inter">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-background/50 border-glass-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-sm font-medium font-inter">
                  API Key
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="••••••••••••••••"
                    className="bg-background/50 border-glass-border"
                    readOnly
                  />
                  <Button variant="outline" className="border-glass-border">
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex justify-end"
      >
        <Button
          onClick={handleSaveSettings}
          className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-inter font-semibold px-8 py-3 shadow-neon"
        >
          <Save className="mr-2 h-5 w-5" />
          Save Settings
        </Button>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-neon-blue/5 border-neon-blue/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-neon-blue mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-neon-blue mb-2 font-inter">
                  Security & Privacy
                </h3>
                <p className="text-muted-foreground font-inter leading-relaxed">
                  All settings are stored locally and synchronized with your wallet. 
                  AmnesiaChain never stores personal information on centralized servers. 
                  Your privacy and data sovereignty are guaranteed by design.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardSettings;