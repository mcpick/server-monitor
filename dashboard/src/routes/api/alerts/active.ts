import { createFileRoute } from '@tanstack/react-router';
import { fetchActiveAlerts } from '../../../lib/server/db';

export const Route = createFileRoute('/api/alerts/active')({
    server: {
        handlers: {
            GET: async () => {
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
