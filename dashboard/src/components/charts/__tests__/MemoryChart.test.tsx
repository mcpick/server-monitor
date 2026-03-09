import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryChart } from '../MemoryChart';
import type { MemoryMetric } from '@/lib/schemas';

describe('MemoryChart', () => {
    const mockData: MemoryMetric[] = [
        {
            id: 1,
            serverId: 'server-1',
            timestamp: 1700000000,
            totalBytes: 16 * 1024 * 1024 * 1024, // 16 GB
            usedBytes: 8 * 1024 * 1024 * 1024, // 8 GB
            availableBytes: 8 * 1024 * 1024 * 1024, // 8 GB
            cachedBytes: 2 * 1024 * 1024 * 1024, // 2 GB
        },
        {
            id: 2,
            serverId: 'server-1',
            timestamp: 1700000005,
            totalBytes: 16 * 1024 * 1024 * 1024,
            usedBytes: 10 * 1024 * 1024 * 1024, // 10 GB
            availableBytes: 6 * 1024 * 1024 * 1024, // 6 GB
            cachedBytes: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
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
