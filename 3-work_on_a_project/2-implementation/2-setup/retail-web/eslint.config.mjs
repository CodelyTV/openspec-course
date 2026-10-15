import eslintConfigNext from "@next/eslint-plugin-next";
import eslintConfigCodely from "eslint-config-codely";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
	{
		ignores: ["next-env.d.ts"],
	},
	...eslintConfigCodely.course,
	{
		files: ["**/*.{ts,tsx}"],
		rules: {
			"@typescript-eslint/explicit-function-return-type": "error",
			"@typescript-eslint/switch-exhaustiveness-check": "off",
		},
	},
	{
		...eslintConfigNext.configs.recommended,
		plugins: {
			"@next/next": eslintConfigNext,
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
			},
		},
	},
	reactHooks.configs.flat.recommended,
	{
		files: ["**/*.tsx"],
		rules: {
			"import/no-unresolved": "off",
		},
	},
];
