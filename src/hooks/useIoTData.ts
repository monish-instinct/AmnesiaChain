import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IoTDevice {
  id: string;
  user_id: string;
  device_name: string;
  device_type: string;
  is_active: boolean;
  last_toggled_at: string;
  created_at: string;
  updated_at: string;
}

export interface SensorReading {
  id: string;
  user_id: string;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  light_level: number;
  recorded_at: string;
  created_at: string;
}

export const useIoTData = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch devices (no auth required - using permissive RLS)
  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .select('*')
        .order('device_name');

      if (error) throw error;
      setDevices(data || []);
    } catch (error: any) {
      console.error('Error fetching devices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load devices',
        variant: 'destructive'
      });
    }
  };

  // Fetch sensor readings (last 24 hours - no auth required)
  const fetchReadings = async () => {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .gte('recorded_at', oneDayAgo.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setReadings(data || []);
      if (data && data.length > 0) {
        setLatestReading(data[0]);
      }
    } catch (error: any) {
      console.error('Error fetching readings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sensor data',
        variant: 'destructive'
      });
    }
  };

  // Initialize data
  const initializeData = async () => {
    setLoading(true);
    await Promise.all([fetchDevices(), fetchReadings()]);
    setLoading(false);
  };

  // Toggle device
  const toggleDevice = async (deviceId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('iot_devices')
        .update({
          is_active: !currentState,
          last_toggled_at: new Date().toISOString()
        })
        .eq('id', deviceId);

      if (error) throw error;

      await fetchDevices();
      
      toast({
        title: 'Success',
        description: 'Device state updated'
      });
    } catch (error: any) {
      console.error('Error toggling device:', error);
      toast({
        title: 'Error',
        description: 'Failed to update device',
        variant: 'destructive'
      });
    }
  };

  // Initialize devices for new users (no auth required)
  const initializeDevices = async () => {
    try {
      // Since we have sample data already, just refresh
      await fetchDevices();
      
      toast({
        title: 'Success',
        description: 'Devices loaded successfully'
      });
    } catch (error: any) {
      console.error('Error initializing devices:', error);
    }
  };

  // Generate sample reading (no auth required)
  const generateSampleReading = async () => {
    try {
      const newReading = {
        temperature: Number((20 + Math.random() * 10).toFixed(2)),
        humidity: Number((40 + Math.random() * 40).toFixed(2)),
        soil_moisture: Number((30 + Math.random() * 50).toFixed(2)),
        light_level: Number((200 + Math.random() * 600).toFixed(2)),
        recorded_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('sensor_readings')
        .insert([newReading]);

      if (error) throw error;
      await fetchReadings();
      
      toast({
        title: 'Success',
        description: 'New sensor reading generated'
      });
    } catch (error: any) {
      console.error('Error generating reading:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate reading',
        variant: 'destructive'
      });
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    initializeData();

    // Subscribe to device changes
    const devicesChannel = supabase
      .channel('iot_devices_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'iot_devices'
        },
        () => {
          fetchDevices();
        }
      )
      .subscribe();

    // Subscribe to sensor readings
    const readingsChannel = supabase
      .channel('sensor_readings_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings'
        },
        () => {
          fetchReadings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(devicesChannel);
      supabase.removeChannel(readingsChannel);
    };
  }, []);

  return {
    devices,
    readings,
    latestReading,
    loading,
    toggleDevice,
    initializeDevices,
    generateSampleReading,
    refreshData: initializeData
  };
};
