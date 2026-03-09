import { verifyAccessToken, type TokenPayload } from './jwt';
import { hashToken } from './token';
import { findServerByTokenHash } from './db';

export interface AuthContext {
    userId: string;
    payload: TokenPayload;
}

export interface IngestAuthContext {
    serverId: string;
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
 * Verify ingest token from a request by hashing and looking up in the database.
 * Returns the server context if valid, or null if invalid/missing.
 */
export async function verifyIngestToken(request: Request): Promise<IngestAuthContext | null> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.slice(7);
    const hash = await hashToken(token);
    const server = await findServerByTokenHash(hash);

    if (!server) {
        return null;
    }

    return { serverId: server.id };
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
