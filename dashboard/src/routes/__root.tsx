import { Component, type ReactNode, type ReactElement } from 'react';
import {
    createRootRoute,
    Outlet,
    HeadContent,
    Scripts,
} from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { ThemeProvider } from '../lib/theme';
import appCss from '../index.css?url';

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
                <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md">
                        <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {this.state.error?.message}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>Server Monitor</title>
                <link rel="stylesheet" href={appCss} />
                <HeadContent />
            </head>
            <body className="bg-gray-100 dark:bg-gray-900 min-h-screen">
                <ThemeProvider>
                    <QueryClientProvider client={queryClient}>
                        <ErrorBoundary>
                            <Outlet />
                            <Suspense>
                                <TanStackRouterDevtools position="bottom-right" />
                                <ReactQueryDevtools buttonPosition="bottom-left" />
                            </Suspense>
                        </ErrorBoundary>
                    </QueryClientProvider>
                </ThemeProvider>
                <Scripts />
            </body>
        </html>
    );
}

export const Route = createRootRoute({
    component: RootComponent,
});
