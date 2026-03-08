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
import { verifyAuthToken, unauthorizedResponse } from '../../lib/server/middleware';

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
                // Verify authentication
                const auth = await verifyAuthToken(request);
                if (!auth) {
                    return unauthorizedResponse();
                }

                const url = new URL(request.url);
                const serverId = url.searchParams.get('server_id');
                let startTime = url.searchParams.get('start');
                let endTime = url.searchParams.get('end');

                if (!serverId) {
                    return new Response('Missing required parameter: server_id', { status: 400 });
                }

                // Default to last 1 hour if not specified
                const now = Math.floor(Date.now() / 1000);
                const oneHourAgo = now - 3600;
                
                if (!startTime) startTime = oneHourAgo.toString();
                if (!endTime) endTime = now.toString();

                const startTimeNum = Number(startTime);
                const endTimeNum = Number(endTime);

                // Validate time parameters
                if (isNaN(startTimeNum) || isNaN(endTimeNum)) {
                    return new Response('Invalid time format. Times must be Unix timestamps.', { status: 400 });
                }

                if (startTimeNum >= endTimeNum) {
                    return new Response('startTime must be before endTime', { status: 400 });
                }

                // Max range of 30 days (30 * 24 * 60 * 60 = 2592000 seconds)
                const maxRange = 30 * 24 * 60 * 60;
                if (endTimeNum - startTimeNum > maxRange) {
                    return new Response(
                        'Time range too large. Maximum range is 30 days.',
                        { status: 400 }
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
                    const metrics = await fetcher(serverId, startTimeNum, endTimeNum);
                    return Response.json(metrics);
                } catch (error) {
                    console.error(`Failed to fetch ${metricType} metrics:`, error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
