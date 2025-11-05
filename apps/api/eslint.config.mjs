import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import pluginImport from 'eslint-plugin-import';
import pluginSecurity from 'eslint-plugin-security';
import pluginSonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

const tsconfigFile = fileURLToPath(new URL('./tsconfig.json', import.meta.url));
const tsconfigRoot = path.dirname(tsconfigFile);

const tsRecommended = tsPlugin.configs.recommended?.rules ?? {};
const tsStylistic = tsPlugin.configs.stylistic?.rules ?? {};

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: tsconfigFile,
        tsconfigRootDir: tsconfigRoot,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: pluginImport,
      security: pluginSecurity,
      sonarjs: pluginSonarjs,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: tsconfigFile,
        },
        node: {
          extensions: ['.ts', '.tsx', '.js'],
        },
      },
    },
    rules: {
      ...tsRecommended,
      ...tsStylistic,
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
          js: 'never',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
];
