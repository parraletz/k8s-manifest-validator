import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import parser from 'yaml-eslint-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  {
    ignores: [
      '**/.eslintrc.js',
      '**/vitest.config.*',
      '**/dist/*',
      '**/kubernetes/*'
    ]
  },
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:yml/standard',
    'prettier',
    'eslint:recommended'
  ),
  {
    plugins: {
      prettier
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },

      parser: tsParser
    },

    rules: {
      'prettier/prettier': [
        'error',
        {
          useTabs: false,
          tabSize: 2,
          semi: false,
          singleQuote: true,
          trailingComma: 'none',
          bracketSpacing: true,
          arrowParens: 'avoid',
          endOfLine: 'auto'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    files: ['**/*.yaml', '**/*.yml'],

    languageOptions: {
      parser: parser
    },

    rules: {
      'yml/quotes': 0
    }
  }
]
