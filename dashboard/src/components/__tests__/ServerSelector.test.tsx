import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ServerSelector } from '../ServerSelector';
import type { Server } from '../../types/metrics';

describe('ServerSelector', () => {
    const mockServers: Server[] = [
        { id: 'server-1', hostname: 'web-server-01', created_at: 1700000000 },
        { id: 'server-2', hostname: 'db-server-01', created_at: 1700000000 },
        { id: 'server-3', hostname: 'api-server-01', created_at: 1700000000 },
    ];

    it('renders all servers as options', () => {
        render(
            <ServerSelector
                servers={mockServers}
                value={null}
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByText('web-server-01')).toBeInTheDocument();
        expect(screen.getByText('db-server-01')).toBeInTheDocument();
        expect(screen.getByText('api-server-01')).toBeInTheDocument();
    });

    it('shows placeholder when no value selected', () => {
        render(
            <ServerSelector
                servers={mockServers}
                value={null}
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByText('Select a server')).toBeInTheDocument();
    });

    it('shows selected server', () => {
        render(
            <ServerSelector
                servers={mockServers}
                value="server-2"
                onChange={vi.fn()}
            />,
        );

        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe('server-2');
    });

    it('calls onChange when selecting a server', () => {
        const onChange = vi.fn();

        render(
            <ServerSelector
                servers={mockServers}
                value={null}
                onChange={onChange}
            />,
        );

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'server-3' } });

        expect(onChange).toHaveBeenCalledWith('server-3');
    });

    it('renders empty when no servers provided', () => {
        render(
            <ServerSelector
                servers={[]}
                value={null}
                onChange={vi.fn()}
            />,
        );

        const select = screen.getByRole('combobox');
        expect(select.querySelectorAll('option')).toHaveLength(1);
        expect(screen.getByText('Select a server')).toBeInTheDocument();
    });
});
