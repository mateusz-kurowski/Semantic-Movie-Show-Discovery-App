import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	allowedDevOrigins: ["http://localhost:8080"],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "image.tmdb.org",
				port: "",
				pathname: "/t/p/**",
			},
		],
		minimumCacheTTL: 86400,
		formats: ["image/avif", "image/webp"],
	},
};

export default nextConfig;
