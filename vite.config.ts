import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build:
    command === 'build'
        ? {
            emptyOutDir: true,
            cssCodeSplit: false,
          lib: {
            entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
            fileName: (format) =>
              format === 'es' ? 'lyrics-scrolling.js' : 'lyrics-scrolling.cjs',
            formats: ['es', 'cjs'],
          },
          rollupOptions: {
            external: ['vue'],
          },
        }
      : undefined,
  test: {
    environment: 'node',
    include: ['src/lib/**/*.test.ts'],
  },
}));
