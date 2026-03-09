/// <reference types="vitest/config" />

import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const isTest = !!process.env.VITEST;

const shims: Record<string, string> = {
    'cross-fetch': path.resolve(__dirname, 'src/lib/server/fetch-shim.ts'),
    'node-fetch': path.resolve(__dirname, 'src/lib/server/fetch-shim.ts'),
    'promise-limit': path.resolve(
        __dirname,
        'src/lib/server/promise-limit-shim.ts',
    ),
};

function cloudflareDepsShim(): Plugin {
    return {
        name: 'cloudflare-deps-shim',
        enforce: 'pre',
        applyToEnvironment: (env) => env.name === 'ssr',
        resolveId(id) {
            if (id in shims) {
                return shims[id];
            }
        },
    };
}

export default defineConfig({
    plugins: [
        !isTest && cloudflare({ viteEnvironment: { name: 'ssr' } }),
        !isTest && cloudflareDepsShim(),
        !isTest && tanstackStart(),
        react(),
        !isTest && tailwindcss(),
    ],
    environments: {
        ssr: {
            optimizeDeps: {
                exclude: [
                    '@libsql/client',
                    '@libsql/hrana-client',
                    '@libsql/core',
                ],
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
    },
});
