import { createFileRoute } from '@tanstack/react-router';
import { verifyPassword, getAuthCredentials } from '@/lib/server/auth';
import { createSession, createSessionCookie } from '@/lib/server/session';
import { checkRateLimit } from '@/lib/server/rateLimit';
import { logAuthAttempt } from '@/lib/server/audit';
import { loginSchema, parseRequestBody } from '@/lib/server/validation';

function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return 'unknown';
}

export const Route = createFileRoute('/api/auth/login')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const clientIP = getClientIP(request);

                // Check rate limit
                if (!checkRateLimit(clientIP)) {
                    await logAuthAttempt(clientIP, '', false, 'rate_limited');
                    return new Response('Too many login attempts. Please try again later.', {
                        status: 429,
                        headers: {
                            'Retry-After': '60',
                        },
                    });
                }

                const credentials = getAuthCredentials();

                let rawBody: unknown;
                try {
                    rawBody = await request.json();
                } catch {
                    return new Response('Invalid request body', { status: 400 });
                }

                const parsed = parseRequestBody(loginSchema, rawBody);
                if (!parsed.success) {
                    await logAuthAttempt(clientIP, '', false, 'missing_credentials');
                    return new Response(parsed.error, { status: 400 });
                }
                const body = parsed.data;

                // Verify username
                if (body.username !== credentials.username) {
                    await logAuthAttempt(clientIP, body.username, false, 'invalid_username');
                    return new Response('Invalid credentials', { status: 401 });
                }

                // Verify password
                let isValid: boolean;
                try {
                    isValid = await verifyPassword(body.password, credentials.passwordHash);
                } catch (error) {
                    console.error('Password verification failed:', error);
                    return new Response('Internal server error', { status: 500 });
                }
                if (!isValid) {
                    await logAuthAttempt(clientIP, body.username, false, 'invalid_password');
                    return new Response('Invalid credentials', { status: 401 });
                }

                // Create session
                try {
                    const sessionId = await createSession(body.username);
                    await logAuthAttempt(clientIP, body.username, true);

                    return Response.json(
                        { success: true },
                        {
                            headers: {
                                'Set-Cookie': createSessionCookie(sessionId),
                            },
                        },
                    );
                } catch (error) {
                    console.error('Failed to create session:', error);
                    return new Response('Internal server error', { status: 500 });
                }
            },
        },
    },
});
