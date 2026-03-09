const ACCESS_TOKEN_KEY = 'server_monitor_access_token';
const REFRESH_TOKEN_KEY = 'server_monitor_refresh_token';
const TOKEN_EXPIRY_KEY = 'server_monitor_token_expiry';

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export async function login(
    username: string,
    password: string,
): Promise<boolean> {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            return false;
        }

        const data: LoginResponse = await response.json();
        storeTokens(data);
        return true;
    } catch (error) {
        console.error('Login failed:', error);
        return false;
    }
}

export async function logout(): Promise<void> {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
        // Ignore logout API errors
    }
    clearTokens();
}

export function isAuthenticated(): boolean {
    if (typeof globalThis.localStorage === 'undefined') return false;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiry) {
        return false;
    }

    // Check if token is expired (with 30 second buffer)
    const expiryTime = Number(expiry);
    if (Date.now() > expiryTime - 30000) {
        // Token is expired or about to expire, try to refresh
        void refreshTokens();
        return false;
    }

    return true;
}

export async function ensureAuthenticated(): Promise<boolean> {
    if (typeof globalThis.localStorage === 'undefined') return false;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiry) {
        return false;
    }

    const expiryTime = Number(expiry);

    // Token still valid and not near expiry
    if (Date.now() <= expiryTime - 30000) {
        return true;
    }

    // Token expired or near-expiry — try refresh
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
        clearTokens();
        return false;
    }

    return refreshTokens();
}

export function getAuthToken(): string | null {
    if (typeof globalThis.localStorage === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function refreshTokens(): Promise<boolean> {
    if (typeof globalThis.localStorage === 'undefined') return false;
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
        clearTokens();
        return false;
    }

    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            clearTokens();
            return false;
        }

        const data: LoginResponse = await response.json();
        storeTokens(data);
        return true;
    } catch {
        clearTokens();
        return false;
    }
}

function storeTokens(data: LoginResponse): void {
    if (typeof globalThis.localStorage === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(
        TOKEN_EXPIRY_KEY,
        String(Date.now() + data.expiresIn * 1000),
    );
}

function clearTokens(): void {
    if (typeof globalThis.localStorage === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
}
