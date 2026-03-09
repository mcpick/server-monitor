// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('../env', () => ({
    env: {
        JWT_SECRET: 'test-jwt-secret-that-is-long-enough-for-hs256',
    },
}));

import {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    verifyAccessToken,
    verifyRefreshToken,
} from '../jwt';

describe('jwt', () => {
    describe('generateAccessToken', () => {
        it('produces a valid JWT string', async () => {
            const token = await generateAccessToken('user-123');

            expect(token).toBeTruthy();
            expect(token.split('.')).toHaveLength(3);
        });
    });

    describe('generateRefreshToken', () => {
        it('produces a valid JWT string', async () => {
            const token = await generateRefreshToken('user-123');

            expect(token).toBeTruthy();
            expect(token.split('.')).toHaveLength(3);
        });
    });

    describe('verifyToken', () => {
        it('verifies a valid access token', async () => {
            const token = await generateAccessToken('user-123');
            const payload = await verifyToken(token);

            expect(payload.sub).toBe('user-123');
            expect(payload.type).toBe('access');
        });

        it('verifies a valid refresh token', async () => {
            const token = await generateRefreshToken('user-456');
            const payload = await verifyToken(token);

            expect(payload.sub).toBe('user-456');
            expect(payload.type).toBe('refresh');
        });

        it('rejects tampered tokens', async () => {
            const token = await generateAccessToken('user-123');
            const tampered = token.slice(0, -5) + 'XXXXX';

            await expect(verifyToken(tampered)).rejects.toThrow();
        });

        it('rejects completely invalid tokens', async () => {
            await expect(verifyToken('not-a-jwt')).rejects.toThrow();
        });
    });

    describe('verifyAccessToken', () => {
        it('accepts access tokens', async () => {
            const token = await generateAccessToken('user-123');
            const payload = await verifyAccessToken(token);

            expect(payload.sub).toBe('user-123');
            expect(payload.type).toBe('access');
        });

        it('rejects refresh tokens', async () => {
            const token = await generateRefreshToken('user-123');

            await expect(verifyAccessToken(token)).rejects.toThrow('Invalid token type');
        });
    });

    describe('verifyRefreshToken', () => {
        it('accepts refresh tokens', async () => {
            const token = await generateRefreshToken('user-123');
            const payload = await verifyRefreshToken(token);

            expect(payload.sub).toBe('user-123');
            expect(payload.type).toBe('refresh');
        });

        it('rejects access tokens', async () => {
            const token = await generateAccessToken('user-123');

            await expect(verifyRefreshToken(token)).rejects.toThrow('Invalid token type');
        });
    });
});
