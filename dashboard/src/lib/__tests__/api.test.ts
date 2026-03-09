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

vi.mock('../auth', () => ({
    getAuthToken: vi.fn(),
}));

import { getAuthToken } from '../auth';

const mockGetAuthToken = vi.mocked(getAuthToken);

function expectAuthHeaders(call: unknown[], token: string): void {
    const options = call[1] as RequestInit;
    const headers = options.headers as Headers;
    expect(headers).toBeInstanceOf(Headers);
    expect(headers.get('Authorization')).toBe(`Bearer ${token}`);
}

describe('API client', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', mockFetch);
        mockFetch.mockReset();
        mockGetAuthToken.mockReturnValue('test-auth-token');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('fetchServers', () => {
        it('returns mapped server data', async () => {
            const mockServers = [
                { id: 'server-1', hostname: 'web-01', created_at: 1700000000, last_seen_at: 1700000000 },
                { id: 'server-2', hostname: 'db-01', created_at: 1700000100, last_seen_at: 1700000100 },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockServers,
            });

            const servers = await fetchServers();

            expect(mockFetch).toHaveBeenCalledWith('/api/servers', expect.objectContaining({ headers: expect.any(Headers) }));
            expectAuthHeaders(mockFetch.mock.calls[0], 'test-auth-token');
            expect(servers).toEqual(mockServers);
        });

        it('throws error when API fails', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });

            await expect(fetchServers()).rejects.toThrow('API request failed');
        });

        it('does not set Authorization header when getAuthToken returns null', async () => {
            mockGetAuthToken.mockReturnValue(null);
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            });

            await fetchServers();

            const options = mockFetch.mock.calls[0][1] as RequestInit;
            const headers = options.headers as Headers;
            expect(headers.has('Authorization')).toBe(false);
        });
    });

    describe('fetchCPUMetrics', () => {
        it('fetches CPU metrics with correct query parameters', async () => {
            const mockMetrics = [
                {
                    id: 1,
                    server_id: 'server-1',
                    timestamp: 1700000000,
                    usage_percent: 45.5,
                    load_1m: 1.2,
                    load_5m: 1.5,
                    load_15m: 1.3,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchCPUMetrics('server-1', 1699999000, 1700001000);

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/metrics/cpu?server_id=server-1&start=1699999000&end=1700001000',
                expect.objectContaining({ headers: expect.any(Headers) }),
            );
            expectAuthHeaders(mockFetch.mock.calls[0], 'test-auth-token');
            expect(metrics).toHaveLength(1);
            expect(metrics[0].usage_percent).toBe(45.5);
        });
    });

    describe('fetchMemoryMetrics', () => {
        it('fetches memory metrics with correct mapping', async () => {
            const mockMetrics = [
                {
                    id: 1,
                    server_id: 'server-1',
                    timestamp: 1700000000,
                    total_bytes: 16000000000,
                    used_bytes: 8000000000,
                    available_bytes: 8000000000,
                    cached_bytes: 2000000000,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchMemoryMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].total_bytes).toBe(16000000000);
            expect(metrics[0].cached_bytes).toBe(2000000000);
        });
    });

    describe('fetchSwapMetrics', () => {
        it('fetches swap metrics with correct mapping', async () => {
            const mockMetrics = [
                {
                    id: 1,
                    server_id: 'server-1',
                    timestamp: 1700000000,
                    total_bytes: 8000000000,
                    used_bytes: 1000000000,
                    free_bytes: 7000000000,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchSwapMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].total_bytes).toBe(8000000000);
            expect(metrics[0].free_bytes).toBe(7000000000);
        });
    });

    describe('fetchDiskUsageMetrics', () => {
        it('fetches disk usage metrics with mount point', async () => {
            const mockMetrics = [
                {
                    id: 1,
                    server_id: 'server-1',
                    timestamp: 1700000000,
                    mount_point: '/',
                    total_bytes: 500000000000,
                    used_bytes: 250000000000,
                    free_bytes: 250000000000,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchDiskUsageMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].mount_point).toBe('/');
            expect(metrics[0].total_bytes).toBe(500000000000);
        });
    });

    describe('fetchDiskIOMetrics', () => {
        it('fetches disk IO metrics with device info', async () => {
            const mockMetrics = [
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
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchDiskIOMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].device).toBe('sda1');
            expect(metrics[0].read_bytes).toBe(1000000);
        });
    });

    describe('fetchNetworkMetrics', () => {
        it('fetches network metrics with interface info', async () => {
            const mockMetrics = [
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
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchNetworkMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].interface).toBe('eth0');
            expect(metrics[0].bytes_sent).toBe(1000000);
        });
    });

    describe('fetchProcessMetrics', () => {
        it('fetches process metrics with correct mapping', async () => {
            const mockMetrics = [
                {
                    id: 1,
                    server_id: 'server-1',
                    timestamp: 1700000000,
                    pid: 1234,
                    name: 'node',
                    cpu_percent: 25.5,
                    memory_percent: 12.3,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics,
            });

            const metrics = await fetchProcessMetrics('server-1', 1699999000, 1700001000);

            expect(metrics[0].pid).toBe(1234);
            expect(metrics[0].name).toBe('node');
            expect(metrics[0].cpu_percent).toBe(25.5);
        });
    });

    describe('fetchAlertRules', () => {
        it('fetches alert rules', async () => {
            const mockRules = [
                {
                    id: 'rule-1',
                    name: 'High CPU',
                    metric_type: 'cpu',
                    condition: 'above',
                    threshold: 80,
                    server_id: null,
                    enabled: true,
                    created_at: 1700000000,
                    updated_at: 1700000000,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockRules,
            });

            const rules = await fetchAlertRules();

            expect(mockFetch).toHaveBeenCalledWith('/api/alerts/rules', expect.objectContaining({ headers: expect.any(Headers) }));
            expectAuthHeaders(mockFetch.mock.calls[0], 'test-auth-token');
            expect(rules).toEqual(mockRules);
        });
    });

    describe('fetchActiveAlerts', () => {
        it('fetches active alerts', async () => {
            const mockAlerts = [
                {
                    id: 1,
                    rule_id: 'rule-1',
                    server_id: 'server-1',
                    triggered_at: 1700000000,
                    resolved_at: null,
                    metric_value: 95,
                    threshold: 80,
                },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAlerts,
            });

            const alerts = await fetchActiveAlerts();

            expect(mockFetch).toHaveBeenCalledWith('/api/alerts/active', expect.objectContaining({ headers: expect.any(Headers) }));
            expectAuthHeaders(mockFetch.mock.calls[0], 'test-auth-token');
            expect(alerts).toEqual(mockAlerts);
        });
    });

    describe('createAlertRule', () => {
        it('creates an alert rule', async () => {
            const rule = {
                name: 'High Memory',
                metric_type: 'memory' as const,
                condition: 'gt' as const,
                threshold: 90,
                server_id: null,
                enabled: true,
            };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ ...rule, id: 'rule-2', created_at: 1700000000, updated_at: 1700000000 }),
            });

            await createAlertRule(rule);

            const call = mockFetch.mock.calls[0];
            expect(call[0]).toBe('/api/alerts/rules');
            const options = call[1] as RequestInit;
            expect(options.method).toBe('POST');
            expect(options.body).toBe(JSON.stringify(rule));
            const headers = options.headers as Headers;
            expect(headers.get('Content-Type')).toBe('application/json');
            expect(headers.get('Authorization')).toBe('Bearer test-auth-token');
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
            const headers = options.headers as Headers;
            expect(headers.get('Content-Type')).toBe('application/json');
            expect(headers.get('Authorization')).toBe('Bearer test-auth-token');
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
            expectAuthHeaders(call, 'test-auth-token');
        });
    });

    describe('createServer', () => {
        it('sends POST to /api/servers with displayName body and auth header', async () => {
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
            const headers = options.headers as Headers;
            expect(headers.get('Content-Type')).toBe('application/json');
            expect(headers.get('Authorization')).toBe('Bearer test-auth-token');
            expect(result).toEqual(mockRegistration);
        });

        it('throws on non-ok response', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad Request' });

            await expect(createServer('Bad')).rejects.toThrow('API request failed');
        });
    });

    describe('deleteServer', () => {
        it('sends DELETE to /api/servers/{id} with auth header', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

            await deleteServer('server-1');

            const call = mockFetch.mock.calls[0];
            expect(call[0]).toBe('/api/servers/server-1');
            const options = call[1] as RequestInit;
            expect(options.method).toBe('DELETE');
            expectAuthHeaders(call, 'test-auth-token');
        });

        it('throws on non-ok response', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });

            await expect(deleteServer('bad-id')).rejects.toThrow('API request failed');
        });
    });

    describe('regenerateServerToken', () => {
        it('sends POST to /api/servers/{id}/regenerate-token with auth header', async () => {
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
            expectAuthHeaders(call, 'test-auth-token');
            expect(result).toEqual(mockResponse);
        });

        it('throws on non-ok response', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });

            await expect(regenerateServerToken('bad-id')).rejects.toThrow('API request failed');
        });
    });
});
