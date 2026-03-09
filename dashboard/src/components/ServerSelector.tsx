import type { ReactElement } from 'react';
import type { Server } from '@/lib/schemas';

interface ServerSelectorProps {
    servers: Server[];
    value: string | null;
    onChange: (serverId: string) => void;
}

export function ServerSelector({
    servers,
    value,
    onChange,
}: ServerSelectorProps): ReactElement {
    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option
                value=""
                disabled
            >
                Select a server
            </option>
            {servers.map((server) => (
                <option
                    key={server.id}
                    value={server.id}
                >
                    {server.displayName}{server.hostname ? ` (${server.hostname})` : ''}
                </option>
            ))}
        </select>
    );
}
