import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, ""),
		},
	},
	test: {
		env: {
			NEXT_PUBLIC_SEARCH_API_URL: "http://api.test",
		},
		environment: "jsdom",
		exclude: ["**/node_modules/**", "**/.next/**"],
		setupFiles: ["./vitest.setup.ts"],
	},
});
