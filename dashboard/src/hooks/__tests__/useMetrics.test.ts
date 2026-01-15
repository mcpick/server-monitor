import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useServers, useCPUMetrics } from '../useMetrics';
import * as turso from '../../lib/turso';

vi.mock('../../lib/turso');

const mockedTurso = vi.mocked(turso);

describe('useMetrics hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useServers', () => {
    it('fetches servers on mount', async () => {
      const mockServers = [
        { id: 'server-1', hostname: 'server1.example.com', created_at: 1700000000 },
        { id: 'server-2', hostname: 'server2.example.com', created_at: 1700000001 },
      ];

      mockedTurso.fetchServers.mockResolvedValue(mockServers);

      const { result } = renderHook(() => useServers());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockServers);
      expect(result.current.error).toBeNull();
      expect(mockedTurso.fetchServers).toHaveBeenCalledTimes(1);
    });

    it('handles fetch error', async () => {
      const error = new Error('Failed to fetch');
      mockedTurso.fetchServers.mockRejectedValue(error);

      const { result } = renderHook(() => useServers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useCPUMetrics', () => {
    const timeRange = { preset: '1h' as const, startTime: 1700000000, endTime: 1700003600 };

    it('does not fetch when serverId is null', async () => {
      const { result } = renderHook(() => useCPUMetrics(null, timeRange));

      // Give some time for any potential fetch to occur
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.current.loading).toBe(true);
      expect(mockedTurso.fetchCPUMetrics).not.toHaveBeenCalled();
    });

    it('fetches CPU metrics when serverId is provided', async () => {
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

      const { result } = renderHook(() => useCPUMetrics('server-1', timeRange));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockMetrics);
      expect(result.current.error).toBeNull();
      expect(mockedTurso.fetchCPUMetrics).toHaveBeenCalledWith(
        'server-1',
        timeRange.startTime,
        timeRange.endTime
      );
    });

    it('handles fetch error', async () => {
      const error = new Error('Failed to fetch CPU metrics');
      mockedTurso.fetchCPUMetrics.mockRejectedValue(error);

      const { result } = renderHook(() => useCPUMetrics('server-1', timeRange));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(error);
    });
  });
});
