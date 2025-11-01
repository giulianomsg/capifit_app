#!/usr/bin/env node

const { spawn } = require('node:child_process');

const processes = [];
const commands = [
  ['npm', ['run', 'dev', '--workspace', 'apps/api']],
  ['npm', ['run', 'dev', '--workspace', 'apps/web']],
];

function startProcess([command, args]) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Command ${command} ${args.join(' ')} exited with code ${code}`);
      stopAll();
      process.exit(code ?? 1);
    }
  });

  processes.push(child);
}

function stopAll(signal = 'SIGINT') {
  for (const child of processes) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

process.on('SIGINT', () => {
  stopAll('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll('SIGTERM');
  process.exit(0);
});

for (const command of commands) {
  startProcess(command);
}
