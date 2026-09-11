import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// GitHub Pages base path resolution.
// If GITHUB_REPOSITORY is set (e.g. "username/repo-name"), use "/repo-name/".
// If the repo is "username.github.io", use "/".
// VITE_BASE_PATH env var takes precedence.
function resolveBase(): string {
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH;
  const repo = process.env.GITHUB_REPOSITORY;
  if (repo) {
    const name = repo.split('/')[1] ?? '';
    if (name.endsWith('.github.io')) return '/';
    return `/${name}/`;
  }
  return '/';
}

export default defineConfig({
  plugins: [react()],
  base: resolveBase(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});
