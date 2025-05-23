import { noUncheckedResult } from './rules/no-unchecked-result';

const plugin = {
  rules: {
    'no-unchecked-result': noUncheckedResult,
  },
  configs: {
    recommended: {
      plugins: ['no-floating-result'],
      rules: {
        'no-floating-result/no-unchecked-result': 'error',
      },
    },
  },
};

export = plugin;
