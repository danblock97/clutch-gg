/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ["raw.communitydragon.org", "ddragon.leagueoflegends.com"],
	},
	experimental: {
		missingSuspenseWithCSRBailout: false,
	},
};

export default nextConfig;
