import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['lib/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['lib/**/*.ts', 'release.ts'],
      exclude: ['lib/**/*.test.ts', 'tests/**/*.test.ts'],
    },
  },
});
