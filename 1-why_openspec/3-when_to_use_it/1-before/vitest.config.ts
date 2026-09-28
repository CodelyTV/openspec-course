import { defineConfig, type Plugin } from "vitest/config";

const svgIconsAsPlainSvgElements: Plugin = {
	name: "svg-icons-as-plain-svg-elements",
	enforce: "pre",
	load(id) {
		if (!id.endsWith(".svg")) {
			return null;
		}

		return `import { createElement } from "react";
export default function SvgIcon(props) {
	return createElement("svg", props);
}`;
	},
};

export default defineConfig({
	plugins: [svgIconsAsPlainSvgElements],
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		mockReset: true,
		env: { TZ: "UTC" },
		projects: [
			{
				extends: true,
				test: {
					name: "unit",
					environment: "node",
					include: ["tests/**/*.spec.ts"],
					exclude: [
						"**/node_modules/**",
						"tests/**/infrastructure/**",
					],
					setupFiles: ["tests/setupFaker.ts"],
				},
			},
			{
				extends: true,
				test: {
					name: "frontend",
					environment: "jsdom",
					include: ["tests/**/*.spec.tsx"],
					setupFiles: [
						"tests/setupFaker.ts",
						"tests/setupFrontendTests.ts",
					],
				},
			},
			{
				extends: true,
				test: {
					name: "integration",
					environment: "node",
					include: ["tests/**/infrastructure/**/*.spec.ts"],
					setupFiles: ["tests/setupFaker.ts", "tests/setupTests.ts"],
					pool: "forks",
					fileParallelism: false,
					testTimeout: 30000,
					hookTimeout: 30000,
				},
			},
		],
	},
});
