import tseslint from 'typescript-eslint';
import baseConfig from './eslint.config.mjs';

export default tseslint.config(
  ...baseConfig,
  {
    files: ['**/*.{ts,mjs}'],
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },
);
