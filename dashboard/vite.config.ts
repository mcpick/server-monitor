/// <reference types="vitest/config" />

import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';

const isTest = !!process.env.VITEST;

export default defineConfig({
    plugins: [
        !isTest && cloudflare({ viteEnvironment: { name: 'ssr' } }),
        !isTest && tanstackStart(),
        react(),
        !isTest && tailwindcss(),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
    },
});
