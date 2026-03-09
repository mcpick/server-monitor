import { createFileRoute } from '@tanstack/react-router';
import {
    verifyRefreshToken,
    generateAccessToken,
    generateRefreshToken,
} from '../../../lib/server/jwt';
import { refreshSchema, parseRequestBody } from '../../../lib/server/validation';

export const Route = createFileRoute('/api/auth/refresh')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                let rawBody: unknown;
                try {
                    rawBody = await request.json();
                } catch {
                    return new Response('Invalid request body', { status: 400 });
                }

                const parsed = parseRequestBody(refreshSchema, rawBody);
                if (!parsed.success) {
                    return new Response(parsed.error, { status: 400 });
                }
                const body = parsed.data;

                try {
                    const payload = await verifyRefreshToken(body.refreshToken);

                    if (!payload.sub) {
                        return new Response('Invalid token', { status: 401 });
                    }

                    // Generate new token pair (token rotation)
                    const [accessToken, refreshToken] = await Promise.all([
                        generateAccessToken(payload.sub),
                        generateRefreshToken(payload.sub),
                    ]);

                    const response = {
                        accessToken,
                        refreshToken,
                        expiresIn: 15 * 60, // 15 minutes in seconds
                    };

                    return Response.json(response);
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    return new Response('Invalid or expired refresh token', { status: 401 });
                }
            },
        },
    },
});
