import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return new TextEncoder().encode(secret);
}

export interface TokenPayload extends JWTPayload {
    sub: string;
    type: 'access' | 'refresh';
}

export async function generateAccessToken(userId: string): Promise<string> {
    const secret = getJwtSecret();
    return new SignJWT({ sub: userId, type: 'access' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRY)
        .sign(secret);
}

export async function generateRefreshToken(userId: string): Promise<string> {
    const secret = getJwtSecret();
    return new SignJWT({ sub: userId, type: 'refresh' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRY)
        .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
    const payload = await verifyToken(token);
    if (payload.type !== 'access') {
        throw new Error('Invalid token type');
    }
    return payload;
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
    const payload = await verifyToken(token);
    if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
    }
    return payload;
}
