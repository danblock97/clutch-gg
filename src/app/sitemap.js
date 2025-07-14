export default function sitemap() {
	return [
		{
			url: "https://clutchgg.lol",
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1.0,
		},
		// League of Legends pages
		{
			url: "https://clutchgg.lol/league/profile",
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: "https://clutchgg.lol/league/leaderboard",
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://clutchgg.lol/league/featured-games",
			lastModified: new Date(),
			changeFrequency: "hourly",
			priority: 0.7,
		},
		{
			url: "https://clutchgg.lol/league/datastudio",
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.6,
		},
		{
			url: "https://clutchgg.lol/league/datastudio/champions",
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.6,
		},
		{
			url: "https://clutchgg.lol/league/datastudio/items",
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.6,
		},
		// TFT pages
		{
			url: "https://clutchgg.lol/tft/profile",
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: "https://clutchgg.lol/tft/leaderboard",
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.8,
		},
		// Legal pages
		{
			url: "https://clutchgg.lol/legal/privacy-policy",
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: "https://clutchgg.lol/legal/terms-of-service",
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: "https://clutchgg.lol/legal/support",
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.4,
		},
	];
}
