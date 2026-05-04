const { createRequire } = require('module');
const path = require('path');

let eslintFactory;
try {
  eslintFactory = require('@backstage/cli/config/eslint-factory');
} catch {
  // Symlink-safe fallback: resolve from the current working repo root
  const requireFromCwd = createRequire(
    path.join(process.cwd(), 'package.json'),
  );
  eslintFactory = requireFromCwd('@backstage/cli/config/eslint-factory');
}

module.exports = {
  ...eslintFactory(__dirname),
  rules: {
    'react/jsx-boolean-value': 'off',
    'react/react-in-jsx-scope': 'off',
    'jest/expect-expect': [
      'warn',
      { assertFunctionNames: ['expect', 'expectArrayMatches'] },
    ],
  },
};
