import { describe, it, expect } from 'vitest';
import {
    createServerSchema,
    loginSchema,
    refreshSchema,
    metricsQuerySchema,
    metricTypeSchema,
    parseRequestBody,
} from '../validation';

describe('validation', () => {
    describe('createServerSchema', () => {
        it('passes with valid display name', () => {
            const result = createServerSchema.safeParse({ displayName: 'My Server' });
            expect(result.success).toBe(true);
        });

        it('fails with empty string', () => {
            const result = createServerSchema.safeParse({ displayName: '' });
            expect(result.success).toBe(false);
        });

        it('fails with string over 100 chars', () => {
            const result = createServerSchema.safeParse({ displayName: 'a'.repeat(101) });
            expect(result.success).toBe(false);
        });

        it('fails with missing displayName', () => {
            const result = createServerSchema.safeParse({});
            expect(result.success).toBe(false);
        });
    });

    describe('loginSchema', () => {
        it('passes with valid username and password', () => {
            const result = loginSchema.safeParse({ username: 'admin', password: 'secret' });
            expect(result.success).toBe(true);
        });

        it('fails with empty username', () => {
            const result = loginSchema.safeParse({ username: '', password: 'secret' });
            expect(result.success).toBe(false);
        });

        it('fails with empty password', () => {
            const result = loginSchema.safeParse({ username: 'admin', password: '' });
            expect(result.success).toBe(false);
        });

        it('fails with missing fields', () => {
            const result = loginSchema.safeParse({});
            expect(result.success).toBe(false);
        });
    });

    describe('refreshSchema', () => {
        it('passes with valid refresh token', () => {
            const result = refreshSchema.safeParse({ refreshToken: 'token-123' });
            expect(result.success).toBe(true);
        });

        it('fails with empty token', () => {
            const result = refreshSchema.safeParse({ refreshToken: '' });
            expect(result.success).toBe(false);
        });
    });

    describe('metricsQuerySchema', () => {
        it('passes with required server_id', () => {
            const result = metricsQuerySchema.safeParse({ server_id: 'server-1' });
            expect(result.success).toBe(true);
        });

        it('passes with optional start and end', () => {
            const result = metricsQuerySchema.safeParse({
                server_id: 'server-1',
                start: 1700000000,
                end: 1700001000,
            });
            expect(result.success).toBe(true);
        });

        it('fails without server_id', () => {
            const result = metricsQuerySchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it('fails with empty server_id', () => {
            const result = metricsQuerySchema.safeParse({ server_id: '' });
            expect(result.success).toBe(false);
        });
    });

    describe('metricTypeSchema', () => {
        it.each(['cpu', 'memory', 'swap', 'disk-usage', 'disk-io', 'network', 'process'])(
            'passes for valid type "%s"',
            (type) => {
                const result = metricTypeSchema.safeParse(type);
                expect(result.success).toBe(true);
            },
        );

        it('fails for invalid type', () => {
            const result = metricTypeSchema.safeParse('invalid');
            expect(result.success).toBe(false);
        });
    });

    describe('parseRequestBody', () => {
        it('returns success with parsed data for valid input', () => {
            const result = parseRequestBody(loginSchema, { username: 'admin', password: 'secret' });

            expect(result).toEqual({ success: true, data: { username: 'admin', password: 'secret' } });
        });

        it('returns error for invalid input', () => {
            const result = parseRequestBody(loginSchema, { username: '', password: '' });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain('required');
            }
        });
    });
});
