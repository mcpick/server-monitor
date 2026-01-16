import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MetricCard } from '../MetricCard';

describe('MetricCard', () => {
    it('renders title and children', () => {
        render(
            <MetricCard title="CPU Usage">
                <div data-testid="chart-content">Chart here</div>
            </MetricCard>,
        );

        expect(screen.getByText('CPU Usage')).toBeInTheDocument();
        expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    });

    it('shows loading spinner when loading', () => {
        const { container } = render(
            <MetricCard
                title="CPU Usage"
                loading={true}
            >
                <div data-testid="chart-content">Chart here</div>
            </MetricCard>,
        );

        expect(screen.getByText('CPU Usage')).toBeInTheDocument();
        expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
        // LoadingSpinner renders an animated spinner div
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows error message for network errors', () => {
        const error = new Error('Network request failed');

        render(
            <MetricCard
                title="CPU Usage"
                error={error}
            >
                <div>Chart here</div>
            </MetricCard>,
        );

        expect(
            screen.getByText(
                'Unable to connect to the server. Please check your network connection.',
            ),
        ).toBeInTheDocument();
    });

    it('shows error message for timeout errors', () => {
        const error = new Error('Request timeout');

        render(
            <MetricCard
                title="CPU Usage"
                error={error}
            >
                <div>Chart here</div>
            </MetricCard>,
        );

        expect(
            screen.getByText(
                'Request timed out. The server may be slow or unavailable.',
            ),
        ).toBeInTheDocument();
    });

    it('shows error message for unauthorized errors', () => {
        const error = new Error('Unauthorized: 401');

        render(
            <MetricCard
                title="CPU Usage"
                error={error}
            >
                <div>Chart here</div>
            </MetricCard>,
        );

        expect(
            screen.getByText(
                'Authentication failed. Please try logging in again.',
            ),
        ).toBeInTheDocument();
    });

    it('shows generic error message for unknown errors', () => {
        const error = new Error('Something went wrong');

        render(
            <MetricCard
                title="CPU Usage"
                error={error}
            >
                <div>Chart here</div>
            </MetricCard>,
        );

        expect(
            screen.getByText('Failed to load data: Something went wrong'),
        ).toBeInTheDocument();
    });

    it('shows retry button when onRetry is provided', () => {
        const error = new Error('Failed');
        const onRetry = vi.fn();

        render(
            <MetricCard
                title="CPU Usage"
                error={error}
                onRetry={onRetry}
            >
                <div>Chart here</div>
            </MetricCard>,
        );

        const retryButton = screen.getByRole('button', { name: 'Retry' });
        expect(retryButton).toBeInTheDocument();

        fireEvent.click(retryButton);
        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not show retry button when onRetry is not provided', () => {
        const error = new Error('Failed');

        render(
            <MetricCard
                title="CPU Usage"
                error={error}
            >
                <div>Chart here</div>
            </MetricCard>,
        );

        expect(
            screen.queryByRole('button', { name: 'Retry' }),
        ).not.toBeInTheDocument();
    });
});
