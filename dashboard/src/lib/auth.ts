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

        return response.ok;
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
}
