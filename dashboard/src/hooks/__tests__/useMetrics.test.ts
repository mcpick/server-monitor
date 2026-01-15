import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as turso from '../../lib/turso';
import { queryKeys } from '../../lib/queryKeys';

vi.mock('../../lib/turso');

const mockedTurso = vi.mocked(turso);

describe('useMetrics hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('queryKeys', () => {
    it('creates servers query key', () => {
      expect(queryKeys.servers()).toEqual(['metrics', 'servers']);
    });

    it('creates cpu query key with parameters', () => {
      const timeRange = { preset: '1h' as const, startTime: 1700000000, endTime: 1700003600 };
      expect(queryKeys.cpu('server-1', timeRange)).toEqual([
        'metrics',
        'cpu',
        'server-1',
        1700000000,
        1700003600,
      ]);
    });

    it('creates memory query key with parameters', () => {
      const timeRange = { preset: '1h' as const, startTime: 1700000000, endTime: 1700003600 };
      expect(queryKeys.memory('server-1', timeRange)).toEqual([
        'metrics',
        'memory',
        'server-1',
        1700000000,
        1700003600,
      ]);
    });
  });

  describe('turso fetch functions', () => {
    it('fetchServers returns server data', async () => {
      const mockServers = [
        { id: 'server-1', hostname: 'server1.example.com', created_at: 1700000000 },
        { id: 'server-2', hostname: 'server2.example.com', created_at: 1700000001 },
      ];

      mockedTurso.fetchServers.mockResolvedValue(mockServers);

      const result = await turso.fetchServers();

      expect(result).toEqual(mockServers);
      expect(mockedTurso.fetchServers).toHaveBeenCalledTimes(1);
    });

    it('fetchCPUMetrics is called with correct parameters', async () => {
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

      mockedTurso.fetchCPUMetrics.mockResolvedValue(mockMetrics);

      const result = await turso.fetchCPUMetrics('server-1', 1700000000, 1700003600);

      expect(result).toEqual(mockMetrics);
      expect(mockedTurso.fetchCPUMetrics).toHaveBeenCalledWith(
        'server-1',
        1700000000,
        1700003600
      );
    });

    it('handles fetch error', async () => {
      const error = new Error('Failed to fetch');
      mockedTurso.fetchServers.mockRejectedValue(error);

      await expect(turso.fetchServers()).rejects.toThrow('Failed to fetch');
    });
  });
});
