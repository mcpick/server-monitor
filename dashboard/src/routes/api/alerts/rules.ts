import { createFileRoute } from '@tanstack/react-router';
import { fetchAlertRules, createAlertRule } from '@/lib/server/db';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/server/middleware';
import { insertAlertRuleSchema, parseRequestBody } from '@/lib/server/validation';

export const Route = createFileRoute('/api/alerts/rules')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                // Verify authentication
                const auth = await verifyAuthToken(request);
                if (!auth) {
                    return unauthorizedResponse();
                }

                try {
                    const rules = await fetchAlertRules();
                    return Response.json(rules);
                } catch (error) {
                    console.error('Failed to fetch alert rules:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
            POST: async ({ request }) => {
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

                const parsed = parseRequestBody(insertAlertRuleSchema, rawBody);
                if (!parsed.success) {
                    return new Response(parsed.error, { status: 400 });
                }

                try {
                    const rule = await createAlertRule({
                        name: parsed.data.name,
                        metricType: parsed.data.metricType,
                        condition: parsed.data.condition,
                        threshold: parsed.data.threshold,
                        serverId: parsed.data.serverId ?? null,
                        enabled: parsed.data.enabled ?? true,
                    });
                    return Response.json(rule, { status: 201 });
                } catch (error) {
                    console.error('Failed to create alert rule:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
