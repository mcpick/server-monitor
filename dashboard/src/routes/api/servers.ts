import { createFileRoute } from '@tanstack/react-router';
import { fetchServers, createServer } from '@/lib/server/db';
import { verifyAuthToken, unauthorizedResponse } from '@/lib/server/middleware';
import { createServerSchema, parseRequestBody } from '@/lib/server/validation';
import { generateServerToken, hashToken } from '@/lib/server/token';
import type { ServerRegistration } from '@/lib/schemas';

export const Route = createFileRoute('/api/servers')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const auth = await verifyAuthToken(request);
                if (!auth) {
                    return unauthorizedResponse();
                }

                try {
                    const servers = await fetchServers();
                    return Response.json(servers);
                } catch (error) {
                    console.error('Failed to fetch servers:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
            POST: async ({ request }) => {
                const auth = await verifyAuthToken(request);
                if (!auth) {
                    return unauthorizedResponse();
                }

                let body: unknown;
                try {
                    body = await request.json();
                } catch {
                    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
                }

                const parsed = parseRequestBody(createServerSchema, body);
                if (!parsed.success) {
                    return Response.json({ error: parsed.error }, { status: 400 });
                }

                try {
                    const token = generateServerToken();
                    const tokenHash = await hashToken(token);
                    const id = await createServer(parsed.data.displayName, tokenHash);

                    const result = {
                        id,
                        displayName: parsed.data.displayName,
                        token,
                    } satisfies ServerRegistration;

                    return Response.json(result, { status: 201 });
                } catch (error) {
                    console.error('Failed to create server:', error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            },
        },
    },
});
