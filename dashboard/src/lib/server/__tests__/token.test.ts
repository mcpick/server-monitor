import { describe, it, expect } from 'vitest';
import { generateServerToken, hashToken } from '../token';

describe('token', () => {
    describe('generateServerToken', () => {
        it('returns a 64-char hex string', () => {
            const token = generateServerToken();

            expect(token).toHaveLength(64);
            expect(token).toMatch(/^[0-9a-f]{64}$/);
        });

        it('returns unique values on successive calls', () => {
            const token1 = generateServerToken();
            const token2 = generateServerToken();

            expect(token1).not.toBe(token2);
        });
    });

    describe('hashToken', () => {
        it('returns a 64-char hex string', async () => {
            const hash = await hashToken('test-token');

            expect(hash).toHaveLength(64);
            expect(hash).toMatch(/^[0-9a-f]{64}$/);
        });

        it('returns the same hash for the same input', async () => {
            const hash1 = await hashToken('deterministic-input');
            const hash2 = await hashToken('deterministic-input');

            expect(hash1).toBe(hash2);
        });

        it('returns different hashes for different inputs', async () => {
            const hash1 = await hashToken('input-a');
            const hash2 = await hashToken('input-b');

            expect(hash1).not.toBe(hash2);
        });
    });
});
