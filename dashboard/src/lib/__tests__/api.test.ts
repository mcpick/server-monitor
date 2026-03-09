import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    fetchServers,
    fetchCPUMetrics,
    fetchMemoryMetrics,
    fetchSwapMetrics,
    fetchDiskUsageMetrics,
    fetchDiskIOMetrics,
    fetchNetworkMetrics,
    fetchProcessMetrics,
    fetchAlertRules,
    fetchActiveAlerts,
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
    createServer,
    deleteServer,
    regenerateServerToken,
} from '../api';

describe('API client', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', mockFetch);
        mockFetch.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('fetchServers', () => {
        it('returns mapped server data', async () => {
            const mockServers = [
                { id: 'server-1', hostname: 'web-01', createdAt: 1700000000, lastSeenAt: 1700000000 },
                { id: 'server-2', hostname: 'db-01', createdAt: 1700000100, lastSeenAt: 1700000100 },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockServers,
            });

            const servers = await fetchServers();

            expect(mockFetch).toHaveBeenCalledWith('/api/servers', undefined);
            expect(servers).toEqual(mockServers);
        });

        it('throws error when API fails', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });

            await expect(fetchServers()).rejects.toThrow('API request failed');
        });
    });

    describe('fetchCPUMetrics', () => {
        it('fetches CPU metrics with correct query parameters', async () => {
            const mockMetrics = [
                {
                    id: 1,
                    serverId: 'server-1',
                    timestamp: 1700000000,
                    usagePercent: 45.5,
                    load1m: 1.2,
                    load5m: 1.5,
                    load15m: 1.3,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchCPUMetrics('server-1', 1699999000, 1700001000);

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/metrics/cpu?server_id=server-1&start=1699999000&end=1700001000',
                undefined,
            );
            expect(metrics).toHaveLength(1);
            expect(metrics[0].usagePercent).toBe(45.5);
        });
    });

    describe('fetchMemoryMetrics', () => {
        it('fetches memory metrics with correct mapping', async () => {
            const mockMetrics = [
                {
                    id: 1,
                    serverId: 'server-1',
                    timestamp: 1700000000,
                    totalBytes: 16000000000,
                    usedBytes: 8000000000,
                    availableBytes: 8000000000,
                    cachedBytes: 2000000000,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchMemoryMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].totalBytes).toBe(16000000000);
            expect(metrics[0].cachedBytes).toBe(2000000000);
        });
    });

    describe('fetchSwapMetrics', () => {
        it('fetches swap metrics with correct mapping', async () => {
            const mockMetrics = [
                {
                    id: 1,
                    serverId: 'server-1',
                    timestamp: 1700000000,
                    totalBytes: 8000000000,
                    usedBytes: 1000000000,
                    freeBytes: 7000000000,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchSwapMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].totalBytes).toBe(8000000000);
            expect(metrics[0].freeBytes).toBe(7000000000);
        });
    });

    describe('fetchDiskUsageMetrics', () => {
        it('fetches disk usage metrics with mount point', async () => {
            const mockMetrics = [
                {
                    id: 1,
                    serverId: 'server-1',
                    timestamp: 1700000000,
                    mountPoint: '/',
                    totalBytes: 500000000000,
                    usedBytes: 250000000000,
                    freeBytes: 250000000000,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchDiskUsageMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].mountPoint).toBe('/');
            expect(metrics[0].totalBytes).toBe(500000000000);
        });
    });

    describe('fetchDiskIOMetrics', () => {
        it('fetches disk IO metrics with device info', async () => {
            const mockMetrics = [
                {
                    id: 1,
                    serverId: 'server-1',
                    timestamp: 1700000000,
                    device: 'sda1',
                    readBytes: 1000000,
                    writeBytes: 500000,
                    readCount: 100,
                    writeCount: 50,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchDiskIOMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].device).toBe('sda1');
            expect(metrics[0].readBytes).toBe(1000000);
        });
    });

    describe('fetchNetworkMetrics', () => {
        it('fetches network metrics with interface info', async () => {
            const mockMetrics = [
                {
                    id: 1,
                    serverId: 'server-1',
                    timestamp: 1700000000,
                    iface: 'eth0',
                    bytesSent: 1000000,
                    bytesRecv: 2000000,
                    packetsSent: 1000,
                    packetsRecv: 2000,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchNetworkMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].iface).toBe('eth0');
            expect(metrics[0].bytesSent).toBe(1000000);
        });
    });

    describe('fetchProcessMetrics', () => {
        it('fetches process metrics with correct mapping', async () => {
            const mockMetrics = [
                {
                    id: 1,
                    serverId: 'server-1',
                    timestamp: 1700000000,
                    pid: 1234,
                    name: 'node',
                    cpuPercent: 25.5,
                    memoryPercent: 12.3,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchProcessMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].pid).toBe(1234);
            expect(metrics[0].name).toBe('node');
            expect(metrics[0].cpuPercent).toBe(25.5);
        });
    });

    describe('fetchAlertRules', () => {
        it('fetches alert rules', async () => {
            const mockRules = [
                {
                    id: 'rule-1',
                    name: 'High CPU',
                    metricType: 'cpu',
                    condition: 'above',
                    threshold: 80,
                    serverId: null,
                    enabled: true,
                    createdAt: 1700000000,
                    updatedAt: 1700000000,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockRules,
            });

            const rules = await fetchAlertRules();

            expect(mockFetch).toHaveBeenCalledWith('/api/alerts/rules', undefined);
            expect(rules).toEqual(mockRules);
        });
    });

    describe('fetchActiveAlerts', () => {
        it('fetches active alerts', async () => {
            const mockAlerts = [
                {
                    id: 1,
                    ruleId: 'rule-1',
                    serverId: 'server-1',
                    triggeredAt: 1700000000,
                    resolvedAt: null,
                    metricValue: 95,
                    threshold: 80,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAlerts,
            });

            const alerts = await fetchActiveAlerts();

            expect(mockFetch).toHaveBeenCalledWith('/api/alerts/active', undefined);
            expect(alerts).toEqual(mockAlerts);
        });
    });

    describe('createAlertRule', () => {
        it('creates an alert rule', async () => {
            const rule = {
                name: 'High Memory',
                metricType: 'memory' as const,
                condition: 'gt' as const,
                threshold: 90,
                serverId: null,
                enabled: true,
            };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ ...rule, id: 'rule-2', createdAt: 1700000000, updatedAt: 1700000000 }),
            });

            await createAlertRule(rule);

            const call = mockFetch.mock.calls[0];
            expect(call[0]).toBe('/api/alerts/rules');
            const options = call[1] as RequestInit;
            expect(options.method).toBe('POST');
            expect(options.body).toBe(JSON.stringify(rule));
            const headers = options.headers as Record<string, string>;
            expect(headers['Content-Type']).toBe('application/json');
        });
    });

    describe('updateAlertRule', () => {
        it('updates an alert rule', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

            await updateAlertRule('rule-1', { enabled: false });

            const call = mockFetch.mock.calls[0];
            expect(call[0]).toBe('/api/alerts/rules/rule-1');
            const options = call[1] as RequestInit;
            expect(options.method).toBe('PUT');
            expect(options.body).toBe(JSON.stringify({ enabled: false }));
            const headers = options.headers as Record<string, string>;
            expect(headers['Content-Type']).toBe('application/json');
        });
    });

    describe('deleteAlertRule', () => {
        it('deletes an alert rule', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

            await deleteAlertRule('rule-1');

            const call = mockFetch.mock.calls[0];
            expect(call[0]).toBe('/api/alerts/rules/rule-1');
            const options = call[1] as RequestInit;
            expect(options.method).toBe('DELETE');
        });
    });

    describe('createServer', () => {
        it('sends POST to /api/servers with displayName body', async () => {
            const mockRegistration = { id: 'server-1', token: 'abc123' };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockRegistration,
            });

            const result = await createServer('My Server');

            const call = mockFetch.mock.calls[0];
            expect(call[0]).toBe('/api/servers');
            const options = call[1] as RequestInit;
            expect(options.method).toBe('POST');
            expect(options.body).toBe(JSON.stringify({ displayName: 'My Server' }));
            const headers = options.headers as Record<string, string>;
            expect(headers['Content-Type']).toBe('application/json');
            expect(result).toEqual(mockRegistration);
        });

        it('throws on non-ok response', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad Request' });

            await expect(createServer('Bad')).rejects.toThrow('API request failed');
        });
    });

    describe('deleteServer', () => {
        it('sends DELETE to /api/servers/{id}', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

            await deleteServer('server-1');

            const call = mockFetch.mock.calls[0];
            expect(call[0]).toBe('/api/servers/server-1');
            const options = call[1] as RequestInit;
            expect(options.method).toBe('DELETE');
        });

        it('throws on non-ok response', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });

            await expect(deleteServer('bad-id')).rejects.toThrow('API request failed');
        });
    });

    describe('regenerateServerToken', () => {
        it('sends POST to /api/servers/{id}/regenerate-token', async () => {
            const mockResponse = { token: 'new-token-123' };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await regenerateServerToken('server-1');

            const call = mockFetch.mock.calls[0];
            expect(call[0]).toBe('/api/servers/server-1/regenerate-token');
            const options = call[1] as RequestInit;
            expect(options.method).toBe('POST');
            expect(result).toEqual(mockResponse);
        });

        it('throws on non-ok response', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });

            await expect(regenerateServerToken('bad-id')).rejects.toThrow('API request failed');
        });
    });
});
