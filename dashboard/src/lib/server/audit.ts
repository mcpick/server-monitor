interface AuthAttemptLog {
    timestamp: string;
    ip: string;
    username: string;
    success: boolean;
    reason?: string;
}

/**
 * Log an authentication attempt.
 * In a production environment, this should be persisted to a database or logging service.
 */
export async function logAuthAttempt(
    ip: string,
    username: string,
    success: boolean,
    reason?: string,
): Promise<void> {
    const log: AuthAttemptLog = {
        timestamp: new Date().toISOString(),
        ip,
        username,
        success,
        reason,
    };

    // Log to console in a structured format
    // In production, this could be sent to a logging service or stored in the database
    if (success) {
        console.log('[AUTH] Login success:', JSON.stringify(log));
    } else {
        console.warn('[AUTH] Login failed:', JSON.stringify(log));
    }
}

/**
 * Log an API access event.
 */
export async function logApiAccess(
    ip: string,
    method: string,
    path: string,
    userId?: string,
): Promise<void> {
    const log = {
        timestamp: new Date().toISOString(),
        ip,
        method,
        path,
        userId,
    };

    console.log('[API] Access:', JSON.stringify(log));
}
