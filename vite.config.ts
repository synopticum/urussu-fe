import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export default defineConfig({
    resolve: {
        alias: {
            '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
            '@/openapi': fileURLToPath(new URL('./src/openapi', import.meta.url)),
            '@/pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
            '@/stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
            '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        },
    },
    plugins: [
        tanstackRouter({
            target: 'react',
            routesDirectory: './src/pages',
            generatedRouteTree: './src/routeTree.gen.ts',
            routeFileIgnorePattern: '((state|constants|utils|types|mock).ts)',
        }),
        react(),
        tailwindcss(),
    ],
    envPrefix: ['VITE_', 'API_'],
});
