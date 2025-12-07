-- Create IoT Devices Table
CREATE TABLE public.iot_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL, -- 'fan', 'pump', 'light', 'heater'
  is_active BOOLEAN DEFAULT false,
  last_toggled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Sensor Readings Table
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  temperature NUMERIC(5,2), -- Celsius
  humidity NUMERIC(5,2), -- Percentage
  soil_moisture NUMERIC(5,2), -- Percentage
  light_level NUMERIC(5,2), -- Lux
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for iot_devices
CREATE POLICY "Users can view own devices"
  ON public.iot_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
  ON public.iot_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
  ON public.iot_devices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON public.iot_devices FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for sensor_readings
CREATE POLICY "Users can view own readings"
  ON public.sensor_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own readings"
  ON public.sensor_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_iot_devices_user_id ON public.iot_devices(user_id);
CREATE INDEX idx_sensor_readings_user_id ON public.sensor_readings(user_id);
CREATE INDEX idx_sensor_readings_recorded_at ON public.sensor_readings(recorded_at DESC);

-- Trigger to update updated_at on iot_devices
CREATE TRIGGER update_iot_devices_updated_at
  BEFORE UPDATE ON public.iot_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to initialize default devices for new users
CREATE OR REPLACE FUNCTION public.initialize_default_iot_devices(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.iot_devices (user_id, device_name, device_type, is_active)
  VALUES
    (user_uuid, 'Exhaust Fan', 'fan', false),
    (user_uuid, 'Water Pump', 'pump', false),
    (user_uuid, 'Grow Lights', 'light', true),
    (user_uuid, 'Heater', 'heater', false);
END;
$$;

-- Function to generate sample sensor readings
CREATE OR REPLACE FUNCTION public.generate_sample_sensor_reading(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.sensor_readings (user_id, temperature, humidity, soil_moisture, light_level)
  VALUES (
    user_uuid,
    20 + (random() * 15), -- 20-35°C
    40 + (random() * 40), -- 40-80%
    30 + (random() * 50), -- 30-80%
    200 + (random() * 600) -- 200-800 Lux
  );
END;
$$;