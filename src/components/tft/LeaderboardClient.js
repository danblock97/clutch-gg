"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { buildProfileUrl } from "@/lib/utils/urlHelpers";

const regions = [
	{ code: "euw1", name: "Europe West" },
	{ code: "na1", name: "North America" },
	{ code: "kr", name: "Korea" },
	{ code: "eun1", name: "Europe Nordic & East" },
	{ code: "br1", name: "Brazil" },
	{ code: "jp1", name: "Japan" },
	{ code: "la1", name: "Latin America North" },
	{ code: "la2", name: "Latin America South" },
	{ code: "oc1", name: "Oceania" },
	{ code: "ru", name: "Russia" },
	{ code: "tr1", name: "Turkey" },
];

export default function LeaderboardClient() {
	const searchParams = useSearchParams();
	const [leaderboardData, setLeaderboardData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedRegion, setSelectedRegion] = useState(
		searchParams.get("region") || "euw1"
	);

	useEffect(() => {
		async function fetchLeaderboardData() {
			setLoading(true);
			try {
				const response = await fetch(
					`/api/tft/leaderboard?region=${selectedRegion}`
				);
				if (!response.ok) {
					throw new Error("Failed to fetch leaderboard data");
				}
				const data = await response.json();
				setLeaderboardData(data);
			} catch (error) {
				console.error("Error fetching leaderboard data:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchLeaderboardData();
	}, [selectedRegion]);

	const handleRegionChange = (e) => {
		setSelectedRegion(e.target.value);
	};

	return (
		<div>
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
				<h2 className="text-xl font-semibold text-white mb-4 md:mb-0">
					Challenger Players
				</h2>
				<div className="w-full md:w-auto">
					<select
						value={selectedRegion}
						onChange={handleRegionChange}
						className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
					>
						{regions.map((region) => (
							<option key={region.code} value={region.code}>
								{region.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{loading ? (
				<p className="text-gray-400 text-center py-8">
					Loading leaderboard data...
				</p>
			) : leaderboardData.length > 0 ? (
				<div className="bg-gray-800 rounded-lg overflow-hidden">
					<div className="grid grid-cols-12 gap-2 p-4 bg-gray-700 text-gray-300 font-semibold text-sm">
						<div className="col-span-1 text-center">#</div>
						<div className="col-span-5 md:col-span-4">Summoner</div>
						<div className="col-span-2 text-center">Tier</div>
						<div className="col-span-2 text-center">LP</div>
						<div className="col-span-2 md:col-span-3 text-center">Win Rate</div>
					</div>

					{leaderboardData.map((player, index) => (
						<div
							key={player.summonerId}
							className="grid grid-cols-12 gap-2 p-4 border-t border-gray-700 text-white hover:bg-gray-700 transition-colors"
						>
							<div className="col-span-1 text-center font-semibold">
								{index + 1}
							</div>
							<div className="col-span-5 md:col-span-4 flex items-center">
								<Link
									href={buildProfileUrl("tft", selectedRegion, player.profileData?.gameName || "Unknown", player.profileData?.tagLine || "Unknown") || 
										`/tft/profile?gameName=${encodeURIComponent(
											player.profileData?.gameName || "Unknown"
										)}&tagLine=${encodeURIComponent(
											player.profileData?.tagLine || "Unknown"
										)}&region=${selectedRegion}`}
									className="hover:text-blue-400 transition-colors flex items-center"
								>
									{player.profileData?.profileIconId ? (
										<Image
											src={`https://ddragon.leagueoflegends.com/cdn/16.1.1/img/profileicon/${player.profileData.profileIconId}.png`}
											alt="Profile icon"
											width={32}
											height={32}
											className="rounded-full mr-2"
										/>
									) : (
										<div className="w-8 h-8 bg-gray-600 rounded-full mr-2" />
									)}
									<span className="truncate">
										{player.profileData?.gameName || "Unknown"}
										<span className="text-gray-400">
											#{player.profileData?.tagLine || "Unknown"}
										</span>
									</span>
								</Link>
							</div>
							<div className="col-span-2 text-center self-center">
								Challenger
							</div>
							<div className="col-span-2 text-center self-center font-semibold text-yellow-400">
								{player.leaguePoints} LP
							</div>
							<div className="col-span-2 md:col-span-3 text-center self-center">
								{player.wins + player.losses > 0 ? (
									<span>
										{Math.round(
											(player.wins / (player.wins + player.losses)) * 100
										)}
										%
										<span className="text-gray-400 text-sm ml-1">
											({player.wins}W {player.losses}L)
										</span>
									</span>
								) : (
									"N/A"
								)}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
					No leaderboard data available for this region.
				</div>
			)}
		</div>
	);
}
