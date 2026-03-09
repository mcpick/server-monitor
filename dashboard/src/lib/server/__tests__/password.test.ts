// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../password';

describe('password', () => {
    describe('hashPassword', () => {
        it('produces pbkdf2:iterations:salt:hash format', async () => {
            const hash = await hashPassword('test-password');
            const parts = hash.split(':');

            expect(parts).toHaveLength(4);
            expect(parts[0]).toBe('pbkdf2');
            expect(parts[1]).toBe('100000');
            expect(parts[2]).toBeTruthy();
            expect(parts[3]).toBeTruthy();
        });

        it('produces different hashes for the same password (random salt)', async () => {
            const hash1 = await hashPassword('same-password');
            const hash2 = await hashPassword('same-password');

            expect(hash1).not.toBe(hash2);
        });

        it('produces different hashes for different passwords', async () => {
            const hash1 = await hashPassword('password-one');
            const hash2 = await hashPassword('password-two');

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('verifyPassword', () => {
        it('returns true for correct password', async () => {
            const hash = await hashPassword('correct-password');

            const result = await verifyPassword('correct-password', hash);

            expect(result).toBe(true);
        });

        it('returns false for wrong password', async () => {
            const hash = await hashPassword('correct-password');

            const result = await verifyPassword('wrong-password', hash);

            expect(result).toBe(false);
        });

        it('returns false for malformed hash string with wrong parts count', async () => {
            const result = await verifyPassword('password', 'pbkdf2:100000:salt');

            expect(result).toBe(false);
        });

        it('returns false for malformed hash string with wrong prefix', async () => {
            const result = await verifyPassword('password', 'bcrypt:100000:salt:hash');

            expect(result).toBe(false);
        });
    });
});
