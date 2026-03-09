import { createFileRoute } from '@tanstack/react-router';
import { logApiAccess } from '@/lib/server/audit';
import { getSessionIdFromRequest, deleteSession, createLogoutCookie } from '@/lib/server/session';

function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return 'unknown';
}

export const Route = createFileRoute('/api/auth/logout')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const clientIP = getClientIP(request);
                await logApiAccess(clientIP, 'POST', '/api/auth/logout');

                const sessionId = getSessionIdFromRequest(request);
                if (sessionId) {
                    await deleteSession(sessionId);
                }

                return new Response(null, {
                    status: 204,
                    headers: {
                        'Set-Cookie': createLogoutCookie(),
                    },
                });
            },
        },
    },
});
