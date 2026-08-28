import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  // 顺序重要：tseslint 先设 parser，pluginVue 再把 .vue 覆盖回 vue-eslint-parser，
  // 最后一个块只为 .vue 指定 <script lang="ts"> 的内部 parser
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.vue', '**/*.d.ts'],
    rules: {
      ...config.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ]
    }
  })),
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue']
      }
    }
  },
  prettier,
  {
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
]
