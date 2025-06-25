"use client";

import Image from "next/image";

function ItemNode({ item, allItems, onNodeClick }) {
	if (!item) return null;

	const subItemIds = item.from || [];

	return (
		<li>
			<div
				className="flex flex-col items-center cursor-pointer group"
				onClick={(e) => {
					e.stopPropagation();
					onNodeClick(item);
				}}
			>
				<div className="p-2 bg-gray-800 rounded-md border border-gray-700 group-hover:border-yellow-500 transition-colors">
					<Image
						src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${item.iconPath
							.toLowerCase()
							.replace("/lol-game-data/assets", "")}`}
						alt={item.name}
						width={48}
						height={48}
						className="rounded-md"
					/>
				</div>
				<span className="text-xs mt-1 w-20 truncate text-center">
					{item.name}
				</span>
				<span className="text-xs text-yellow-400">{item.priceTotal}g</span>
			</div>
			{subItemIds.length > 0 && (
				<ul>
					{subItemIds.map((id, index) => {
						const subItem = allItems.find((i) => i.id === id);
						return (
							<ItemNode
								key={`${id}-${index}`}
								item={subItem}
								allItems={allItems}
								onNodeClick={onNodeClick}
							/>
						);
					})}
				</ul>
			)}
		</li>
	);
}

export default function ItemTree({ item, allItems, onNodeClick }) {
	return (
		<div className="tree">
			<ul>
				<ItemNode item={item} allItems={allItems} onNodeClick={onNodeClick} />
			</ul>
		</div>
	);
}
