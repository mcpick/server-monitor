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
import type { CPUMetric } from '@/lib/schemas';

interface CPUChartProps {
    data: CPUMetric[];
}

export function CPUChart({ data }: CPUChartProps): ReactElement {
    const chartData = data.map((m) => ({
        time: m.timestamp * 1000,
        usage: m.usagePercent,
        load1m: m.load1m,
        load5m: m.load5m,
        load15m: m.load15m,
    }));

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
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    fontSize={12}
                />
                <Tooltip
                    labelFormatter={(ts) =>
                        format(new Date(ts as number), 'MMM d, HH:mm:ss')
                    }
                    formatter={(value) => `${(value as number).toFixed(1)}%`}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="usage"
                    name="CPU Usage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
