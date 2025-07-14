export default function manifest() {
	return {
		name: "ClutchGG - League of Legends & TFT Stats",
		short_name: "ClutchGG",
		description:
			"ClutchGG is your ultimate destination for League of Legends and Teamfight Tactics analytics. Track your performance, view detailed match history, analyze champion statistics, and climb the leaderboards.",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#1f2937",
		orientation: "portrait-primary",
		scope: "/",
		lang: "en-US",
		categories: ["games", "entertainment", "sports"],
		icons: [
			{
				src: "/favicon.ico",
				sizes: "48x48",
				type: "image/x-icon",
			},
			{
				src: "/images/icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any maskable",
			},
			{
				src: "/images/icon-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any maskable",
			},
		],
		screenshots: [
			{
				src: "/images/screenshot-wide.png",
				sizes: "1280x720",
				type: "image/png",
				form_factor: "wide",
				label: "ClutchGG Dashboard",
			},
			{
				src: "/images/screenshot-narrow.png",
				sizes: "750x1334",
				type: "image/png",
				form_factor: "narrow",
				label: "ClutchGG Mobile View",
			},
		],
	};
}
