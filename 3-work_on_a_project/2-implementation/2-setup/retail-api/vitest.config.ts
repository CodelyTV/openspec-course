import { defineConfig } from "vitest/config";

export default defineConfig({
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
						"tests/backend/acceptance/**",
					],
					setupFiles: ["tests/setupFaker.ts"],
				},
			},
			{
				extends: true,
				test: {
					name: "integration",
					environment: "node",
					include: [
						"tests/**/infrastructure/**/*.spec.ts",
						"tests/backend/acceptance/**/*.spec.ts",
					],
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
