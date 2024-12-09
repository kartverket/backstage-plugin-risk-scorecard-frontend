const eslintFactory = require('@backstage/cli/config/eslint-factory');
module.exports = {
    ...eslintFactory(__dirname),
    rules: {
        // Disable the react/jsx-boolean-value rule
        'react/jsx-boolean-value': 'off',
    },
};