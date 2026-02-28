import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,mjs}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      prettierRecommended,
    ],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        },
      },
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'prettier/prettier': 'warn',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
]);
