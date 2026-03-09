import { nanoid } from 'nanoid';
import { env as cfEnv } from 'cloudflare:workers';

export const COOKIE_NAME = 'session_id';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface SessionData {
    userId: string;
    createdAt: number;
}

export async function createSession(userId: string): Promise<string> {
    const sessionId = nanoid();
    const data: SessionData = { userId, createdAt: Date.now() };
    await cfEnv.SESSIONS.put(sessionId, JSON.stringify(data), {
        expirationTtl: SESSION_TTL_SECONDS,
    });
    return sessionId;
}

export async function validateSession(sessionId: string): Promise<SessionData | null> {
    const raw = await cfEnv.SESSIONS.get(sessionId);
    if (!raw) {
        return null;
    }
    return JSON.parse(raw) as SessionData;
}

export async function deleteSession(sessionId: string): Promise<void> {
    await cfEnv.SESSIONS.delete(sessionId);
}

export function createSessionCookie(sessionId: string): string {
    return `${COOKIE_NAME}=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function createLogoutCookie(): string {
    return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function getSessionIdFromRequest(request: Request): string | null {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
        return null;
    }
    const match = cookieHeader.split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (!match) {
        return null;
    }
    return match.slice(COOKIE_NAME.length + 1) || null;
}
