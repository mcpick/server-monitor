import { createFileRoute } from '@tanstack/react-router';
import { fetchAlertHistory } from '@/lib/server/db';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/server/middleware';
import { alertHistoryQuerySchema } from '@/lib/server/validation';

export const Route = createFileRoute('/api/alerts/history')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                // Verify authentication
                const auth = await verifyAuthToken(request);
                if (!auth) {
                    return unauthorizedResponse();
                }

                const url = new URL(request.url);
                const queryResult = alertHistoryQuerySchema.safeParse({
                    start: url.searchParams.get('start'),
                    end: url.searchParams.get('end'),
                });

                if (!queryResult.success) {
                    const messages = queryResult.error.issues.map((i) => i.message).join(', ');
                    return new Response(messages, { status: 400 });
                }

                try {
                    const history = await fetchAlertHistory(
                        queryResult.data.start,
                        queryResult.data.end,
                    );
                    return Response.json(history);
                } catch (error) {
                    console.error('Failed to fetch alert history:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
