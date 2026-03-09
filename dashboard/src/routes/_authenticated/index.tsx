import { useState, useEffect, useMemo, type ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { MetricCard } from '@/components/MetricCard';
import { CPUChart } from '@/components/charts/CPUChart';
import { MemoryChart } from '@/components/charts/MemoryChart';
import { SwapChart } from '@/components/charts/SwapChart';
import { DiskUsageChart } from '@/components/charts/DiskUsageChart';
import { DiskIOChart } from '@/components/charts/DiskIOChart';
import { NetworkChart } from '@/components/charts/NetworkChart';
import { ProcessList } from '@/components/charts/ProcessList';
import { ServerSelector } from '@/components/ServerSelector';
import { TimeRangeSelector } from '@/components/TimeRangeSelector';
import {
    useServers,
    useCPUMetrics,
    useMemoryMetrics,
    useSwapMetrics,
    useDiskMetrics,
    useNetworkMetrics,
    useProcessMetrics,
} from '@/hooks/useMetrics';
import { getTimeRange, type TimeRangePreset } from '@/lib/schemas';

function DashboardPage(): ReactElement {
    const [manuallySelectedServerId, setManuallySelectedServerId] = useState<
        string | null
    >(null);
    const [timeRangePreset, setTimeRangePreset] =
        useState<TimeRangePreset>('1h');
    const [timeRange, setTimeRange] = useState(() => getTimeRange('1h'));

    const { data: servers, loading: serversLoading } = useServers();

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

    function handleServerChange(serverId: string): void {
        setManuallySelectedServerId(serverId);
    }

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
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400">
                    Loading servers...
                </p>
            </div>
        );
    }

    if (!servers || servers.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400">
                    No servers found. Make sure the agent is running.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <ServerSelector
                    servers={servers}
                    value={selectedServerId}
                    onChange={handleServerChange}
                />
                <TimeRangeSelector
                    value={timeRangePreset}
                    onChange={handleTimeRangeChange}
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MetricCard
                    title="CPU Usage"
                    loading={cpu.loading}
                    error={cpu.error}
                    onRetry={cpu.refetch}
                >
                    {cpu.data && <CPUChart data={cpu.data} />}
                </MetricCard>

                <MetricCard
                    title="Memory Usage"
                    loading={memory.loading}
                    error={memory.error}
                    onRetry={memory.refetch}
                >
                    {memory.data && <MemoryChart data={memory.data} />}
                </MetricCard>

                <MetricCard
                    title="Swap Usage"
                    loading={swap.loading}
                    error={swap.error}
                    onRetry={swap.refetch}
                >
                    {swap.data && <SwapChart data={swap.data} />}
                </MetricCard>

                <MetricCard
                    title="Disk Usage"
                    loading={disk.usage.loading}
                    error={disk.usage.error}
                    onRetry={disk.usage.refetch}
                >
                    {disk.usage.data && (
                        <DiskUsageChart data={disk.usage.data} />
                    )}
                </MetricCard>

                <MetricCard
                    title="Disk I/O"
                    loading={disk.io.loading}
                    error={disk.io.error}
                    onRetry={disk.io.refetch}
                >
                    {disk.io.data && <DiskIOChart data={disk.io.data} />}
                </MetricCard>

                <MetricCard
                    title="Network"
                    loading={network.loading}
                    error={network.error}
                    onRetry={network.refetch}
                >
                    {network.data && <NetworkChart data={network.data} />}
                </MetricCard>

                <div className="lg:col-span-2">
                    <MetricCard
                        title="Top Processes"
                        loading={process.loading}
                        error={process.error}
                        onRetry={process.refetch}
                    >
                        {process.data && (
                            <ProcessList data={process.data} />
                        )}
                    </MetricCard>
                </div>
            </div>
        </div>
    );
}

export const Route = createFileRoute('/_authenticated/')({
    component: DashboardPage,
});
