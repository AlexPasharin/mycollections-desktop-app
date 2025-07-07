import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.webpack', 'out'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@stylistic': stylistic,
      '@import': importPlugin,
    },
    rules: {
      '@import/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: ['external', 'builtin', 'sibling', 'parent', 'index'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      '@import/no-anonymous-default-export': 'warn',
      'no-bitwise': 'error',
      'no-console': [
        'error',
        {
          allow: ['warn', 'error', 'info', 'clear'],
        },
      ],
      'array-callback-return': [
        'error',
        { allowVoid: true, checkForEach: true, allowImplicit: true },
      ],
      'no-duplicate-imports': 'error',
      'no-import-assign': 'error',
      'no-promise-executor-return': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-useless-assignment': 'error',
      'require-atomic-updates': 'error',
      'valid-typeof': ['error', { requireStringLiterals: true }],
      curly: 'error',
      'default-case-last': 'error',
      eqeqeq: ['error', 'smart'],
      'no-case-declarations': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-eval': 'error',
      'guard-for-in': 'error',
      'no-extend-native': 'error',
      'no-extra-boolean-cast': ['error', { enforceForInnerExpressions: true }],
      'no-extra-label': 'error',
      'no-label-var': 'error',
      'no-lonely-if': 'error',
      'no-multi-assign': ['error', { ignoreNonDeclaration: true }],
      'no-multi-str': 'error',
      'no-negated-condition': 'error',
      'no-new-wrappers': 'error',
      'no-proto': 'error',
      'no-regex-spaces': 'error',
      'no-return-assign': 'error',
      'no-sequences': 'error',
      'no-undef-init': 'error',
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      'no-useless-return': 'error',
      radix: 'error',
      'require-await': 'off', // switched off from eslint because typescript-eslint/recommended-type-checked includes TS version of this rule
      'no-throw-literal': 'off', // switched off from eslint because typescript-eslint/recommended-type-checked includes TS version of this rule
      'symbol-description': 'error',
      yoda: 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/consistent-generic-constructors': 'warn',
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/no-confusing-non-null-assertion': ['error'],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true },
      ],
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-misused-spread': 'error',
      '@typescript-eslint/no-mixed-enums': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true },
      ],
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      '@typescript-eslint/no-unsafe-type-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/prefer-find': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/require-array-sort-compare': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
      '@stylistic/lines-around-comment': [
        'error',
        {
          beforeBlockComment: true,
          beforeLineComment: true,
          allowObjectStart: true,
          allowArrayStart: true,
          allowTypeStart: true,
          allowInterfaceStart: true,
          allowBlockStart: true,
        },
      ],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      '@stylistic/no-mixed-operators': ['error', { allowSamePrecedence: true }],
    },
  }
);
