import { useIoTData } from '@/hooks/useIoTData';
import { SensorCard } from '@/components/iot/SensorCard';
import { DeviceControl } from '@/components/iot/DeviceControl';
import { SensorChart } from '@/components/iot/SensorChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplets, Sprout, Sun, Fan, Droplet, Lightbulb, Flame, RefreshCw, Database, HardDrive, Activity, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { fetchMemoryStats, formatBytes } from '@/lib/memoryLifecycle';
import { MemoryControls } from '@/components/MemoryControls';
import { BlockchainExplorer } from '@/components/BlockchainExplorer';

const DashboardOverview = () => {
  const {
    devices,
    readings,
    latestReading,
    loading,
    toggleDevice,
    initializeDevices,
    generateSampleReading
  } = useIoTData();

  const [memoryStats, setMemoryStats] = useState({
    active: 0,
    archived: 0,
    dead: 0,
    totalSize: 0,
    averageCognitiveScore: 0,
  });

  useEffect(() => {
    loadMemoryStats();
    
    const handleUpdate = () => loadMemoryStats();
    window.addEventListener('memoryLifecycleUpdate', handleUpdate);
    
    return () => window.removeEventListener('memoryLifecycleUpdate', handleUpdate);
  }, []);

  const loadMemoryStats = async () => {
    try {
      const stats = await fetchMemoryStats();
      setMemoryStats(stats);
    } catch (error) {
      console.error('Error loading memory stats:', error);
    }
  };

  const totalNodes = memoryStats.active + memoryStats.archived + memoryStats.dead;

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'fan': return Fan;
      case 'pump': return Droplet;
      case 'light': return Lightbulb;
      case 'heater': return Flame;
      default: return Fan;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Smart Home Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time IoT monitoring and control for your smart home
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={generateSampleReading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            New Reading
          </Button>
        </div>
      </div>

      {/* Sensor Overview Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : latestReading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SensorCard
            title="Temperature"
            value={latestReading.temperature}
            unit="°C"
            icon={Thermometer}
            iconColor="text-neon-blue"
          />
          <SensorCard
            title="Humidity"
            value={latestReading.humidity}
            unit="%"
            icon={Droplets}
            iconColor="text-neon-cyan"
          />
          <SensorCard
            title="Soil Moisture"
            value={latestReading.soil_moisture}
            unit="%"
            icon={Sprout}
            iconColor="text-neon-green"
          />
          <SensorCard
            title="Light Level"
            value={latestReading.light_level}
            unit="Lux"
            icon={Sun}
            iconColor="text-neon-purple"
          />
        </div>
      ) : (
        <Card className="bg-card border-glass-border">
          <CardHeader>
            <CardTitle>No Sensor Data</CardTitle>
            <CardDescription>
              Click "New Reading" to generate sample sensor data
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Device Controls */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Device Controls
        </h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : devices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {devices.map(device => (
              <DeviceControl
                key={device.id}
                deviceName={device.device_name}
                deviceType={device.device_type}
                isActive={device.is_active}
                icon={getDeviceIcon(device.device_type)}
                onToggle={() => toggleDevice(device.id, device.is_active)}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-card border-glass-border">
            <CardHeader>
              <CardTitle>No Devices Found</CardTitle>
              <CardDescription>
                Click "Setup Devices" to create your default IoT devices
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Sensor Chart */}
      {readings.length > 0 && (
        <SensorChart readings={readings} />
      )}

      {/* Blockchain Memory Management Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          AmnesiaChain Blockchain
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="bg-card-glass backdrop-blur-md border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Nodes</p>
                  <p className="text-2xl font-bold text-foreground">{totalNodes}</p>
                </div>
                <Database className="h-8 w-8 text-neon-blue" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card-glass backdrop-blur-md border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Nodes</p>
                  <p className="text-2xl font-bold text-neon-green">{memoryStats.active}</p>
                </div>
                <Activity className="h-8 w-8 text-neon-green" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card-glass backdrop-blur-md border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cognitive Score</p>
                  <p className="text-2xl font-bold text-neon-purple">
                    {(memoryStats.averageCognitiveScore * 100).toFixed(1)}%
                  </p>
                </div>
                <Zap className="h-8 w-8 text-neon-purple" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card-glass backdrop-blur-md border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Size</p>
                  <p className="text-2xl font-bold text-neon-cyan">{formatBytes(memoryStats.totalSize)}</p>
                </div>
                <HardDrive className="h-8 w-8 text-neon-cyan" />
              </div>
            </CardContent>
          </Card>
        </div>
        <MemoryControls />
      </div>

      {/* Blockchain Explorer Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Live Blockchain Activity
        </h2>
        <BlockchainExplorer />
      </div>

      {/* Status Information */}
      <Card className="bg-card-glass backdrop-blur-md border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Database className="h-5 w-5 text-neon-blue" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Active Devices</p>
              <p className="text-2xl font-bold text-foreground">
                {devices.filter(d => d.is_active).length} / {devices.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Readings</p>
              <p className="text-2xl font-bold text-foreground">{readings.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data Source</p>
              <p className="text-sm font-mono text-neon-cyan mt-1">Supabase Live</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export default DashboardOverview;