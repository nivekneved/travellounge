import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
    {
        ignores: ["dist", "node_modules", "build", ".vercel", "**/*.config.js"],
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
                ...globals.node,
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "react-refresh/only-export-components": "off",
            "no-console": "off",
            "react/no-unescaped-entities": "off",
            "react-hooks/exhaustive-deps": "off",
            "react-hooks/set-state-in-render": "off",
            "react-hooks/set-state-in-effect": "off",
            "no-unused-vars": "off"
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
];
