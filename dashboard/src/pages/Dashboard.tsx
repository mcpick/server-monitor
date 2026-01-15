import { useState, useEffect, useMemo, type ReactElement } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { MetricCard } from '../components/MetricCard';
import { CPUChart } from '../components/charts/CPUChart';
import { MemoryChart } from '../components/charts/MemoryChart';
import { SwapChart } from '../components/charts/SwapChart';
import { DiskUsageChart } from '../components/charts/DiskUsageChart';
import { DiskIOChart } from '../components/charts/DiskIOChart';
import { NetworkChart } from '../components/charts/NetworkChart';
import { ProcessList } from '../components/charts/ProcessList';
import {
  useServers,
  useCPUMetrics,
  useMemoryMetrics,
  useSwapMetrics,
  useDiskMetrics,
  useNetworkMetrics,
  useProcessMetrics,
} from '../hooks/useMetrics';
import { getTimeRange, type TimeRangePreset } from '../types/metrics';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps): ReactElement {
  const [manuallySelectedServerId, setManuallySelectedServerId] = useState<string | null>(null);
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>('1h');
  const [timeRange, setTimeRange] = useState(() => getTimeRange('1h'));

  const { data: servers, loading: serversLoading } = useServers();

  // Derive the effective server ID: use manually selected if set, otherwise default to first server
  const selectedServerId = useMemo(() => {
    if (manuallySelectedServerId) return manuallySelectedServerId;
    return servers && servers.length > 0 ? servers[0].id : null;
  }, [manuallySelectedServerId, servers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRange(getTimeRange(timeRangePreset));
    }, 10000);
    return () => clearInterval(interval);
  }, [timeRangePreset]);

  function handleTimeRangeChange(preset: TimeRangePreset): void {
    setTimeRangePreset(preset);
    setTimeRange(getTimeRange(preset));
  }

  const cpu = useCPUMetrics(selectedServerId, timeRange);
  const memory = useMemoryMetrics(selectedServerId, timeRange);
  const swap = useSwapMetrics(selectedServerId, timeRange);
  const disk = useDiskMetrics(selectedServerId, timeRange);
  const network = useNetworkMetrics(selectedServerId, timeRange);
  const process = useProcessMetrics(selectedServerId, timeRange);

  if (serversLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading servers...</p>
      </div>
    );
  }

  if (!servers || servers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No servers found. Make sure the agent is running.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader
        servers={servers}
        selectedServerId={selectedServerId}
        onServerChange={setManuallySelectedServerId}
        timeRangePreset={timeRangePreset}
        onTimeRangeChange={handleTimeRangeChange}
        onLogout={onLogout}
      />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricCard title="CPU Usage" loading={cpu.loading} error={cpu.error}>
            {cpu.data && <CPUChart data={cpu.data} />}
          </MetricCard>

          <MetricCard title="Memory Usage" loading={memory.loading} error={memory.error}>
            {memory.data && <MemoryChart data={memory.data} />}
          </MetricCard>

          <MetricCard title="Swap Usage" loading={swap.loading} error={swap.error}>
            {swap.data && <SwapChart data={swap.data} />}
          </MetricCard>

          <MetricCard title="Disk Usage" loading={disk.usage.loading} error={disk.usage.error}>
            {disk.usage.data && <DiskUsageChart data={disk.usage.data} />}
          </MetricCard>

          <MetricCard title="Disk I/O" loading={disk.io.loading} error={disk.io.error}>
            {disk.io.data && <DiskIOChart data={disk.io.data} />}
          </MetricCard>

          <MetricCard title="Network" loading={network.loading} error={network.error}>
            {network.data && <NetworkChart data={network.data} />}
          </MetricCard>

          <div className="lg:col-span-2">
            <MetricCard title="Top Processes" loading={process.loading} error={process.error}>
              {process.data && <ProcessList data={process.data} />}
            </MetricCard>
          </div>
        </div>
      </main>
    </div>
  );
}
