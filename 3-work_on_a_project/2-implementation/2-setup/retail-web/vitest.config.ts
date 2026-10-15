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
		],
	},
});
