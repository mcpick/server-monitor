const ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const ALGORITHM = 'SHA-256';

function toBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
}

function fromBase64(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

async function deriveKey(
    password: string,
    salt: Uint8Array,
    iterations: number,
): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits'],
    );
    return crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations, hash: ALGORITHM },
        keyMaterial,
        KEY_LENGTH * 8,
    );
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= (a[i] ?? 0) ^ (b[i] ?? 0);
    }
    return result === 0;
}

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const hash = await deriveKey(password, salt, ITERATIONS);
    return `pbkdf2:${ITERATIONS}:${toBase64(salt)}:${toBase64(new Uint8Array(hash))}`;
}

export async function verifyPassword(
    password: string,
    storedHash: string,
): Promise<boolean> {
    const parts = storedHash.split(':');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
        return false;
    }
    const iterations = Number(parts[1]);
    const salt = fromBase64(parts[2]!);
    const expectedHash = fromBase64(parts[3]!);
    const derivedHash = new Uint8Array(
        await deriveKey(password, salt, iterations),
    );
    return timingSafeEqual(derivedHash, expectedHash);
}
