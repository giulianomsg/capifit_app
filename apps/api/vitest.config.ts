import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [path.resolve(__dirname, 'test/setup/prisma-test-env.ts')],
    include: ['test/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@config': path.resolve(__dirname, 'src/config'),
    },
  },
});
