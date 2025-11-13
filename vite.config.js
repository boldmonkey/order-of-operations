import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const config = defineConfig({
    base: repoName ? `/${repoName}/` : '/',
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts'
    }
});
export default config;
