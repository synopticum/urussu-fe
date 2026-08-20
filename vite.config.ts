import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export default defineConfig({
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
