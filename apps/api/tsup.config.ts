import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  dts: true,
  clean: true,
  target: 'node18',
  tsconfig: 'tsconfig.json',
  shims: false,
  external: ['tsconfig-paths', 'tsconfig-paths/register', 'tsconfig-paths/register.js'],
});
