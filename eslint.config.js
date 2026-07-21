const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const boundaries = require('eslint-plugin-boundaries');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
  {
    files: ['src/**/*.ts'],
    plugins: {
      boundaries: /** @type {import('eslint').ESLint.Plugin} */ (
        /** @type {unknown} */ (boundaries)
      ),
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/app/domain/**' },
        { type: 'application', pattern: 'src/app/application/**' },
        { type: 'infrastructure', pattern: 'src/app/infrastructure/**' },
        { type: 'ui', pattern: 'src/app/ui/**' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            {
              from: { element: { type: 'domain' } },
              disallow: [
                { to: { element: { type: 'application' } } },
                { to: { element: { type: 'infrastructure' } } },
                { to: { element: { type: 'ui' } } },
              ],
            },
            {
              from: { element: { type: 'application' } },
              disallow: [
                { to: { element: { type: 'infrastructure' } } },
                { to: { element: { type: 'ui' } } },
              ],
            },
            {
              from: { element: { type: 'infrastructure' } },
              disallow: [{ to: { element: { type: 'ui' } } }],
            },
          ],
        },
      ],
    },
  },
]);
