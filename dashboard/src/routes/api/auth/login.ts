import { createFileRoute } from '@tanstack/react-router';
import { verifyPassword, getAuthCredentials } from '../../../lib/server/auth';
import { generateAccessToken, generateRefreshToken } from '../../../lib/server/jwt';
import { checkRateLimit } from '../../../lib/server/rateLimit';
import { logAuthAttempt } from '../../../lib/server/audit';

interface LoginRequest {
    username: string;
    password: string;
}

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

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
                if (!credentials) {
                    console.error('Auth credentials not configured');
                    return new Response('Server configuration error', { status: 500 });
                }

                let body: LoginRequest;
                try {
                    body = (await request.json()) as LoginRequest;
                } catch {
                    return new Response('Invalid request body', { status: 400 });
                }

                if (!body.username || !body.password) {
                    await logAuthAttempt(clientIP, body.username || '', false, 'missing_credentials');
                    return new Response('Username and password are required', { status: 400 });
                }

                // Verify username
                if (body.username !== credentials.username) {
                    await logAuthAttempt(clientIP, body.username, false, 'invalid_username');
                    return new Response('Invalid credentials', { status: 401 });
                }

                // Verify password
                const isValid = await verifyPassword(body.password, credentials.passwordHash);
                if (!isValid) {
                    await logAuthAttempt(clientIP, body.username, false, 'invalid_password');
                    return new Response('Invalid credentials', { status: 401 });
                }

                // Generate tokens
                try {
                    const [accessToken, refreshToken] = await Promise.all([
                        generateAccessToken(body.username),
                        generateRefreshToken(body.username),
                    ]);

                    await logAuthAttempt(clientIP, body.username, true);

                    const response: LoginResponse = {
                        accessToken,
                        refreshToken,
                        expiresIn: 15 * 60, // 15 minutes in seconds
                    };

                    return Response.json(response);
                } catch (error) {
                    console.error('Failed to generate tokens:', error);
                    return new Response('Internal server error', { status: 500 });
                }
            },
        },
    },
});
