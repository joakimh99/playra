import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages: sätt GITHUB_PAGES=true eller BASE_PATH=/playra/
const base = process.env.BASE_PATH ?? (process.env.GITHUB_PAGES === 'true' ? '/playra/' : '/');

export default defineConfig({
  base,
  plugins: [react()],
});
