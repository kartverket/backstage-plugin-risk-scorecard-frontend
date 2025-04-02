const eslintFactory = require('@backstage/cli/config/eslint-factory');
module.exports = {
  ...eslintFactory(__dirname),
  rules: {
    'react/react-in-jsx-scope': 'off', // Disable React in scope for JSX (not needed in React 17+)
  },
};
