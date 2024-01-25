module.exports = {
  root: true,
  extends: ['prettier'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[regex=/[æøå]/u]',
        message: 'Avoid using special characters like æ, ø, å in strings.',
      },
    ],
  },
};
