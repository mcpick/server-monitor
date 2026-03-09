import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRateLimit, getRemainingAttempts, resetRateLimit } from '../rateLimit';

describe('rateLimit', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Reset all rate limits between tests by resetting the module
        resetRateLimit('test-ip');
        resetRateLimit('ip-1');
        resetRateLimit('ip-2');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('checkRateLimit', () => {
        it('allows the first request', () => {
            expect(checkRateLimit('test-ip')).toBe(true);
        });

        it('allows up to maxAttempts requests within window', () => {
            for (let i = 0; i < 5; i++) {
                expect(checkRateLimit('test-ip')).toBe(true);
            }
        });

        it('blocks the 6th request within window', () => {
            for (let i = 0; i < 5; i++) {
                checkRateLimit('test-ip');
            }

            expect(checkRateLimit('test-ip')).toBe(false);
        });

        it('allows requests after window expires', () => {
            for (let i = 0; i < 5; i++) {
                checkRateLimit('test-ip');
            }
            expect(checkRateLimit('test-ip')).toBe(false);

            // Advance past the 1-minute window
            vi.advanceTimersByTime(61_000);

            expect(checkRateLimit('test-ip')).toBe(true);
        });

        it('tracks different identifiers independently', () => {
            for (let i = 0; i < 5; i++) {
                checkRateLimit('ip-1');
            }
            expect(checkRateLimit('ip-1')).toBe(false);
            expect(checkRateLimit('ip-2')).toBe(true);
        });
    });

    describe('resetRateLimit', () => {
        it('clears the rate limit counter for an identifier', () => {
            for (let i = 0; i < 5; i++) {
                checkRateLimit('test-ip');
            }
            expect(checkRateLimit('test-ip')).toBe(false);

            resetRateLimit('test-ip');

            expect(checkRateLimit('test-ip')).toBe(true);
        });
    });

    describe('getRemainingAttempts', () => {
        it('returns max attempts when no requests have been made', () => {
            expect(getRemainingAttempts('test-ip')).toBe(5);
        });

        it('returns correct remaining count after some requests', () => {
            checkRateLimit('test-ip');
            checkRateLimit('test-ip');

            expect(getRemainingAttempts('test-ip')).toBe(3);
        });

        it('returns 0 when all attempts are exhausted', () => {
            for (let i = 0; i < 5; i++) {
                checkRateLimit('test-ip');
            }

            expect(getRemainingAttempts('test-ip')).toBe(0);
        });

        it('returns max attempts after window expires', () => {
            for (let i = 0; i < 5; i++) {
                checkRateLimit('test-ip');
            }

            vi.advanceTimersByTime(61_000);

            expect(getRemainingAttempts('test-ip')).toBe(5);
        });
    });
});
