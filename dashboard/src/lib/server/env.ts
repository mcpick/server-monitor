import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
    server: {
        AUTH_USERNAME: z.string().min(1),
        AUTH_PASSWORD_HASH: z.string().min(1),
        JWT_SECRET: z.string().min(1),
        INGEST_API_KEY: z.string().min(1),
    },
    runtimeEnv: import.meta.env,
    emptyStringAsUndefined: true,
});
