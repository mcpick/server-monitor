import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { login, logout, isAuthenticated, getAuthToken } from '../auth';

const ACCESS_TOKEN_KEY = 'server_monitor_access_token';
const REFRESH_TOKEN_KEY = 'server_monitor_refresh_token';
const TOKEN_EXPIRY_KEY = 'server_monitor_token_expiry';

describe('auth', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal('fetch', mockFetch);
        mockFetch.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('isAuthenticated', () => {
        it('returns false when no token is stored', () => {
            expect(isAuthenticated()).toBe(false);
        });

        it('returns true when a valid non-expired token is stored', () => {
            localStorage.setItem(ACCESS_TOKEN_KEY, 'valid-token');
            localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + 60000));
            expect(isAuthenticated()).toBe(true);
        });

        it('returns false when token is expired', () => {
            localStorage.setItem(ACCESS_TOKEN_KEY, 'valid-token');
            localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() - 60000));
            expect(isAuthenticated()).toBe(false);
        });
    });

    describe('getAuthToken', () => {
        it('returns null when no token is stored', () => {
            expect(getAuthToken()).toBeNull();
        });

        it('returns the token when stored', () => {
            localStorage.setItem(ACCESS_TOKEN_KEY, 'test-token');
            expect(getAuthToken()).toBe('test-token');
        });
    });

    describe('logout', () => {
        it('removes all auth tokens from localStorage', async () => {
            localStorage.setItem(ACCESS_TOKEN_KEY, 'test-token');
            localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token');
            localStorage.setItem(TOKEN_EXPIRY_KEY, '12345');

            mockFetch.mockResolvedValueOnce({ ok: true });

            await logout();

            expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
            expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
            expect(localStorage.getItem(TOKEN_EXPIRY_KEY)).toBeNull();
        });
    });

    describe('login', () => {
        it('returns false when API returns error', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

            const result = await login('admin', 'password');

            expect(result).toBe(false);
            expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'admin', password: 'password' }),
            });
        });

        it('returns true and stores tokens when credentials are correct', async () => {
            const mockResponse = {
                accessToken: 'access-token-123',
                refreshToken: 'refresh-token-456',
                expiresIn: 900,
            };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await login('admin', 'correct-password');

            expect(result).toBe(true);
            expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('access-token-123');
            expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-token-456');
            expect(localStorage.getItem(TOKEN_EXPIRY_KEY)).toBeTruthy();
        });

        it('returns false when fetch throws an error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await login('admin', 'password');

            expect(result).toBe(false);
        });
    });
});
