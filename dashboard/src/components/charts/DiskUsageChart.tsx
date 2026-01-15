import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import type { DiskUsageMetric } from '../../types/metrics';

interface DiskUsageChartProps {
  data: DiskUsageMetric[];
}

function formatBytes(bytes: number): string {
  const tb = bytes / (1024 * 1024 * 1024 * 1024);
  if (tb >= 1) {
    return `${tb.toFixed(1)} TB`;
  }
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

export function DiskUsageChart({ data }: DiskUsageChartProps) {
  const latestByMount = new Map<string, DiskUsageMetric>();
  for (const m of data) {
    const existing = latestByMount.get(m.mount_point);
    if (!existing || m.timestamp > existing.timestamp) {
      latestByMount.set(m.mount_point, m);
    }
  }

  const chartData = Array.from(latestByMount.values()).map((m) => ({
    mount: m.mount_point,
    used: m.used_bytes / (1024 * 1024 * 1024),
    free: m.free_bytes / (1024 * 1024 * 1024),
    total: m.total_bytes / (1024 * 1024 * 1024),
    usedPercent: (m.used_bytes / m.total_bytes) * 100,
  }));

  const getBarColor = (percent: number) => {
    if (percent >= 90) return '#ef4444';
    if (percent >= 75) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          tickFormatter={(v) => `${v.toFixed(0)} GB`}
          fontSize={12}
        />
        <YAxis
          type="category"
          dataKey="mount"
          width={100}
          fontSize={12}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === 'used') return [formatBytes(value * 1024 * 1024 * 1024), 'Used'];
            return [formatBytes(value * 1024 * 1024 * 1024), 'Free'];
          }}
        />
        <Legend />
        <Bar dataKey="used" name="Used" stackId="a">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.usedPercent)} />
          ))}
        </Bar>
        <Bar dataKey="free" name="Free" stackId="a" fill="#d1d5db" />
      </BarChart>
    </ResponsiveContainer>
  );
}
