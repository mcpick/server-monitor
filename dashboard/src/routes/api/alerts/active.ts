import { createFileRoute } from '@tanstack/react-router';
import { fetchActiveAlerts } from '../../../lib/server/db';
import { verifyAuthToken, unauthorizedResponse } from '../../../lib/server/middleware';

export const Route = createFileRoute('/api/alerts/active')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                // Verify authentication
                const auth = await verifyAuthToken(request);
                if (!auth) {
                    return unauthorizedResponse();
                }

                try {
                    const alerts = await fetchActiveAlerts();
                    return Response.json(alerts);
                } catch (error) {
                    console.error('Failed to fetch active alerts:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
