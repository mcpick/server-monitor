import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { login, logout } from '../auth';

describe('auth', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', mockFetch);
        mockFetch.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
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

        it('returns true when credentials are correct', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true });

            const result = await login('admin', 'correct-password');

            expect(result).toBe(true);
        });

        it('returns false when fetch throws an error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await login('admin', 'password');

            expect(result).toBe(false);
        });
    });

    describe('logout', () => {
        it('calls logout endpoint', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true });

            await logout();

            expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
        });

        it('does not throw when logout API fails', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(logout()).resolves.toBeUndefined();
        });
    });
});
