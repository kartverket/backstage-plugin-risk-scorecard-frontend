/* eslint-disable */
const eslintFactory = require('@backstage/cli/config/eslint-factory');

module.exports = {
    ...eslintFactory(__dirname),
    rules: {
        'react/jsx-boolean-value': 'off',
    },
};
/* eslint-enable */