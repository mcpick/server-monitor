import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CPUChart } from '../CPUChart';
import type { CPUMetric } from '@/lib/schemas';

describe('CPUChart', () => {
    const mockData: CPUMetric[] = [
        {
            id: 1,
            serverId: 'server-1',
            timestamp: 1700000000,
            usagePercent: 45.5,
            load1m: 1.2,
            load5m: 1.5,
            load15m: 1.3,
        },
        {
            id: 2,
            serverId: 'server-1',
            timestamp: 1700000005,
            usagePercent: 52.3,
            load1m: 1.4,
            load5m: 1.6,
            load15m: 1.4,
        },
        {
            id: 3,
            serverId: 'server-1',
            timestamp: 1700000010,
            usagePercent: 38.7,
            load1m: 1.1,
            load5m: 1.4,
            load15m: 1.3,
        },
    ];

    it('renders without crashing', () => {
        render(<CPUChart data={mockData} />);
    });

    it('renders the chart with data', () => {
        const { container } = render(<CPUChart data={mockData} />);

        // Check that the ResponsiveContainer is rendered
        expect(
            container.querySelector('.recharts-responsive-container'),
        ).toBeTruthy();
    });

    it('renders with empty data without crashing', () => {
        render(<CPUChart data={[]} />);
    });

    // Note: Legend test skipped because Recharts ResponsiveContainer
    // doesn't render child elements properly in JSDOM without dimensions
});
