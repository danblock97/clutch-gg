"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Fuse from "fuse.js";

export default function ChampionsClientPage({ champions }) {
	const [searchTerm, setSearchTerm] = useState("");

	const fuse = useMemo(
		() =>
			new Fuse(champions, {
				keys: ["name"],
				threshold: 0.3,
			}),
		[champions]
	);

	const filteredChampions = useMemo(() => {
		if (!searchTerm) {
			return champions;
		}
		return fuse.search(searchTerm).map((result) => result.item);
	}, [searchTerm, champions, fuse]);

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-4xl font-bold mb-8 text-center">Champions</h1>
			<div className="mb-8 max-w-lg mx-auto">
				<input
					type="text"
					placeholder="Search for a champion..."
					className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					onChange={(e) => setSearchTerm(e.target.value)}
					value={searchTerm}
				/>
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
				{filteredChampions.map((champion) => (
					<Link
						key={champion.id}
						href={`/league/datastudio/champions/${champion.id}`}
						className="flex flex-col items-center p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
					>
						<Image
							src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${champion.squarePortraitPath
								.toLowerCase()
								.replace("/lol-game-data/assets", "")}`}
							alt={champion.name}
							width={80}
							height={80}
							className="rounded-md"
						/>
						<span className="mt-2 text-center text-sm font-semibold">
							{champion.name}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
}
