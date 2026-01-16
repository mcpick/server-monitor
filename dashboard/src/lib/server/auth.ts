import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
    password: string,
    hash: string,
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function getAuthCredentials(): {
    username: string;
    passwordHash: string;
} | null {
    const username = process.env.AUTH_USERNAME;
    const passwordHash = process.env.AUTH_PASSWORD_HASH;

    if (!username || !passwordHash) {
        return null;
    }

    return { username, passwordHash };
}
