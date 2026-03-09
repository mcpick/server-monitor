import bcrypt from 'bcryptjs';
import { env } from './env';

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
} {
    return {
        username: env.AUTH_USERNAME,
        passwordHash: env.AUTH_PASSWORD_HASH,
    };
}
