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
import type { SwapMetric } from '../../types/metrics';

interface SwapChartProps {
  data: SwapMetric[];
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) {
    return `${gb.toFixed(1)} GB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

export function SwapChart({ data }: SwapChartProps): ReactElement {
  const chartData = data.map((m) => ({
    time: m.timestamp * 1000,
    used: m.used_bytes / (1024 * 1024 * 1024),
    free: m.free_bytes / (1024 * 1024 * 1024),
    total: m.total_bytes / (1024 * 1024 * 1024),
  }));

  const maxTotal = Math.max(...chartData.map((d) => d.total), 0.1);

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
          tickFormatter={(v) => `${v.toFixed(1)} GB`}
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
          stroke="#8b5cf6"
          fill="#c4b5fd"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
