import { createFileRoute } from '@tanstack/react-router';
import { updateAlertRule, deleteAlertRule } from '@/lib/server/db';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/server/middleware';
import { updateAlertRuleSchema, parseRequestBody } from '@/lib/server/validation';

export const Route = createFileRoute('/api/alerts/rules/$id')({
    server: {
        handlers: {
            PUT: async ({ request, params }) => {
                // Verify authentication
                const auth = await verifyAuthToken(request);
                if (!auth) {
                    return unauthorizedResponse();
                }

                let rawBody: unknown;
                try {
                    rawBody = await request.json();
                } catch {
                    return new Response('Invalid request body', { status: 400 });
                }

                const parsed = parseRequestBody(updateAlertRuleSchema, rawBody);
                if (!parsed.success) {
                    return new Response(parsed.error, { status: 400 });
                }

                try {
                    await updateAlertRule(params.id, {
                        name: parsed.data.name,
                        metricType: parsed.data.metricType,
                        condition: parsed.data.condition,
                        threshold: parsed.data.threshold,
                        serverId: parsed.data.serverId,
                        enabled: parsed.data.enabled,
                    });
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
