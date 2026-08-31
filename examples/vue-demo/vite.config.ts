import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: { port: 5178 },
  // The library is linked with `file:../..`; without this, Vite pre-bundles a stale copy.
  optimizeDeps: { exclude: ['modern-fns'] },
});
