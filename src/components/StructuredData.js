import Script from "next/script";

export default function StructuredData({ type = "website", data = {} }) {
	const baseStructuredData = {
		"@context": "https://schema.org",
		"@type": type,
		name: "ClutchGG",
		url: "https://clutchgg.lol",
		description:
			"ClutchGG is your ultimate destination for League of Legends and Teamfight Tactics analytics. Track your performance, view detailed match history, analyze champion statistics, and climb the leaderboards.",
		applicationCategory: "GameApplication",
		operatingSystem: "Web",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "GBP",
		},
		publisher: {
			"@type": "Organization",
			name: "ClutchGG",
			url: "https://clutchgg.lol",
		},
		sameAs: ["https://twitter.com/ClutchGG", "https://discord.gg/clutchgg"],
		...data,
	};

	if (type === "WebSite") {
		baseStructuredData.potentialAction = {
			"@type": "SearchAction",
			target:
				"https://clutchgg.lol/league/profile?gameName={search_term_string}",
			"query-input": "required name=search_term_string",
		};
	}

	return (
		<Script
			id="structured-data"
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(baseStructuredData),
			}}
		/>
	);
}
