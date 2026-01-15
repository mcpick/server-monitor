import type { ReactElement } from 'react';
import type { Server } from '../types/metrics';

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
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    {server.hostname}
                </option>
            ))}
        </select>
    );
}
