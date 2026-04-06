/* eslint-disable */
/* 
yarn add --dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint typescript
*/
module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
        "@typescript-eslint/no-unused-vars": ["off"],
    },
    "overrides": [
        {
            "files": ["src/**/*.jsx", "src/**/*.mjs", "src/**/*.ts*",],
            "excludedFiles": "*.test.js",
            "env": {
                // "browser": true,
                // "es2021": true,
            },
            "extends": [
                "eslint:recommended",
                // "plugin:@typescript-eslint/recommended",/* 其實react-app有用@typescript-eslint,不過改了一些 */
                "react-app",
            ],
            "parser": "@typescript-eslint/parser",
            // "plugins": ['@typescript-eslint'],
            "rules": {
                "@typescript-eslint/no-unused-vars": ["off"],
                "@typescript-eslint/ban-types": [
                    "error",
                    {
                        "types": {
                            /**
                             * 隨便給個什麼值好像就可以禁用了
                             */
                            "{}": false
                        }
                    }
                ],
                "@typescript-eslint/no-var-requires": "off",
                "@typescript-eslint/ban-ts-comment": "warn",
                // 'react/react-in-jsx-scope':'off',
                "no-constant-condition": "off",
                "no-empty": "warn",
                "no-var": "off",
                "import/first": "off",
                "no-restricted-globals": "off",
                "@typescript-eslint/no-unused-expressions": "warn"
            },
        },
        {
            "files": ["*.test.js",],
            // "excludedFiles": "*.test.js",
            "env": {
                "jest": true,
            },
            "extends": [
                "eslint:recommended",
                "plugin:@typescript-eslint/recommended",
                "react-app",
                // "plugin:react/recommended",
                // "plugin:react/jsx-runtime",
            ],
            "parser": "@typescript-eslint/parser",
            "parserOptions": {
                "sourceType": "module"
            },
            "rules": {
                "@typescript-eslint/no-unused-vars": ["off"],
                "@typescript-eslint/no-var-requires": "off",
                "@typescript-eslint/ban-ts-comment": "warn",
            },

        }
    ]
}
