import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@domain': resolve(__dirname, 'src/app/domain'),
      '@application': resolve(__dirname, 'src/app/application'),
      '@infrastructure': resolve(__dirname, 'src/app/infrastructure'),
      '@ui': resolve(__dirname, 'src/app/ui'),
      '@env': resolve(__dirname, 'src/environments'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    passWithNoTests: true,
  },
});
