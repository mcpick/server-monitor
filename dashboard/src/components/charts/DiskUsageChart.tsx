import type { ReactElement } from 'react';
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
import type { DiskUsageMetric } from '@/lib/schemas';
import { formatBytes } from '@/lib/formatting';

interface DiskUsageChartProps {
    data: DiskUsageMetric[];
}

export function DiskUsageChart({ data }: DiskUsageChartProps): ReactElement {
    const latestByMount = new Map<string, DiskUsageMetric>();
    for (const m of data) {
        const existing = latestByMount.get(m.mountPoint);
        if (!existing || m.timestamp > existing.timestamp) {
            latestByMount.set(m.mountPoint, m);
        }
    }

    const chartData = Array.from(latestByMount.values()).map((m) => ({
        mount: m.mountPoint,
        used: m.usedBytes / (1024 * 1024 * 1024),
        free: m.freeBytes / (1024 * 1024 * 1024),
        total: m.totalBytes / (1024 * 1024 * 1024),
        usedPercent: (m.usedBytes / m.totalBytes) * 100,
    }));

    function getBarColor(percent: number): string {
        if (percent >= 90) return '#ef4444';
        if (percent >= 75) return '#f59e0b';
        return '#22c55e';
    }

    return (
        <ResponsiveContainer
            width="100%"
            height={300}
        >
            <BarChart
                data={chartData}
                layout="vertical"
            >
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
                    formatter={(value) =>
                        formatBytes((value as number) * 1024 * 1024 * 1024)
                    }
                />
                <Legend />
                <Bar
                    dataKey="used"
                    name="Used"
                    stackId="a"
                >
                    {chartData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={getBarColor(entry.usedPercent)}
                        />
                    ))}
                </Bar>
                <Bar
                    dataKey="free"
                    name="Free"
                    stackId="a"
                    fill="#d1d5db"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
