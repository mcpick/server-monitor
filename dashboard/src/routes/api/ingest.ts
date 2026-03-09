import { createFileRoute } from '@tanstack/react-router';
import { verifyIngestToken, unauthorizedResponse } from '@/lib/server/middleware';
import { ingestPayloadSchema, parseRequestBody } from '@/lib/server/validation';
import {
    upsertServer,
    insertCpuMetric,
    insertMemoryMetric,
    insertSwapMetric,
    insertDiskUsageMetrics,
    insertDiskIOMetrics,
    insertNetworkMetrics,
    insertProcessMetrics,
} from '@/lib/server/db';

export const Route = createFileRoute('/api/ingest')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                if (!verifyIngestToken(request)) {
                    return unauthorizedResponse();
                }

                let body: unknown;
                try {
                    body = await request.json();
                } catch {
                    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
                }

                const parsed = parseRequestBody(ingestPayloadSchema, body);
                if (!parsed.success) {
                    return Response.json({ error: parsed.error }, { status: 400 });
                }

                const { serverId, hostname, timestamp, cpu, memory, swap, diskUsage, diskIO, network, processes } =
                    parsed.data;

                try {
                    await upsertServer(serverId, hostname);

                    if (cpu) {
                        await insertCpuMetric(serverId, timestamp, cpu);
                    }
                    if (memory) {
                        await insertMemoryMetric(serverId, timestamp, memory);
                    }
                    if (swap) {
                        await insertSwapMetric(serverId, timestamp, swap);
                    }
                    if (diskUsage) {
                        await insertDiskUsageMetrics(serverId, timestamp, diskUsage);
                    }
                    if (diskIO) {
                        await insertDiskIOMetrics(serverId, timestamp, diskIO);
                    }
                    if (network) {
                        await insertNetworkMetrics(serverId, timestamp, network);
                    }
                    if (processes) {
                        await insertProcessMetrics(serverId, timestamp, processes);
                    }

                    return Response.json({ ok: true });
                } catch (error) {
                    console.error('Failed to ingest metrics:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
