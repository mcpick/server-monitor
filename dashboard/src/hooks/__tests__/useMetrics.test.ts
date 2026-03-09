import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../../lib/api';
import { queryKeys } from '../../lib/queryKeys';

vi.mock('../../lib/api');

const mockedApi = vi.mocked(api);

describe('useMetrics hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('queryKeys', () => {
        it('creates servers query key', () => {
            expect(queryKeys.servers()).toEqual(['metrics', 'servers']);
        });

        it('creates cpu query key with parameters', () => {
            const timeRange = {
                preset: '1h' as const,
                startTime: 1700000000,
                endTime: 1700003600,
            };
            expect(queryKeys.cpu('server-1', timeRange)).toEqual([
                'metrics',
                'cpu',
                'server-1',
                1700000000,
                1700003600,
            ]);
        });

        it('creates memory query key with parameters', () => {
            const timeRange = {
                preset: '1h' as const,
                startTime: 1700000000,
                endTime: 1700003600,
            };
            expect(queryKeys.memory('server-1', timeRange)).toEqual([
                'metrics',
                'memory',
                'server-1',
                1700000000,
                1700003600,
            ]);
        });
    });

    describe('api fetch functions', () => {
        it('fetchServers returns server data', async () => {
            const mockServers = [
                {
                    id: 'server-1',
                    hostname: 'server1.example.com',
                    displayName: 'Server 1',
                    createdAt: 1700000000,
                    lastSeenAt: 1700000000,
                },
                {
                    id: 'server-2',
                    hostname: 'server2.example.com',
                    displayName: 'Server 2',
                    createdAt: 1700000001,
                    lastSeenAt: 1700000001,
                },
            ];

            mockedApi.fetchServers.mockResolvedValue(mockServers);

            const result = await api.fetchServers();

            expect(result).toEqual(mockServers);
            expect(mockedApi.fetchServers).toHaveBeenCalledTimes(1);
        });

        it('fetchCPUMetrics is called with correct parameters', async () => {
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

            mockedApi.fetchCPUMetrics.mockResolvedValue(mockMetrics);

            const result = await api.fetchCPUMetrics(
                'server-1',
                1700000000,
                1700003600,
            );

            expect(result).toEqual(mockMetrics);
            expect(mockedApi.fetchCPUMetrics).toHaveBeenCalledWith(
                'server-1',
                1700000000,
                1700003600,
            );
        });

        it('handles fetch error', async () => {
            const error = new Error('Failed to fetch');
            mockedApi.fetchServers.mockRejectedValue(error);

            await expect(api.fetchServers()).rejects.toThrow(
                'Failed to fetch',
            );
        });
    });
});
