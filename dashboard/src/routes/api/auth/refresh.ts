import { createFileRoute } from '@tanstack/react-router';
import {
    verifyRefreshToken,
    generateAccessToken,
    generateRefreshToken,
} from '../../../lib/server/jwt';

interface RefreshRequest {
    refreshToken: string;
}

interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export const Route = createFileRoute('/api/auth/refresh')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                let body: RefreshRequest;
                try {
                    body = (await request.json()) as RefreshRequest;
                } catch {
                    return new Response('Invalid request body', { status: 400 });
                }

                if (!body.refreshToken) {
                    return new Response('Refresh token is required', { status: 400 });
                }

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

                    const response: RefreshResponse = {
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
