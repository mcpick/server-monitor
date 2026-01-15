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
import type { NetworkMetric } from '../../types/metrics';

interface NetworkChartProps {
    data: NetworkMetric[];
}

function formatRate(bytesPerSecond: number): string {
    const mbps = bytesPerSecond / (1024 * 1024);
    if (mbps >= 1) {
        return `${mbps.toFixed(1)} MB/s`;
    }
    const kbps = bytesPerSecond / 1024;
    return `${kbps.toFixed(0)} KB/s`;
}

export function NetworkChart({ data }: NetworkChartProps): ReactElement {
    const byTimestamp = new Map<number, { sent: number; recv: number }>();

    for (const m of data) {
        const existing = byTimestamp.get(m.timestamp);
        if (existing) {
            existing.sent += m.bytes_sent;
            existing.recv += m.bytes_recv;
        } else {
            byTimestamp.set(m.timestamp, {
                sent: m.bytes_sent,
                recv: m.bytes_recv,
            });
        }
    }

    const timestamps = [...byTimestamp.keys()].sort((a, b) => a - b);
    const chartData: { time: number; sendRate: number; recvRate: number }[] =
        [];

    for (let i = 1; i < timestamps.length; i++) {
        const curr = byTimestamp.get(timestamps[i])!;
        const prev = byTimestamp.get(timestamps[i - 1])!;
        const timeDiff = timestamps[i] - timestamps[i - 1];

        if (timeDiff > 0) {
            chartData.push({
                time: timestamps[i] * 1000,
                sendRate: Math.max(0, (curr.sent - prev.sent) / timeDiff),
                recvRate: Math.max(0, (curr.recv - prev.recv) / timeDiff),
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
                    dataKey="recvRate"
                    name="Received"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="sendRate"
                    name="Sent"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
