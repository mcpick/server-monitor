import type { ReactElement } from 'react';
import type { TimeRangePreset } from '@/lib/schemas';

interface TimeRangeSelectorProps {
    value: TimeRangePreset;
    onChange: (preset: TimeRangePreset) => void;
}

const presets: { value: TimeRangePreset; label: string }[] = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
] satisfies { value: TimeRangePreset; label: string }[];

export function TimeRangeSelector({
    value,
    onChange,
}: TimeRangeSelectorProps): ReactElement {
    return (
        <div className="flex gap-1">
            {presets.map((preset) => (
                <button
                    key={preset.value}
                    onClick={() => onChange(preset.value)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        value === preset.value
                            ? 'bg-blue-600 dark:bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    {preset.label}
                </button>
            ))}
        </div>
    );
}
