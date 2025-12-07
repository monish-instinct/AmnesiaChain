import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SensorReading } from '@/hooks/useIoTData';
import { format } from 'date-fns';

interface SensorChartProps {
  readings: SensorReading[];
}

export const SensorChart = ({ readings }: SensorChartProps) => {
  const chartData = readings
    .slice()
    .reverse()
    .map(reading => ({
      time: format(new Date(reading.recorded_at), 'HH:mm'),
      temperature: Number(reading.temperature),
      humidity: Number(reading.humidity),
      soil: Number(reading.soil_moisture),
      light: Number(reading.light_level) / 10 // Scale down for visibility
    }));

  return (
    <Card className="bg-card border-glass-border">
      <CardHeader>
        <CardTitle className="text-foreground">Sensor Readings (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="hsl(var(--neon-blue))" 
              strokeWidth={2}
              name="Temp (°C)"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="humidity" 
              stroke="hsl(var(--neon-cyan))" 
              strokeWidth={2}
              name="Humidity (%)"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="soil" 
              stroke="hsl(var(--neon-green))" 
              strokeWidth={2}
              name="Soil (%)"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="light" 
              stroke="hsl(var(--neon-purple))" 
              strokeWidth={2}
              name="Light (x10 Lux)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
