module.exports = {
    parser: 'vue-eslint-parser',
    root: true,
    env: {
        node: true,
        es6: true,
    },
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/typescript/recommended',
        'plugin:vue/vue3-recommended',
        '@vue/prettier',
        '@vue/prettier/@typescript-eslint',
        'plugin:prettier/recommended',
    ],
    plugins: ['@typescript-eslint', 'vue', 'prettier'],
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            tsx: true, // Allows for the parsing of JSX
            jsx: true,
        },
    },
    rules: {
        '@typescript-eslint/no-var-requires': 0,
        'vue/attributes-order': 'off',
        indent: 'off',
        '@typescript-eslint/indent': ['off', 4, { VariableDeclarator: 4, SwitchCase: 1 }],
        '@typescript-eslint/no-non-null-assertion': 'off',
        'prettier/prettier': 'error',
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
};
