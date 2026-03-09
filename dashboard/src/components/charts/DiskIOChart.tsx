import type { ReactElement } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { format } from 'date-fns';
import type { DiskIOMetric } from '../../types/metrics';
import { formatRate } from '@/lib/formatting';

interface DiskIOChartProps {
    data: DiskIOMetric[];
}

export function DiskIOChart({ data }: DiskIOChartProps): ReactElement {
    const byTimestamp = new Map<number, { read: number; write: number }>();

    for (const m of data) {
        const existing = byTimestamp.get(m.timestamp);
        if (existing) {
            existing.read += m.read_bytes;
            existing.write += m.write_bytes;
        } else {
            byTimestamp.set(m.timestamp, {
                read: m.read_bytes,
                write: m.write_bytes,
            });
        }
    }

    const timestamps = [...byTimestamp.keys()].sort((a, b) => a - b);
    const chartData: { time: number; readRate: number; writeRate: number }[] =
        [];

    for (let i = 1; i < timestamps.length; i++) {
        const curr = byTimestamp.get(timestamps[i])!;
        const prev = byTimestamp.get(timestamps[i - 1])!;
        const timeDiff = timestamps[i] - timestamps[i - 1];

        if (timeDiff > 0) {
            chartData.push({
                time: timestamps[i] * 1000,
                readRate: Math.max(0, (curr.read - prev.read) / timeDiff),
                writeRate: Math.max(0, (curr.write - prev.write) / timeDiff),
            });
        }
    }

    return (
        <ResponsiveContainer
            width="100%"
            height={300}
        >
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="time"
                    tickFormatter={(ts) => format(new Date(ts), 'HH:mm')}
                    fontSize={12}
                />
                <YAxis
                    tickFormatter={(v) => formatRate(v)}
                    fontSize={12}
                />
                <Tooltip
                    labelFormatter={(ts) =>
                        format(new Date(ts as number), 'MMM d, HH:mm:ss')
                    }
                    formatter={(value) => formatRate(value as number)}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="readRate"
                    name="Read"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="writeRate"
                    name="Write"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
