import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the @libsql/client module
vi.mock('@libsql/client', () => ({
    createClient: vi.fn(),
}));

import { createClient } from '@libsql/client';
import {
    createTursoClient,
    fetchServers,
    fetchCPUMetrics,
    fetchMemoryMetrics,
    fetchSwapMetrics,
    fetchDiskUsageMetrics,
    fetchDiskIOMetrics,
    fetchNetworkMetrics,
    fetchProcessMetrics,
} from '../turso';

describe('turso', () => {
    const mockExecute = vi.fn();
    const mockClient = { execute: mockExecute };

    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv('VITE_TURSO_DATABASE_URL', 'libsql://test.turso.io');
        vi.stubEnv('VITE_TURSO_AUTH_TOKEN', 'test-token');
        vi.mocked(createClient).mockReturnValue(mockClient as never);
        mockExecute.mockReset();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    describe('createTursoClient', () => {
        it('creates client with environment variables', () => {
            createTursoClient();

            expect(createClient).toHaveBeenCalledWith({
                url: 'libsql://test.turso.io',
                authToken: 'test-token',
            });
        });

        it('returns same client instance on subsequent calls', () => {
            const client1 = createTursoClient();
            const client2 = createTursoClient();

            expect(client1).toBe(client2);
            expect(createClient).toHaveBeenCalledTimes(1);
        });
    });

    describe('fetchServers', () => {
        it('returns mapped server data', async () => {
            mockExecute.mockResolvedValue({
                rows: [
                    { id: 'server-1', hostname: 'web-01', created_at: 1700000000 },
                    { id: 'server-2', hostname: 'db-01', created_at: 1700000100 },
                ],
            });

            const servers = await fetchServers();

            expect(servers).toEqual([
                { id: 'server-1', hostname: 'web-01', created_at: 1700000000 },
                { id: 'server-2', hostname: 'db-01', created_at: 1700000100 },
            ]);
        });

        it('returns empty array when no servers', async () => {
            mockExecute.mockResolvedValue({ rows: [] });

            const servers = await fetchServers();

            expect(servers).toEqual([]);
        });
    });

    describe('fetchCPUMetrics', () => {
        it('fetches CPU metrics with correct query parameters', async () => {
            mockExecute.mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        server_id: 'server-1',
                        timestamp: 1700000000,
                        usage_percent: 45.5,
                        load_1m: 1.2,
                        load_5m: 1.5,
                        load_15m: 1.3,
                    },
                ],
            });

            const metrics = await fetchCPUMetrics('server-1', 1699999000, 1700001000);

            expect(mockExecute).toHaveBeenCalledWith({
                sql: expect.stringContaining('FROM cpu_metrics'),
                args: ['server-1', 1699999000, 1700001000],
            });
            expect(metrics).toHaveLength(1);
            expect(metrics[0].usage_percent).toBe(45.5);
        });
    });

    describe('fetchMemoryMetrics', () => {
        it('fetches memory metrics with correct mapping', async () => {
            mockExecute.mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        server_id: 'server-1',
                        timestamp: 1700000000,
                        total_bytes: 16000000000,
                        used_bytes: 8000000000,
                        available_bytes: 8000000000,
                        cached_bytes: 2000000000,
                    },
                ],
            });

            const metrics = await fetchMemoryMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].total_bytes).toBe(16000000000);
            expect(metrics[0].cached_bytes).toBe(2000000000);
        });
    });

    describe('fetchSwapMetrics', () => {
        it('fetches swap metrics with correct mapping', async () => {
            mockExecute.mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        server_id: 'server-1',
                        timestamp: 1700000000,
                        total_bytes: 8000000000,
                        used_bytes: 1000000000,
                        free_bytes: 7000000000,
                    },
                ],
            });

            const metrics = await fetchSwapMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].total_bytes).toBe(8000000000);
            expect(metrics[0].free_bytes).toBe(7000000000);
        });
    });

    describe('fetchDiskUsageMetrics', () => {
        it('fetches disk usage metrics with mount point', async () => {
            mockExecute.mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        server_id: 'server-1',
                        timestamp: 1700000000,
                        mount_point: '/',
                        total_bytes: 500000000000,
                        used_bytes: 250000000000,
                        free_bytes: 250000000000,
                    },
                ],
            });

            const metrics = await fetchDiskUsageMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].mount_point).toBe('/');
            expect(metrics[0].total_bytes).toBe(500000000000);
        });
    });

    describe('fetchDiskIOMetrics', () => {
        it('fetches disk IO metrics with device info', async () => {
            mockExecute.mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        server_id: 'server-1',
                        timestamp: 1700000000,
                        device: 'sda1',
                        read_bytes: 1000000,
                        write_bytes: 500000,
                        read_count: 100,
                        write_count: 50,
                    },
                ],
            });

            const metrics = await fetchDiskIOMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].device).toBe('sda1');
            expect(metrics[0].read_bytes).toBe(1000000);
        });
    });

    describe('fetchNetworkMetrics', () => {
        it('fetches network metrics with interface info', async () => {
            mockExecute.mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        server_id: 'server-1',
                        timestamp: 1700000000,
                        interface: 'eth0',
                        bytes_sent: 1000000,
                        bytes_recv: 2000000,
                        packets_sent: 1000,
                        packets_recv: 2000,
                    },
                ],
            });

            const metrics = await fetchNetworkMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].interface).toBe('eth0');
            expect(metrics[0].bytes_sent).toBe(1000000);
        });
    });

    describe('fetchProcessMetrics', () => {
        it('fetches process metrics with correct mapping', async () => {
            mockExecute.mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        server_id: 'server-1',
                        timestamp: 1700000000,
                        pid: 1234,
                        name: 'node',
                        cpu_percent: 25.5,
                        memory_percent: 12.3,
                    },
                ],
            });

            const metrics = await fetchProcessMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].pid).toBe(1234);
            expect(metrics[0].name).toBe('node');
            expect(metrics[0].cpu_percent).toBe(25.5);
        });
    });
});
