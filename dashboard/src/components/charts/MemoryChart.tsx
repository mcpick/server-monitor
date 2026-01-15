import type { ReactElement } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import type { MemoryMetric } from '../../types/metrics';

interface MemoryChartProps {
  data: MemoryMetric[];
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

export function MemoryChart({ data }: MemoryChartProps): ReactElement {
  const chartData = data.map((m) => ({
    time: m.timestamp * 1000,
    used: m.used_bytes / (1024 * 1024 * 1024),
    cached: (m.cached_bytes || 0) / (1024 * 1024 * 1024),
    available: m.available_bytes / (1024 * 1024 * 1024),
    total: m.total_bytes / (1024 * 1024 * 1024),
  }));

  const maxTotal = Math.max(...chartData.map((d) => d.total), 1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          tickFormatter={(ts) => format(new Date(ts), 'HH:mm')}
          fontSize={12}
        />
        <YAxis
          domain={[0, maxTotal]}
          tickFormatter={(v) => `${v.toFixed(0)} GB`}
          fontSize={12}
        />
        <Tooltip
          labelFormatter={(ts) => format(new Date(ts as number), 'MMM d, HH:mm:ss')}
          formatter={(value) => formatBytes((value as number) * 1024 * 1024 * 1024)}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="used"
          name="Used"
          stackId="1"
          stroke="#ef4444"
          fill="#fca5a5"
        />
        <Area
          type="monotone"
          dataKey="cached"
          name="Cached"
          stackId="1"
          stroke="#f59e0b"
          fill="#fcd34d"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
