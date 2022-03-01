module.exports = {
    parser: 'vue-eslint-parser',
    root: true,
    env: {
        node: true,
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
        '@typescript-eslint/indent': ['off'],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/explicit-module-boundary-types':'off',
        'prettier/prettier': [
            'off',
            {},
            {
                usePrettierrc: true,
            },
        ],
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
};
