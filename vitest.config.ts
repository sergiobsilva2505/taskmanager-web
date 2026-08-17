import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// NOTA: a cobertura de testes deste projeto NÃO é gerada rodando `npx vitest run --coverage`
// diretamente. Componentes com inputs baseados em signal (input()/input.required()) exigem a
// compilação AOT feita pelo builder do Angular CLI para que setInput() funcione nos testes.
// Use sempre: `npm test` (ng test --watch=false) para rodar a suíte,
// e `npx ng test --watch=false --coverage --coverage-reporters=lcov` para gerar cobertura
// (o relatório lcov.info sai em coverage/taskmanager-web/lcov.info).

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
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    passWithNoTests: true,
  },
});
