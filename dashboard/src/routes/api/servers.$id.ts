import { createFileRoute } from '@tanstack/react-router';
import { deleteServer, findServerById } from '@/lib/server/db';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/server/middleware';
import { uuidSchema } from '@/lib/server/validation';

export const Route = createFileRoute('/api/servers/$id')({
    server: {
        handlers: {
            DELETE: async ({ request, params }) => {
                const auth = await verifyAuthToken(request);
                if (!auth) {
                    return unauthorizedResponse();
                }

                const parsed = uuidSchema.safeParse(params.id);
                if (!parsed.success) {
                    return Response.json({ error: 'Invalid server ID format' }, { status: 400 });
                }

                try {
                    const server = await findServerById(params.id);
                    if (!server) {
                        return new Response('Server not found', { status: 404 });
                    }

                    await deleteServer(params.id);
                    return new Response(null, { status: 204 });
                } catch (error) {
                    console.error('Failed to delete server:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
