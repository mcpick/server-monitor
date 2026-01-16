import { createFileRoute } from '@tanstack/react-router';
import { fetchAlertRules, createAlertRule } from '../../../lib/server/db';
import type { AlertRule } from '../../../types/metrics';

export const Route = createFileRoute('/api/alerts/rules')({
    server: {
        handlers: {
            GET: async () => {
                try {
                    const rules = await fetchAlertRules();
                    return Response.json(rules);
                } catch (error) {
                    console.error('Failed to fetch alert rules:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
            POST: async ({ request }) => {
                try {
                    const body = (await request.json()) as Omit<
                        AlertRule,
                        'id' | 'created_at' | 'updated_at'
                    >;

                    if (
                        !body.name ||
                        !body.metric_type ||
                        !body.condition ||
                        body.threshold === undefined
                    ) {
                        return new Response(
                            'Missing required fields: name, metric_type, condition, threshold',
                            { status: 400 },
                        );
                    }

                    const rule = await createAlertRule(body);
                    return Response.json(rule, { status: 201 });
                } catch (error) {
                    console.error('Failed to create alert rule:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
