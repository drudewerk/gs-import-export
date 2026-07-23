import js from "@eslint/js";
import stylisticTypeScript from "@stylistic/eslint-plugin-ts";
import typeScriptPlugin from "@typescript-eslint/eslint-plugin";
import typeScriptParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import storybookPlugin from "eslint-plugin-storybook";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";


const sourceFiles = ["**/*.{js,jsx,ts,tsx}"];

export default [
    {
        ignores: [
            ".storybook/**",
            "dist/**",
        ],
    },
    {
        ...js.configs.recommended,
        files: sourceFiles,
    },
    ...storybookPlugin.configs["flat/recommended"],
    {
        files: sourceFiles,
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.es2020,
            },
            parser: typeScriptParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                sourceType: "module",
            },
            sourceType: "module",
        },
        plugins: {
            "@stylistic/ts": stylisticTypeScript,
            "@typescript-eslint": typeScriptPlugin,
            import: importPlugin,
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            "simple-import-sort": simpleImportSort,
            "unused-imports": unusedImports,
        },
        rules: {
            ...typeScriptPlugin.configs["eslint-recommended"].overrides[0].rules,
            ...typeScriptPlugin.configs.recommended.rules,
            ...importPlugin.flatConfigs.warnings.rules,
            ...reactPlugin.configs.flat.recommended.rules,
            ...reactHooksPlugin.configs.recommended.rules,
            quotes: [
                "warn",
                "double",
                {
                    avoidEscape: true,
                },
            ],
            curly: [
                "warn",
                "all",
            ],
            "no-prototype-builtins": "off",
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/no-var-requires": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "simple-import-sort/imports": [
                "error",
                {
                    groups: [
                        ["^react", "^@?\\w"],
                        ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
                        [
                            "^.+\\.?(scss)$",
                            "^.+\\.?(less)$",
                            "^.+\\.?(css)$",
                            "^\\u0000",
                        ],
                    ],
                },
            ],
            "simple-import-sort/exports": "error",
            "import/newline-after-import": [
                "error",
                {
                    count: 2,
                    considerComments: true,
                },
            ],
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
            "@stylistic/ts/member-delimiter-style": [
                "warn",
                {
                    multiline: {
                        delimiter: "semi",
                        requireLast: true,
                    },
                    singleline: {
                        delimiter: "semi",
                        requireLast: true,
                    },
                    multilineDetection: "brackets",
                },
            ],
            "@stylistic/ts/brace-style": [
                "warn",
                "1tbs",
                {
                    allowSingleLine: false,
                },
            ],
            "react-hooks/rules-of-hooks": "error",
            "react/prop-types": "off",
            "react/display-name": "off",
            "react/jsx-max-props-per-line": [
                "warn",
                {
                    maximum: {
                        single: 3,
                        multi: 1,
                    },
                },
            ],
            "react/jsx-first-prop-new-line": [
                "warn",
                "multiline-multiprop",
            ],
            "react/jsx-closing-bracket-location": [
                "warn",
                "line-aligned",
            ],
            "react/jsx-indent-props": "warn",
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
];
