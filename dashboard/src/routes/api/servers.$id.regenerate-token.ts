import { createFileRoute } from '@tanstack/react-router';
import { regenerateServerToken, findServerById } from '@/lib/server/db';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/server/middleware';
import { generateServerToken, hashToken } from '@/lib/server/token';
import { uuidSchema } from '@/lib/server/validation';

export const Route = createFileRoute('/api/servers/$id/regenerate-token')({
    server: {
        handlers: {
            POST: async ({ request, params }) => {
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

                    const token = generateServerToken();
                    const tokenHash = await hashToken(token);
                    await regenerateServerToken(params.id, tokenHash);

                    return Response.json({ token });
                } catch (error) {
                    console.error('Failed to regenerate token:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
