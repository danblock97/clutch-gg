import ItemsClientPage from "./ItemsClientPage";

async function getItems() {
	const res = await fetch(
		"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json",
		{ next: { revalidate: 3600 } }
	);
	if (!res.ok) {
		throw new Error("Failed to fetch items");
	}
	return res.json();
}

export default async function ItemsPage() {
	const items = await getItems();
	const filteredItems = items.filter(
		(item) =>
			item.name &&
			!item.name.includes("Placeholder") &&
			item.description &&
			item.inStore &&
			item.iconPath &&
			item.displayInItemSets
	);

	return <ItemsClientPage items={filteredItems} allItems={items} />;
}
