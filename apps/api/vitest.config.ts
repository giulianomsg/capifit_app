import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [
      path.resolve(__dirname, 'vitest.setup.ts'),
      path.resolve(__dirname, 'test/setup/prisma-test-env.ts'),
    ],
    include: ['test/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@config': path.resolve(__dirname, 'src/config'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@jobs': path.resolve(__dirname, 'src/jobs'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@repositories': path.resolve(__dirname, 'src/repositories'),
      '@middlewares': path.resolve(__dirname, 'src/middlewares'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@test': path.resolve(__dirname, 'test'),
    },
  },
});
