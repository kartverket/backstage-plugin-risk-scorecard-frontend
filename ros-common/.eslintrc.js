const eslintFactory = require('@backstage/cli/config/eslint-factory');
module.exports = eslintFactory(__dirname, {
  rules: {
    '@typescript-eslint/no-redeclare': 'off',
  },
});
