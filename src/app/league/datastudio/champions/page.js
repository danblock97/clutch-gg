import ChampionsClientPage from "./ChampionsClientPage";

async function getChampions() {
	const res = await fetch(
		"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json",
		{ next: { revalidate: 3600 } }
	);
	if (!res.ok) {
		throw new Error("Failed to fetch champions");
	}
	const champions = await res.json();
	// Filter out champions with id -1 which are placeholders
	return champions
		.filter((c) => c.id > 0)
		.sort((a, b) => a.name.localeCompare(b.name));
}

export default async function ChampionsPage() {
	const champions = await getChampions();

	return <ChampionsClientPage champions={champions} />;
}
