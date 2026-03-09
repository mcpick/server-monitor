function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateServerToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
}

export async function hashToken(token: string): Promise<string> {
    const encoded = new TextEncoder().encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    return bytesToHex(new Uint8Array(hashBuffer));
}
