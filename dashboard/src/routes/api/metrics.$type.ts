import { createFileRoute } from '@tanstack/react-router';
import {
    fetchCPUMetrics,
    fetchMemoryMetrics,
    fetchSwapMetrics,
    fetchDiskUsageMetrics,
    fetchDiskIOMetrics,
    fetchNetworkMetrics,
    fetchProcessMetrics,
} from '../../lib/server/db';

type MetricTypeParam =
    | 'cpu'
    | 'memory'
    | 'swap'
    | 'disk-usage'
    | 'disk-io'
    | 'network'
    | 'process';

const metricFetchers: Record<
    MetricTypeParam,
    (serverId: string, startTime: number, endTime: number) => Promise<unknown[]>
> = {
    cpu: fetchCPUMetrics,
    memory: fetchMemoryMetrics,
    swap: fetchSwapMetrics,
    'disk-usage': fetchDiskUsageMetrics,
    'disk-io': fetchDiskIOMetrics,
    network: fetchNetworkMetrics,
    process: fetchProcessMetrics,
};

export const Route = createFileRoute('/api/metrics/$type')({
    server: {
        handlers: {
            GET: async ({ request, params }) => {
                const url = new URL(request.url);
                const serverId = url.searchParams.get('server_id');
                const startTime = url.searchParams.get('start');
                const endTime = url.searchParams.get('end');

                if (!serverId || !startTime || !endTime) {
                    return new Response(
                        'Missing required parameters: server_id, start, end',
                        { status: 400 },
                    );
                }

                const metricType = params.type as MetricTypeParam;
                const fetcher = metricFetchers[metricType];

                if (!fetcher) {
                    return new Response(
                        `Invalid metric type: ${metricType}. Valid types: ${Object.keys(metricFetchers).join(', ')}`,
                        { status: 400 },
                    );
                }

                try {
                    const metrics = await fetcher(
                        serverId,
                        Number(startTime),
                        Number(endTime),
                    );
                    return Response.json(metrics);
                } catch (error) {
                    console.error(`Failed to fetch ${metricType} metrics:`, error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
