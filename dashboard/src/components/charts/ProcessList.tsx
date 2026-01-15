import type { ReactElement } from 'react';
import type { ProcessMetric } from '../../types/metrics';

interface ProcessListProps {
    data: ProcessMetric[];
}

export function ProcessList({ data }: ProcessListProps): ReactElement {
    const latestTimestamp = Math.max(...data.map((m) => m.timestamp));
    const latestProcesses = [
        ...data.filter((m) => m.timestamp === latestTimestamp),
    ]
        .sort(
            (a, b) =>
                b.cpu_percent +
                b.memory_percent -
                (a.cpu_percent + a.memory_percent),
        )
        .slice(0, 10);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            PID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CPU %
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Memory %
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {latestProcesses.map((proc) => (
                        <tr
                            key={`${proc.pid}-${proc.timestamp}`}
                            className="hover:bg-gray-50"
                        >
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {proc.pid}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {proc.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                <span
                                    className={`inline-block px-2 py-1 rounded ${
                                        proc.cpu_percent > 50
                                            ? 'bg-red-100 text-red-800'
                                            : proc.cpu_percent > 25
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-green-100 text-green-800'
                                    }`}
                                >
                                    {proc.cpu_percent.toFixed(1)}%
                                </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                <span
                                    className={`inline-block px-2 py-1 rounded ${
                                        proc.memory_percent > 50
                                            ? 'bg-red-100 text-red-800'
                                            : proc.memory_percent > 25
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-green-100 text-green-800'
                                    }`}
                                >
                                    {proc.memory_percent.toFixed(1)}%
                                </span>
                            </td>
                        </tr>
                    ))}
                    {latestProcesses.length === 0 && (
                        <tr>
                            <td
                                colSpan={4}
                                className="px-4 py-4 text-center text-sm text-gray-500"
                            >
                                No process data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
