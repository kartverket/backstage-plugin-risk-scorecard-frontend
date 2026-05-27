import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["playwright.config.ts"],
  },
  {
    files: ["ros/src/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'react/jsx-boolean-value': 'off',
      'react/react-in-jsx-scope': 'off',
      // Plugin not installed; inline disable-comments in source reference this rule
      'react-hooks/exhaustive-deps': 'off',
      // Codebase intentionally uses `any` for CSS module indexing, event casting, translation fn signatures, etc.
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow bare @ts-ignore in JSX comments ({/* @ts-ignore */}) and plain comments
      '@typescript-eslint/ban-ts-comment': 'off',
      // Allow _ as intentional unused param placeholder (e.g. validate: (value, _) => ...)
      // Also ignore caught errors that are unused (catch (e) / catch (error))
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '.*',
      }],
    },
  },
];
