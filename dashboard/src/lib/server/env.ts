import { createEnv } from '@t3-oss/env-core';
import { env as cfEnv } from 'cloudflare:workers';
import { z } from 'zod';

export const env = createEnv({
    server: {
        AUTH_USERNAME: z.string().min(1),
        AUTH_PASSWORD_HASH: z.string().min(1),
        JWT_SECRET: z.string().min(1),
    },
    runtimeEnv: cfEnv,
    emptyStringAsUndefined: true,
});
