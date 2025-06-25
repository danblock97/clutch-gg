"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import ItemModal from "./ItemModal";

function ItemDisplay({ item, onSelect }) {
	if (!item) return null;

	return (
		<div
			className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
			onClick={() => onSelect(item)}
		>
			<div className="flex items-center space-x-4">
				<Image
					src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${item.iconPath
						.toLowerCase()
						.replace("/lol-game-data/assets", "")}`}
					alt={item.name}
					width={64}
					height={64}
					className="rounded-md"
				/>
				<div className="flex-1">
					<h3 className="font-bold text-lg">{item.name}</h3>
					{item.priceTotal > 0 && (
						<p className="text-sm text-yellow-400">{item.priceTotal}g</p>
					)}
				</div>
			</div>
		</div>
	);
}

export default function ItemsClientPage({ items, allItems }) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedItem, setSelectedItem] = useState(null);

	const filteredItems = useMemo(() => {
		if (!searchTerm) return items;
		return items.filter((item) =>
			item.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [searchTerm, items]);

	return (
		<div className="h-screen">
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-4xl font-bold mb-8 text-center">Items</h1>
				<div className="mb-8 max-w-lg mx-auto">
					<input
						type="text"
						placeholder="Search for an item..."
						className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						onChange={(e) => setSearchTerm(e.target.value)}
						value={searchTerm}
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredItems.map((item) => (
						<ItemDisplay key={item.id} item={item} onSelect={setSelectedItem} />
					))}
				</div>
			</div>
			{selectedItem && (
				<ItemModal
					initialItem={selectedItem}
					allItems={allItems}
					onClose={() => setSelectedItem(null)}
				/>
			)}
		</div>
	);
}
