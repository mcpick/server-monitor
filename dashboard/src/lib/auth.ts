const AUTH_TOKEN_KEY = 'server_monitor_auth_token';

export async function login(
    username: string,
    password: string,
): Promise<boolean> {
    const expectedUsername = import.meta.env.VITE_AUTH_USERNAME;
    const expectedPasswordHash = import.meta.env.VITE_AUTH_PASSWORD_HASH;

    if (!expectedUsername || !expectedPasswordHash) {
        return false;
    }

    if (username !== expectedUsername) {
        return false;
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== expectedPasswordHash) {
        return false;
    }

    const token = generateToken();
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return true;
}

export function logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return token !== null && token.length > 0;
}

export function getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

export async function generatePasswordHash(password: string): Promise<string> {
    return hashPassword(password);
}
