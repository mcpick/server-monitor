interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const attempts = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Check if the given identifier (IP address) is rate limited.
 * Returns true if the request should be allowed, false if rate limited.
 */
export function checkRateLimit(
    identifier: string,
    maxAttempts = MAX_ATTEMPTS,
    windowMs = WINDOW_MS,
): boolean {
    const now = Date.now();
    const entry = attempts.get(identifier);

    // Clean up old entries periodically
    if (attempts.size > 10000) {
        cleanupExpiredEntries(now);
    }

    if (!entry) {
        attempts.set(identifier, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (now > entry.resetAt) {
        // Window has expired, reset
        attempts.set(identifier, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (entry.count >= maxAttempts) {
        return false;
    }

    entry.count++;
    return true;
}

/**
 * Reset rate limit for an identifier (e.g., after successful login).
 */
export function resetRateLimit(identifier: string): void {
    attempts.delete(identifier);
}

/**
 * Get remaining attempts for an identifier.
 */
export function getRemainingAttempts(
    identifier: string,
    maxAttempts = MAX_ATTEMPTS,
): number {
    const entry = attempts.get(identifier);
    if (!entry || Date.now() > entry.resetAt) {
        return maxAttempts;
    }
    return Math.max(0, maxAttempts - entry.count);
}

function cleanupExpiredEntries(now: number): void {
    for (const [key, entry] of attempts) {
        if (now > entry.resetAt) {
            attempts.delete(key);
        }
    }
}
