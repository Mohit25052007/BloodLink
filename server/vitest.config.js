import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    testTimeout: 60000,
    hookTimeout: 300000, // 5 minutes for initial binary cache
    globals: true,
  },
});
