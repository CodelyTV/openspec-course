import eslintConfigNext from "@next/eslint-plugin-next";
import eslintConfigCodely from "eslint-config-codely";
import globals from "globals";

const backendContexts = ["products", "checkout", "orders", "users", "reviews"];

const infrastructureFromInnerLayersRestriction = {
	group: ["**/infrastructure", "**/infrastructure/**"],
	message:
		"Domain and application must not depend on infrastructure. Declare a port (abstract class) in the domain and implement it in infrastructure.",
};

function otherContextsOf(context) {
	return backendContexts.filter((other) => other !== context);
}

function innerLayersBoundaries(context) {
	return {
		files: [
			`src/contexts/backend/${context}/domain/**/*.ts`,
			`src/contexts/backend/${context}/application/**/*.ts`,
		],
		rules: {
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: otherContextsOf(context).map(
								(other) => `@/contexts/backend/${other}/**`,
							),
							message: `The ${context} domain and application must not import other bounded contexts. Declare a port in this context's domain and adapt the other context's application layer in infrastructure. Identifiers shared by every context belong to src/contexts/shared/domain.`,
						},
						infrastructureFromInnerLayersRestriction,
					],
				},
			],
		},
	};
}

function infrastructureBoundaries(context) {
	return {
		files: [`src/contexts/backend/${context}/infrastructure/**/*.ts`],
		rules: {
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: otherContextsOf(context).flatMap((other) => [
								`@/contexts/backend/${other}/domain/**`,
								`@/contexts/backend/${other}/infrastructure/**`,
							]),
							message: `The ${context} infrastructure may only reach other bounded contexts through their application layer (use cases and response DTOs). Adapt that use case behind a port declared in this context's domain.`,
						},
					],
				},
			],
		},
	};
}

const boundedContextBoundaries = backendContexts.flatMap((context) => [
	innerLayersBoundaries(context),
	infrastructureBoundaries(context),
]);

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
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	...boundedContextBoundaries,
];
