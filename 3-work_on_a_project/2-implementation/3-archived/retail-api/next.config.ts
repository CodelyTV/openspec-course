import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	agentRules: false,
	turbopack: {
		// Pin this app as the Turbopack root so stray lockfiles above it
		// (e.g. in the student's home dir) don't skew root inference.
		root: __dirname,
	},
};

export default nextConfig;
