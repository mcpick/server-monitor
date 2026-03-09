import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyAuthToken, verifyIngestToken, unauthorizedResponse } from '../middleware';

vi.mock('../session', () => ({
    getSessionIdFromRequest: vi.fn(),
    validateSession: vi.fn(),
}));

vi.mock('../token', () => ({
    hashToken: vi.fn(),
}));

vi.mock('../db', () => ({
    findServerByTokenHash: vi.fn(),
}));

import { getSessionIdFromRequest, validateSession } from '../session';
import { hashToken } from '../token';
import { findServerByTokenHash } from '../db';

const mockGetSessionIdFromRequest = vi.mocked(getSessionIdFromRequest);
const mockValidateSession = vi.mocked(validateSession);
const mockHashToken = vi.mocked(hashToken);
const mockFindServerByTokenHash = vi.mocked(findServerByTokenHash);

describe('middleware', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('verifyAuthToken', () => {
        it('returns null when no session cookie is present', async () => {
            mockGetSessionIdFromRequest.mockReturnValue(null);
            const request = new Request('http://localhost/api/test');

            const result = await verifyAuthToken(request);

            expect(result).toBeNull();
        });

        it('returns null when session is invalid', async () => {
            mockGetSessionIdFromRequest.mockReturnValue('invalid-session');
            mockValidateSession.mockResolvedValueOnce(null);
            const request = new Request('http://localhost/api/test');

            const result = await verifyAuthToken(request);

            expect(result).toBeNull();
            expect(mockValidateSession).toHaveBeenCalledWith('invalid-session');
        });

        it('returns AuthContext for a valid session', async () => {
            mockGetSessionIdFromRequest.mockReturnValue('valid-session');
            mockValidateSession.mockResolvedValueOnce({
                userId: 'user-123',
                createdAt: Date.now(),
            });
            const request = new Request('http://localhost/api/test');

            const result = await verifyAuthToken(request);

            expect(result).toEqual({ userId: 'user-123' });
        });
    });

    describe('verifyIngestToken', () => {
        it('returns null when no Authorization header is present', async () => {
            const request = new Request('http://localhost/api/ingest');

            const result = await verifyIngestToken(request);

            expect(result).toBeNull();
        });

        it('returns null when token hash not found in database', async () => {
            mockHashToken.mockResolvedValueOnce('hashed-token');
            mockFindServerByTokenHash.mockResolvedValueOnce(undefined);
            const request = new Request('http://localhost/api/ingest', {
                headers: { Authorization: 'Bearer unknown-token' },
            });

            const result = await verifyIngestToken(request);

            expect(result).toBeNull();
            expect(mockHashToken).toHaveBeenCalledWith('unknown-token');
            expect(mockFindServerByTokenHash).toHaveBeenCalledWith('hashed-token');
        });

        it('returns server context when token is valid', async () => {
            mockHashToken.mockResolvedValueOnce('hashed-token');
            mockFindServerByTokenHash.mockResolvedValueOnce({
                id: 'server-1',
                hostname: 'web-01',
                displayName: 'Web Server',
                createdAt: 1700000000,
                lastSeenAt: 1700000000,
            });
            const request = new Request('http://localhost/api/ingest', {
                headers: { Authorization: 'Bearer valid-token' },
            });

            const result = await verifyIngestToken(request);

            expect(result).toEqual({ serverId: 'server-1' });
        });
    });

    describe('unauthorizedResponse', () => {
        it('returns a 401 response with WWW-Authenticate header', () => {
            const response = unauthorizedResponse();

            expect(response.status).toBe(401);
            expect(response.headers.get('WWW-Authenticate')).toBe('Bearer');
        });

        it('uses custom message when provided', async () => {
            const response = unauthorizedResponse('Custom error');

            expect(response.status).toBe(401);
            const body = await response.text();
            expect(body).toBe('Custom error');
        });

        it('uses default message when none provided', async () => {
            const response = unauthorizedResponse();

            const body = await response.text();
            expect(body).toBe('Unauthorized');
        });
    });
});
