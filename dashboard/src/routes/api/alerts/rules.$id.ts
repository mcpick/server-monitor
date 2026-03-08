import { createFileRoute } from '@tanstack/react-router';
import { updateAlertRule, deleteAlertRule } from '../../../lib/server/db';
import { verifyAuthToken, unauthorizedResponse } from '../../../lib/server/middleware';
import type { AlertRule } from '../../../types/metrics';

export const Route = createFileRoute('/api/alerts/rules/$id')({
    server: {
        handlers: {
            PUT: async ({ request, params }) => {
                // Verify authentication
                const auth = await verifyAuthToken(request);
                if (!auth) {
                    return unauthorizedResponse();
                }

                try {
                    const body = (await request.json()) as Partial<
                        Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>
                    >;
                    await updateAlertRule(params.id, body);
                    return new Response(null, { status: 204 });
                } catch (error) {
                    console.error('Failed to update alert rule:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
            DELETE: async ({ request, params }) => {
                // Verify authentication
                const auth = await verifyAuthToken(request);
                if (!auth) {
                    return unauthorizedResponse();
                }

                try {
                    await deleteAlertRule(params.id);
                    return new Response(null, { status: 204 });
                } catch (error) {
                    console.error('Failed to delete alert rule:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
