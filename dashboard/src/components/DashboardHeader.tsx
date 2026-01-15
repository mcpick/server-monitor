import type { ReactElement } from 'react';
import { logout } from '../lib/auth';
import { ServerSelector } from './ServerSelector';
import { TimeRangeSelector } from './TimeRangeSelector';
import { ThemeToggle } from './ThemeToggle';
import type { Server, TimeRangePreset } from '../types/metrics';

interface DashboardHeaderProps {
    servers: Server[];
    selectedServerId: string | null;
    onServerChange: (serverId: string) => void;
    timeRangePreset: TimeRangePreset;
    onTimeRangeChange: (preset: TimeRangePreset) => void;
    onLogout: () => void;
}

export function DashboardHeader({
    servers,
    selectedServerId,
    onServerChange,
    timeRangePreset,
    onTimeRangeChange,
    onLogout,
}: DashboardHeaderProps): ReactElement {
    function handleLogout(): void {
        logout();
        onLogout();
    }

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Server Monitor
                        </h1>
                        <ServerSelector
                            servers={servers}
                            value={selectedServerId}
                            onChange={onServerChange}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <TimeRangeSelector
                            value={timeRangePreset}
                            onChange={onTimeRangeChange}
                        />
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
