import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pluginImport from 'eslint-plugin-import';
import pluginSecurity from 'eslint-plugin-security';
import pluginSonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

const tsconfigFile = fileURLToPath(new URL('./tsconfig.json', import.meta.url));
const tsconfigRoot = path.dirname(tsconfigFile);

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: tsconfigFile,
        tsconfigRootDir: tsconfigRoot,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
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
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
          js: 'never',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
    },
  },
);
