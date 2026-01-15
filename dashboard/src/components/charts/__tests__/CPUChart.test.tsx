import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CPUChart } from '../CPUChart';
import type { CPUMetric } from '../../../types/metrics';

describe('CPUChart', () => {
    const mockData: CPUMetric[] = [
        {
            id: 1,
            server_id: 'server-1',
            timestamp: 1700000000,
            usage_percent: 45.5,
            load_1m: 1.2,
            load_5m: 1.5,
            load_15m: 1.3,
        },
        {
            id: 2,
            server_id: 'server-1',
            timestamp: 1700000005,
            usage_percent: 52.3,
            load_1m: 1.4,
            load_5m: 1.6,
            load_15m: 1.4,
        },
        {
            id: 3,
            server_id: 'server-1',
            timestamp: 1700000010,
            usage_percent: 38.7,
            load_1m: 1.1,
            load_5m: 1.4,
            load_15m: 1.3,
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
