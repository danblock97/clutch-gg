"use client";

import { useState } from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";
import ItemTree from "./ItemTree";

export default function ItemModal({ initialItem, allItems, onClose }) {
	const [currentItem, setCurrentItem] = useState(initialItem);

	const handleNodeClick = (item) => {
		setCurrentItem(item);
	};

	const buildsInto = allItems.filter(
		(item) =>
			(item.from || []).includes(currentItem.id) && item.displayInItemSets
	);

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
			onClick={onClose}
		>
			<div
				className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto relative"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-white"
				>
					<FaTimes size={20} />
				</button>

				<div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
					{/* Builds From Tree */}
					<div className="w-full md:w-2/3">
						<h3 className="text-xl font-bold mb-4">Build Path</h3>
						<div className="bg-gray-800/50 p-4 rounded-lg min-h-[200px] flex items-center justify-center">
							<ItemTree
								item={currentItem}
								allItems={allItems}
								onNodeClick={handleNodeClick}
							/>
						</div>
					</div>

					{/* Divider */}
					<div className="w-px bg-gray-700 h-auto self-stretch mx-6 my-4 md:my-0"></div>

					{/* Main Item Display & Builds Into */}
					<div className="w-full md:w-1/3 flex flex-col">
						<div className="flex items-center border-b border-gray-700 pb-4 mb-4">
							<Image
								src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${currentItem.iconPath
									.toLowerCase()
									.replace("/lol-game-data/assets", "")}`}
								alt={currentItem.name}
								width={64}
								height={64}
								className="rounded-md"
							/>
							<div className="ml-4">
								<h2 className="text-2xl font-bold">{currentItem.name}</h2>
								{currentItem.priceTotal > 0 && (
									<p className="text-lg text-yellow-400">
										{currentItem.priceTotal}g
									</p>
								)}
							</div>
						</div>
						<div
							className="text-sm text-gray-300 mb-4 flex-grow"
							dangerouslySetInnerHTML={{ __html: currentItem.description }}
						></div>

						<div>
							<h3 className="text-xl font-bold mb-2">Builds Into</h3>
							<div className="bg-gray-800/50 p-4 rounded-lg min-h-[100px] flex flex-col space-y-2">
								{buildsInto.length > 0 ? (
									buildsInto.map((item, index) => (
										<div
											key={`${item.id}-${index}`}
											className="flex items-center p-1 rounded-md hover:bg-gray-700 cursor-pointer"
											onClick={(e) => {
												e.stopPropagation();
												handleNodeClick(item);
											}}
										>
											<Image
												src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${item.iconPath
													.toLowerCase()
													.replace("/lol-game-data/assets", "")}`}
												alt={item.name}
												width={32}
												height={32}
												className="rounded-md"
											/>
											<span className="ml-2 text-sm">{item.name}</span>
										</div>
									))
								) : (
									<p className="text-gray-400 text-center self-center w-full">
										Final item
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
