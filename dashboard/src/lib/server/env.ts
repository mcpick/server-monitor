import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
    server: {
        TURSO_DATABASE_URL: z.string().url(),
        TURSO_AUTH_TOKEN: z.string().min(1),
        AUTH_USERNAME: z.string().min(1),
        AUTH_PASSWORD_HASH: z.string().min(1),
        JWT_SECRET: z.string().min(1),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
