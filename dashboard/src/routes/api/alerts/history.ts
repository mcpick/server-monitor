import { createFileRoute } from '@tanstack/react-router';
import { fetchAlertHistory } from '../../../lib/server/db';
import { verifyAuthToken, unauthorizedResponse } from '../../../lib/server/middleware';

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
                const startTime = url.searchParams.get('start');
                const endTime = url.searchParams.get('end');

                if (!startTime || !endTime) {
                    return new Response(
                        'Missing required parameters: start, end',
                        { status: 400 },
                    );
                }

                try {
                    const history = await fetchAlertHistory(
                        Number(startTime),
                        Number(endTime),
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
