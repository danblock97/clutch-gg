/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "raw.communitydragon.org",
				port: "",
				pathname: "**",
			},
			{
				protocol: "https",
				hostname: "ddragon.leagueoflegends.com",
			},
		],
		unoptimized: true,
	},
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.fallback = {
				fs: false,
				net: false,
				tls: false,
			};
		}
		return config;
	},
	env: {
		MONGODB_URI: process.env.MONGODB_URI,
		RIOT_API_KEY: process.env.RIOT_API_KEY,
	},
};

export default nextConfig;
