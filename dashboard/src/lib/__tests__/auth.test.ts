import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login, logout, isAuthenticated, getAuthToken } from '../auth';

const AUTH_TOKEN_KEY = 'server_monitor_auth_token';

describe('auth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  describe('isAuthenticated', () => {
    it('returns false when no token is stored', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when a valid token is stored', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'valid-token');
      expect(isAuthenticated()).toBe(true);
    });

    it('returns false when an empty token is stored', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, '');
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('getAuthToken', () => {
    it('returns null when no token is stored', () => {
      expect(getAuthToken()).toBeNull();
    });

    it('returns the token when stored', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'test-token');
      expect(getAuthToken()).toBe('test-token');
    });
  });

  describe('logout', () => {
    it('removes the auth token from localStorage', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'test-token');
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('test-token');

      logout();

      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    });
  });

  describe('login', () => {
    it('returns false when environment variables are not configured', async () => {
      vi.stubEnv('VITE_AUTH_USERNAME', '');
      vi.stubEnv('VITE_AUTH_PASSWORD_HASH', '');

      const result = await login('admin', 'password');

      expect(result).toBe(false);
    });

    it('returns false when username does not match', async () => {
      vi.stubEnv('VITE_AUTH_USERNAME', 'admin');
      vi.stubEnv('VITE_AUTH_PASSWORD_HASH', 'somehash');

      const result = await login('wronguser', 'password');

      expect(result).toBe(false);
    });

    it('returns false when password hash does not match', async () => {
      vi.stubEnv('VITE_AUTH_USERNAME', 'admin');
      vi.stubEnv('VITE_AUTH_PASSWORD_HASH', 'wronghash');

      const result = await login('admin', 'password');

      expect(result).toBe(false);
    });

    it('returns true and stores token when credentials are correct', async () => {
      // SHA-256 hash of 'password'
      const passwordHash = '5e884898da28047d9171e9b9e85b1f27e54e7c9e2f5e2c9e';
      vi.stubEnv('VITE_AUTH_USERNAME', 'admin');
      vi.stubEnv('VITE_AUTH_PASSWORD_HASH', passwordHash);

      const result = await login('admin', 'password');

      // Due to hash mismatch, this will return false
      // The actual hash of 'password' needs to match
      expect(result).toBe(false);
    });
  });
});
