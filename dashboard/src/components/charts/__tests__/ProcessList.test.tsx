import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProcessList } from '../ProcessList';
import type { ProcessMetric } from '../../../types/metrics';

describe('ProcessList', () => {
    const mockData: ProcessMetric[] = [
        {
            id: 1,
            server_id: 'server-1',
            timestamp: 1700000000,
            pid: 1234,
            name: 'chrome',
            cpu_percent: 45.5,
            memory_percent: 12.3,
        },
        {
            id: 2,
            server_id: 'server-1',
            timestamp: 1700000000,
            pid: 5678,
            name: 'node',
            cpu_percent: 25.0,
            memory_percent: 8.5,
        },
        {
            id: 3,
            server_id: 'server-1',
            timestamp: 1700000000,
            pid: 9012,
            name: 'postgres',
            cpu_percent: 5.2,
            memory_percent: 35.0,
        },
    ];

    it('renders table headers', () => {
        render(<ProcessList data={mockData} />);

        expect(screen.getByText('PID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('CPU %')).toBeInTheDocument();
        expect(screen.getByText('Memory %')).toBeInTheDocument();
    });

    it('renders process data', () => {
        render(<ProcessList data={mockData} />);

        expect(screen.getByText('1234')).toBeInTheDocument();
        expect(screen.getByText('chrome')).toBeInTheDocument();
        expect(screen.getByText('45.5%')).toBeInTheDocument();

        expect(screen.getByText('5678')).toBeInTheDocument();
        expect(screen.getByText('node')).toBeInTheDocument();

        expect(screen.getByText('9012')).toBeInTheDocument();
        expect(screen.getByText('postgres')).toBeInTheDocument();
    });

    it('shows "No process data available" when data is empty', () => {
        render(<ProcessList data={[]} />);

        expect(screen.getByText('No process data available')).toBeInTheDocument();
    });

    it('sorts processes by combined CPU and memory usage', () => {
        render(<ProcessList data={mockData} />);

        const rows = screen.getAllByRole('row');
        // First row is header, so data rows start at index 1
        // chrome (45.5 + 12.3 = 57.8) should be first
        // postgres (5.2 + 35.0 = 40.2) should be second
        // node (25.0 + 8.5 = 33.5) should be third
        expect(rows[1]).toHaveTextContent('chrome');
        expect(rows[2]).toHaveTextContent('postgres');
        expect(rows[3]).toHaveTextContent('node');
    });

    it('only shows latest timestamp data', () => {
        const dataWithMultipleTimestamps: ProcessMetric[] = [
            ...mockData,
            {
                id: 4,
                server_id: 'server-1',
                timestamp: 1700000005,
                pid: 1111,
                name: 'latest-process',
                cpu_percent: 10.0,
                memory_percent: 5.0,
            },
        ];

        render(<ProcessList data={dataWithMultipleTimestamps} />);

        // Should only show the latest timestamp process
        expect(screen.getByText('latest-process')).toBeInTheDocument();
        // Should not show older timestamp processes
        expect(screen.queryByText('chrome')).not.toBeInTheDocument();
    });

    it('limits to 10 processes', () => {
        const manyProcesses: ProcessMetric[] = Array.from(
            { length: 15 },
            (_, i) => ({
                id: i,
                server_id: 'server-1',
                timestamp: 1700000000,
                pid: 1000 + i,
                name: `process-${i}`,
                cpu_percent: 10 - i * 0.5,
                memory_percent: 5,
            }),
        );

        render(<ProcessList data={manyProcesses} />);

        // Should have 10 data rows + 1 header row
        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(11);
    });

    it('applies red styling for high CPU usage (>50%)', () => {
        const highCPUData: ProcessMetric[] = [
            {
                id: 1,
                server_id: 'server-1',
                timestamp: 1700000000,
                pid: 1234,
                name: 'heavy-process',
                cpu_percent: 75.0,
                memory_percent: 10.0,
            },
        ];

        render(<ProcessList data={highCPUData} />);

        const cpuCell = screen.getByText('75.0%');
        expect(cpuCell.className).toContain('bg-red');
    });

    it('applies yellow styling for medium CPU usage (25-50%)', () => {
        const mediumCPUData: ProcessMetric[] = [
            {
                id: 1,
                server_id: 'server-1',
                timestamp: 1700000000,
                pid: 1234,
                name: 'medium-process',
                cpu_percent: 35.0,
                memory_percent: 10.0,
            },
        ];

        render(<ProcessList data={mediumCPUData} />);

        const cpuCell = screen.getByText('35.0%');
        expect(cpuCell.className).toContain('bg-yellow');
    });

    it('applies green styling for low CPU usage (<25%)', () => {
        const lowCPUData: ProcessMetric[] = [
            {
                id: 1,
                server_id: 'server-1',
                timestamp: 1700000000,
                pid: 1234,
                name: 'light-process',
                cpu_percent: 10.0,
                memory_percent: 5.0,
            },
        ];

        render(<ProcessList data={lowCPUData} />);

        const cpuCell = screen.getByText('10.0%');
        expect(cpuCell.className).toContain('bg-green');
    });
});
