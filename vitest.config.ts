import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // Pure game logic is covered; Horizon adapters (src/horizon) are thin glue without logic
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/horizon/**'],
      reporter: ['text', 'json-summary', 'lcov'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
