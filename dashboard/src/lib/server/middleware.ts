import { verifyAccessToken, type TokenPayload } from './jwt';
import { env } from './env';

export interface AuthContext {
    userId: string;
    payload: TokenPayload;
}

/**
 * Extract and verify the access token from a request.
 * Returns the token payload if valid, or null if invalid/missing.
 */
export async function verifyAuthToken(request: Request): Promise<AuthContext | null> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    try {
        const payload = await verifyAccessToken(token);
        if (!payload.sub) {
            return null;
        }
        return { userId: payload.sub, payload };
    } catch {
        return null;
    }
}

/**
 * Verify ingest API key from a request.
 * Returns true if the Bearer token matches INGEST_API_KEY.
 */
export function verifyIngestToken(request: Request): boolean {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }

    const token = authHeader.slice(7);
    return token === env.INGEST_API_KEY;
}

/**
 * Create an unauthorized response.
 */
export function unauthorizedResponse(message = 'Unauthorized'): Response {
    return new Response(message, {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Bearer',
        },
    });
}
