import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyAuthToken, unauthorizedResponse } from '../middleware';

vi.mock('../jwt', () => ({
    verifyAccessToken: vi.fn(),
}));

import { verifyAccessToken } from '../jwt';

const mockVerifyAccessToken = vi.mocked(verifyAccessToken);

describe('middleware', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('verifyAuthToken', () => {
        it('returns null when no Authorization header is present', async () => {
            const request = new Request('http://localhost/api/test');

            const result = await verifyAuthToken(request);

            expect(result).toBeNull();
        });

        it('returns null when Authorization header does not start with Bearer', async () => {
            const request = new Request('http://localhost/api/test', {
                headers: { Authorization: 'Basic abc123' },
            });

            const result = await verifyAuthToken(request);

            expect(result).toBeNull();
        });

        it('returns null when token verification throws', async () => {
            mockVerifyAccessToken.mockRejectedValueOnce(new Error('Invalid token'));
            const request = new Request('http://localhost/api/test', {
                headers: { Authorization: 'Bearer invalid-token' },
            });

            const result = await verifyAuthToken(request);

            expect(result).toBeNull();
            expect(mockVerifyAccessToken).toHaveBeenCalledWith('invalid-token');
        });

        it('returns null when payload has no sub', async () => {
            mockVerifyAccessToken.mockResolvedValueOnce({
                type: 'access',
                sub: '',
            });
            const request = new Request('http://localhost/api/test', {
                headers: { Authorization: 'Bearer token-no-sub' },
            });

            const result = await verifyAuthToken(request);

            expect(result).toBeNull();
        });

        it('returns AuthContext for a valid token', async () => {
            const payload = { sub: 'user-123', type: 'access' as const };
            mockVerifyAccessToken.mockResolvedValueOnce(payload);
            const request = new Request('http://localhost/api/test', {
                headers: { Authorization: 'Bearer valid-token' },
            });

            const result = await verifyAuthToken(request);

            expect(result).toEqual({ userId: 'user-123', payload });
            expect(mockVerifyAccessToken).toHaveBeenCalledWith('valid-token');
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
