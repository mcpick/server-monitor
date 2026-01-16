import { createFileRoute } from '@tanstack/react-router';
import { fetchServers } from '../../lib/server/db';

export const Route = createFileRoute('/api/servers')({
    server: {
        handlers: {
            GET: async () => {
                try {
                    const servers = await fetchServers();
                    return Response.json(servers);
                } catch (error) {
                    console.error('Failed to fetch servers:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
