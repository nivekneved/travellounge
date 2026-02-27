import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";

export default [
    {
        ignores: ["dist", "node_modules"],
    },
    js.configs.recommended,
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.es2021,
                ...globals.node,
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
            "unused-imports": unusedImports,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/no-unescaped-entities": "off",
            "react/display-name": "off",
            "no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": ["error", {
                "vars": "all",
                "varsIgnorePattern": "^(React|_)",
                "args": "after-used",
                "argsIgnorePattern": "^_"
            }],
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "no-undef": "error",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
];
