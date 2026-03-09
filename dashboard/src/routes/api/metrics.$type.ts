import { createFileRoute } from '@tanstack/react-router';
import {
    fetchCPUMetrics,
    fetchMemoryMetrics,
    fetchSwapMetrics,
    fetchDiskUsageMetrics,
    fetchDiskIOMetrics,
    fetchNetworkMetrics,
    fetchProcessMetrics,
} from '@/lib/server/db';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/server/middleware';
import { metricsQuerySchema, metricTypeSchema } from '@/lib/server/validation';
import type { z } from 'zod';

type MetricTypeParam = z.infer<typeof metricTypeSchema>;

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
} satisfies Record<MetricTypeParam, unknown>;

export const Route = createFileRoute('/api/metrics/$type')({
    server: {
        handlers: {
            GET: async ({ request, params }) => {
                // Verify authentication
                const auth = await verifyAuthToken(request);
                if (!auth) {
                    return unauthorizedResponse();
                }

                const typeResult = metricTypeSchema.safeParse(params.type);
                if (!typeResult.success) {
                    return new Response(
                        `Invalid metric type: ${params.type}. Valid types: ${metricTypeSchema.options.join(', ')}`,
                        { status: 400 },
                    );
                }
                const metricType = typeResult.data;
                const fetcher = metricFetchers[metricType];

                const url = new URL(request.url);
                const queryResult = metricsQuerySchema.safeParse({
                    server_id: url.searchParams.get('server_id'),
                    start: url.searchParams.get('start') || undefined,
                    end: url.searchParams.get('end') || undefined,
                });

                if (!queryResult.success) {
                    const messages = queryResult.error.issues.map((i) => i.message).join(', ');
                    return new Response(messages, { status: 400 });
                }

                const now = Math.floor(Date.now() / 1000);
                const startTimeNum = queryResult.data.start ?? now - 3600;
                const endTimeNum = queryResult.data.end ?? now;

                if (startTimeNum >= endTimeNum) {
                    return new Response('startTime must be before endTime', { status: 400 });
                }

                const maxRange = 30 * 24 * 60 * 60;
                if (endTimeNum - startTimeNum > maxRange) {
                    return new Response(
                        'Time range too large. Maximum range is 30 days.',
                        { status: 400 },
                    );
                }

                try {
                    const metrics = await fetcher(queryResult.data.server_id, startTimeNum, endTimeNum);
                    return Response.json(metrics);
                } catch (error) {
                    console.error(`Failed to fetch ${metricType} metrics:`, error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
