module.exports = {
  apps: [
    {
      name: 'capifit-api',
      cwd: './apps/api',
      script: 'node',
      args: 'dist/server.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'capifit-web',
      cwd: './apps/web',
      script: 'npm',
      args: 'run start',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 4173,
      },
    },
  ],
};
