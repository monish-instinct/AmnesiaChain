-- Add sample IoT devices and sensor readings for demonstration

-- Insert sample smart home devices (using NULL for user_id since we removed the constraint)
INSERT INTO iot_devices (device_name, device_type, is_active, last_toggled_at) 
VALUES 
  ('Living Room Light', 'light', true, now() - interval '2 hours'),
  ('Smart Thermostat', 'thermostat', true, now() - interval '30 minutes'),
  ('Front Door Lock', 'lock', false, now() - interval '5 hours'),
  ('Garage Door', 'garage', false, now() - interval '8 hours'),
  ('Security Camera', 'camera', true, now() - interval '1 day'),
  ('Kitchen Fan', 'fan', false, now() - interval '3 hours'),
  ('Bedroom AC', 'ac', true, now() - interval '45 minutes'),
  ('Water Heater', 'heater', true, now() - interval '12 hours')
ON CONFLICT DO NOTHING;

-- Insert 24 hours of sensor readings (one per hour)
INSERT INTO sensor_readings (temperature, humidity, soil_moisture, light_level, recorded_at)
SELECT 
  (20 + (random() * 10))::numeric(5,2),
  (40 + (random() * 40))::numeric(5,2),
  (30 + (random() * 50))::numeric(5,2),
  (200 + (random() * 600))::numeric(7,2),
  now() - (interval '1 hour' * s.hour)
FROM generate_series(0, 23) AS s(hour)
ON CONFLICT DO NOTHING;