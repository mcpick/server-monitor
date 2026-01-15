import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryChart } from '../MemoryChart';
import type { MemoryMetric } from '../../../types/metrics';

describe('MemoryChart', () => {
    const mockData: MemoryMetric[] = [
        {
            id: 1,
            server_id: 'server-1',
            timestamp: 1700000000,
            total_bytes: 16 * 1024 * 1024 * 1024, // 16 GB
            used_bytes: 8 * 1024 * 1024 * 1024, // 8 GB
            available_bytes: 8 * 1024 * 1024 * 1024, // 8 GB
            cached_bytes: 2 * 1024 * 1024 * 1024, // 2 GB
        },
        {
            id: 2,
            server_id: 'server-1',
            timestamp: 1700000005,
            total_bytes: 16 * 1024 * 1024 * 1024,
            used_bytes: 10 * 1024 * 1024 * 1024, // 10 GB
            available_bytes: 6 * 1024 * 1024 * 1024, // 6 GB
            cached_bytes: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
        },
    ];

    it('renders without crashing', () => {
        render(<MemoryChart data={mockData} />);
    });

    it('renders the chart with data', () => {
        const { container } = render(<MemoryChart data={mockData} />);

        // Check that the ResponsiveContainer is rendered
        expect(
            container.querySelector('.recharts-responsive-container'),
        ).toBeTruthy();
    });

    it('renders with empty data without crashing', () => {
        render(<MemoryChart data={[]} />);
    });

    // Note: Legend test skipped because Recharts ResponsiveContainer
    // doesn't render child elements properly in JSDOM without dimensions
});
