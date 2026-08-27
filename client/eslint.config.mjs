import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  ...pluginVue.configs['flat/recommended'],
  prettier,
  {
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
]
