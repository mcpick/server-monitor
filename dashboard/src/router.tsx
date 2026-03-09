import { createRouter as createTanstackRouter, type Router } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

type AppRouter = Router<typeof routeTree, 'never', boolean>;

export function getRouter(): AppRouter {
    return createTanstackRouter({
        routeTree,
        defaultPreload: 'intent',
        scrollRestoration: true,
    }) as AppRouter;
}

declare module '@tanstack/react-router' {
    interface Register {
        router: ReturnType<typeof getRouter>;
    }
}
