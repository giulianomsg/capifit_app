import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      outDir: 'build',
      chunkSizeWarningLimit: 2000,
    },
    plugins: [tsconfigPaths(), react()],
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT ?? 5173),
      host: '0.0.0.0',
      strictPort: true,
    },
    preview: {
      port: Number(env.VITE_PREVIEW_PORT ?? 4173),
      host: '0.0.0.0',
    },
  };
});
