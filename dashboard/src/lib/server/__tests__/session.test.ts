import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('cloudflare:workers', () => ({
    env: {
        SESSIONS: {
            put: vi.fn(),
            get: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

vi.mock('nanoid', () => ({
    nanoid: vi.fn(() => 'mock-session-id-12345'),
}));

import { env as cfEnv } from 'cloudflare:workers';
import {
    createSession,
    validateSession,
    deleteSession,
    createSessionCookie,
    createLogoutCookie,
    getSessionIdFromRequest,
} from '../session';

const mockKV = cfEnv.SESSIONS as unknown as {
    put: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
};

describe('session', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('createSession', () => {
        it('creates a session in KV with 7-day TTL', async () => {
            const sessionId = await createSession('test-user');

            expect(sessionId).toBe('mock-session-id-12345');
            expect(mockKV.put).toHaveBeenCalledWith(
                'mock-session-id-12345',
                expect.stringContaining('"userId":"test-user"'),
                { expirationTtl: 7 * 24 * 60 * 60 },
            );
        });
    });

    describe('validateSession', () => {
        it('returns session data for valid session', async () => {
            const sessionData = { userId: 'test-user', createdAt: 1700000000 };
            mockKV.get.mockResolvedValueOnce(JSON.stringify(sessionData));

            const result = await validateSession('valid-session');

            expect(result).toEqual(sessionData);
            expect(mockKV.get).toHaveBeenCalledWith('valid-session');
        });

        it('returns null for invalid session', async () => {
            mockKV.get.mockResolvedValueOnce(null);

            const result = await validateSession('invalid-session');

            expect(result).toBeNull();
        });
    });

    describe('deleteSession', () => {
        it('deletes session from KV', async () => {
            await deleteSession('session-to-delete');

            expect(mockKV.delete).toHaveBeenCalledWith('session-to-delete');
        });
    });

    describe('createSessionCookie', () => {
        it('returns a Set-Cookie string with correct attributes', () => {
            const cookie = createSessionCookie('session-123');

            expect(cookie).toContain('session_id=session-123');
            expect(cookie).toContain('HttpOnly');
            expect(cookie).toContain('Secure');
            expect(cookie).toContain('SameSite=Lax');
            expect(cookie).toContain('Path=/');
            expect(cookie).toContain('Max-Age=604800');
        });
    });

    describe('createLogoutCookie', () => {
        it('returns a Set-Cookie string that clears the cookie', () => {
            const cookie = createLogoutCookie();

            expect(cookie).toContain('session_id=');
            expect(cookie).toContain('Max-Age=0');
            expect(cookie).toContain('HttpOnly');
        });
    });

    describe('getSessionIdFromRequest', () => {
        it('returns null when no Cookie header', () => {
            const request = new Request('http://localhost');

            const result = getSessionIdFromRequest(request);

            expect(result).toBeNull();
        });

        it('returns null when session_id cookie is not present', () => {
            const request = new Request('http://localhost', {
                headers: { Cookie: 'other=value' },
            });

            const result = getSessionIdFromRequest(request);

            expect(result).toBeNull();
        });

        it('returns session ID from cookie', () => {
            const request = new Request('http://localhost', {
                headers: { Cookie: 'session_id=abc123; other=value' },
            });

            const result = getSessionIdFromRequest(request);

            expect(result).toBe('abc123');
        });

        it('returns session ID when it is the only cookie', () => {
            const request = new Request('http://localhost', {
                headers: { Cookie: 'session_id=xyz789' },
            });

            const result = getSessionIdFromRequest(request);

            expect(result).toBe('xyz789');
        });

        it('returns null when session_id cookie has empty value', () => {
            const request = new Request('http://localhost', {
                headers: { Cookie: 'session_id=' },
            });

            const result = getSessionIdFromRequest(request);

            expect(result).toBeNull();
        });
    });
});
