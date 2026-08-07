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
	},
};

export default nextConfig;
