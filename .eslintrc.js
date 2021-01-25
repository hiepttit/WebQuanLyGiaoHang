module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: 'plugin:vue/essential',
  rules: {
    "vue/valid-template-root": "off"
    // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // "vue/max-attributes-per-line": "off",
    // "vue/script-indent": "off",
    // "comma-dangle": "off",
    // "semi":"off",
    // "quotes":"off"
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
