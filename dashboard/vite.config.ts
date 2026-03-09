import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const isTest = !!process.env.VITEST;

const config = defineConfig({
    plugins: [
        devtools(),
        !isTest && cloudflare({ viteEnvironment: { name: "ssr" } }),
        tsconfigPaths({ projects: ["./tsconfig.json"] }),
        !isTest && tailwindcss(),
        !isTest && tanstackStart(),
        viteReact(),
    ],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
    },
});

export default config;
