module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'no-floating-result'],
  rules: {
    'no-floating-result/no-unchecked-result': 'error',
  },
  overrides: [
    {
      files: ['tests/**/*.ts'],
      parserOptions: {
        project: './tests/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  ],
};
