const eslintFactory = require('@backstage/cli/config/eslint-factory');

module.exports = {
  ...eslintFactory(__dirname),
};
