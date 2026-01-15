import { Component, type ReactNode, type ReactElement } from 'react';
import {
    createRootRoute,
    Outlet,
    ScrollRestoration,
} from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const TanStackRouterDevtools = import.meta.env.PROD
    ? () => null
    : lazy(() =>
          import('@tanstack/router-devtools').then((res) => ({
              default: res.TanStackRouterDevtools,
          })),
      );

const ReactQueryDevtools = import.meta.env.PROD
    ? () => null
    : lazy(() =>
          import('@tanstack/react-query-devtools').then((res) => ({
              default: res.ReactQueryDevtools,
          })),
      );

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
                        <h1 className="text-xl font-bold text-red-600 mb-4">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {this.state.error?.message}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

function RootComponent(): ReactElement {
    return (
        <ErrorBoundary>
            <ScrollRestoration />
            <Outlet />
            <Suspense>
                <TanStackRouterDevtools position="bottom-right" />
                <ReactQueryDevtools buttonPosition="bottom-left" />
            </Suspense>
        </ErrorBoundary>
    );
}

export const Route = createRootRoute({
    component: RootComponent,
});
