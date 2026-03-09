import { env } from './env';

export { hashPassword, verifyPassword } from './password';

export function getAuthCredentials(): {
    username: string;
    passwordHash: string;
} {
    return {
        username: env.AUTH_USERNAME,
        passwordHash: env.AUTH_PASSWORD_HASH,
    };
}
