import { createFileRoute } from '@tanstack/react-router';
import { logApiAccess } from '../../../lib/server/audit';

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

                // In a more sophisticated setup, you would invalidate the refresh token
                // by storing it in a blocklist or deleting it from a token store.
                // For now, we just log the logout event.
                await logApiAccess(clientIP, 'POST', '/api/auth/logout');

                return new Response(null, { status: 204 });
            },
        },
    },
});
