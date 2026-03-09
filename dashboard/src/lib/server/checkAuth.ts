import { createServerFn } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';
import { COOKIE_NAME, validateSession } from './session';

export const checkAuth = createServerFn().handler(async (): Promise<boolean> => {
    const sessionId = getCookie(COOKIE_NAME);
    if (!sessionId) {
        return false;
    }
    const session = await validateSession(sessionId);
    return session !== null;
});
