// filepath: d:\clutch-gg\src\components\tft\TopUnits.js
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaCrown } from "react-icons/fa";

// Helper function to properly map Community Dragon asset paths
function mapCDragonAssetPath(jsonPath) {
	if (!jsonPath) return null;
	const lower = jsonPath.toLowerCase().replace("/lol-game-data/assets", "");
	return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${lower}`;
}

// Function to generate TFT champion URL based on character ID using the /game/ path
function getTFTChampionImageUrl(characterId, championName) {
	if (!characterId) return null;

	// Skip loading images for special units like "summon"
	if (characterId.toLowerCase().includes("_summon")) {
		return null;
	}

	let setNumber = null;
	const match = characterId.match(/TFT(\d+)/i);
	if (match && match[1]) {
		setNumber = parseInt(match[1]);
	} else {
		// Cannot determine set number from characterId, return null or a placeholder
		return null;
	}

	let championBaseName = characterId.split("_")[1];
	if (!championBaseName) return null; // Cannot determine base name
	championBaseName = championBaseName.toLowerCase();

	// Use the consistent /game/ path
	const basePath = `https://raw.communitydragon.org/latest/game/assets/characters/tft${setNumber}_${championBaseName}/hud/tft${setNumber}_${championBaseName}_square`;

	// Return primary (.tft_setX.png) and fallback (.png) URLs
	return {
		primary: `${basePath}.tft_set${setNumber}.png`,
		fallback: `${basePath}.png`,
	};
}

// Cost-based color mapping for unit borders
const COST_COLORS = {
	0: "border-gray-500", // Special units
	1: "border-gray-400",
	2: "border-green-500",
	3: "border-blue-500",
	4: "border-purple-500",
	5: "border-yellow-400",
	6: "border-orange-400", // For special higher cost units (if any)
	7: "border-red-400", // For special higher cost units (if any)
};

export default function TopUnits({ matchDetails, summonerData }) {
	const [unitsData, setUnitsData] = useState({});
	const [dataDragonChampions, setDataDragonChampions] = useState({});
	const [topUnits, setTopUnits] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentSetNumber, setCurrentSetNumber] = useState(null);

	// Fetch units data from Community Dragon and Data Dragon
	useEffect(() => {
		async function fetchUnitsData() {
			try {
				// Fetch units data from Community Dragon
				const unitsResponse = await fetch(
					"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tftchampions.json"
				);
				const unitsJson = await unitsResponse.json();
				const unitsMap = {};

				unitsJson.forEach((unit) => {
					if (unit && unit.character_id) {
						const unitData = {
							name:
								unit.name ||
								unit.character_id.replace("TFT_", "").replace(/^TFT\d+_/, ""),
							characterId: unit.character_id,
							cost: unit.tier || 0,
							iconPath: unit.squareIconPath || unit.iconPath,
							traits: unit.traits || [],
						};
						unitsMap[unit.character_id] = unitData;
						// Store with lowercase key for case-insensitive lookup
						unitsMap[unit.character_id.toLowerCase()] = unitData;
					}
				});

				// Also fetch from Data Dragon for more accurate cost data
				try {
					const versionsResponse = await fetch(
						"https://ddragon.leagueoflegends.com/api/versions.json"
					);
					const versions = await versionsResponse.json();
					const latestVersion = versions[0];

					const dataDragonResponse = await fetch(
						`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/tft-champion.json`
					);
					const ddJson = await dataDragonResponse.json();
					setDataDragonChampions(ddJson.data || {});
				} catch (error) {
					// Error handling silently
				}

				setUnitsData(unitsMap);
			} catch (error) {
				// Error handling silently
			}
		}

		fetchUnitsData();
	}, []);

	// Helper function to get champion cost from Data Dragon data
	const getChampionCostFromDD = useCallback((characterId) => {
		if (!characterId || !dataDragonChampions) return 0;

		// Extract the champion name from character_id (e.g., "TFT14_Poppy" -> "Poppy")
		const nameMatch = characterId.match(/TFT\d+_(.+)/i);
		const championName = nameMatch && nameMatch[1];
		if (!championName) return 0;

		// Look for the champion in Data Dragon data
		for (const key in dataDragonChampions) {
			if (key.includes(championName)) {
				return dataDragonChampions[key].tier || 0;
			}
		}

		// Fallback to Community Dragon data
		return unitsData[characterId]?.cost || 0;
	}, [dataDragonChampions, unitsData]);

	// Process match data to extract unit statistics
	useEffect(() => {
		if (!matchDetails || matchDetails.length === 0 || !summonerData?.puuid) {
			setIsLoading(false);
			return;
		}

		try {
			// Determine current set number from the first match
			if (matchDetails[0]?.info?.tft_set_number) {
				setCurrentSetNumber(matchDetails[0].info.tft_set_number);
			}

			// Process match details to extract unit statistics
			const unitStats = {};
			let processedMatches = 0;

			// First, find matches from the current set and ranked queue only
			const currentSetRankedMatches = matchDetails.filter((match) => {
				return (
					match?.info?.tft_set_number ===
						matchDetails[0]?.info?.tft_set_number &&
					match?.info?.queue_id === 1100 // 1100 is TFT ranked queue
				);
			});

			// If no ranked matches, try using all matches from current set
			const matchesToProcess =
				currentSetRankedMatches.length > 0
					? currentSetRankedMatches
					: matchDetails.filter(
							(match) =>
								match?.info?.tft_set_number ===
								matchDetails[0]?.info?.tft_set_number
					  );

			// Process each match
			matchesToProcess.forEach((match) => {
				if (!match.info) {
					return;
				}

				// Find the participant (player) in the match using their PUUID
				const participant = match.info.participants?.find(
					(p) => p.puuid === summonerData.puuid
				);

				if (!participant) {
					return;
				}

				// Check for units array
				const units = participant.units;
				if (!Array.isArray(units) || units.length === 0) {
					return;
				}

				processedMatches++;

				// Process units data
				units.forEach((unit) => {
					if (!unit.character_id) return;

					const characterId = unit.character_id;

					if (!unitStats[characterId]) {
						unitStats[characterId] = {
							characterId: characterId,
							totalPlacements: 0,
							gamesPlayed: 0,
							totalStars: 0,
							totalItems: 0,
							itemCounts: {}, // Track frequency of items
							starCounts: {}, // Track frequency of star levels
						};
					}

					unitStats[characterId].totalPlacements += participant.placement;
					unitStats[characterId].gamesPlayed += 1;
					unitStats[characterId].totalStars += unit.tier || 1;
					unitStats[characterId].totalItems += unit.items?.length || 0;

					// Track star level counts
					const starLevel = unit.tier || 1;
					if (!unitStats[characterId].starCounts[starLevel]) {
						unitStats[characterId].starCounts[starLevel] = 0;
					}
					unitStats[characterId].starCounts[starLevel]++;

					// Track item frequencies
					if (Array.isArray(unit.items)) {
						unit.items.forEach((itemId) => {
							if (!unitStats[characterId].itemCounts[itemId]) {
								unitStats[characterId].itemCounts[itemId] = 0;
							}
							unitStats[characterId].itemCounts[itemId]++;
						});
					}
				});
			});

			// Calculate statistics and prepare data for display
			const unitsArray = Object.values(unitStats)
				.filter((unit) => unit.gamesPlayed > 0)
				.map((unit) => {
					// Find most common star level
					let mostCommonStarLevel = 1;
					let maxStarCount = 0;

					Object.entries(unit.starCounts).forEach(([stars, count]) => {
						if (count > maxStarCount) {
							maxStarCount = count;
							mostCommonStarLevel = Number(stars);
						}
					});

					// Find most common items (top 3)
					const itemEntries = Object.entries(unit.itemCounts);
					const topItems = itemEntries
						.sort((a, b) => b[1] - a[1])
						.slice(0, 3)
						.map((entry) => Number(entry[0]));

					// Get champion cost from Data Dragon or fallback
					const cost = getChampionCostFromDD(unit.characterId);

					return {
						...unit,
						cost,
						avgPlacement:
							Math.round((unit.totalPlacements / unit.gamesPlayed) * 10) / 10,
						avgStars:
							Math.round((unit.totalStars / unit.gamesPlayed) * 10) / 10,
						avgItems:
							Math.round((unit.totalItems / unit.gamesPlayed) * 10) / 10,
						mostCommonStarLevel,
						topItems,
					};
				});

			// Sort by most games played, then by best average placement
			unitsArray.sort((a, b) => {
				if (b.gamesPlayed !== a.gamesPlayed) {
					return b.gamesPlayed - a.gamesPlayed;
				}
				return a.avgPlacement - b.avgPlacement;
			});

			// Take top 6 units
			const top = unitsArray.slice(0, 6);

			setTopUnits(top);
			setIsLoading(false);
		} catch (error) {
			// Error handling silently
			setIsLoading(false);
		}
	}, [matchDetails, summonerData, getChampionCostFromDD]);

	// Get color based on placement
	const getPlacementColor = (avgPlacement) => {
		if (avgPlacement <= 1) return "text-yellow-400";
		if (avgPlacement <= 3) return "text-blue-400";
		if (avgPlacement <= 4) return "text-green-500";
		return "text-red-400";
	};

	// Render stars based on unit's most common star level
	const renderStars = (starLevel) => {
		return (
			<div className="flex">
				{[...Array(starLevel)].map((_, i) => (
					<div key={i} className="text-yellow-400 text-xs">
						★
					</div>
				))}
			</div>
		);
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="card-highlight mt-4 p-4">
				<h2 className="text-lg font-bold mb-4">Top Units</h2>
				<div className="animate-pulse grid grid-cols-2 sm:grid-cols-3 gap-2">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="h-20 bg-gray-700/50 rounded"></div>
					))}
				</div>
			</div>
		);
	}

	// No match data available
	if (!matchDetails || matchDetails.length === 0) {
		return (
			<div className="card-highlight mt-4 p-4">
				<h2 className="text-lg font-bold mb-4">Top Units</h2>
				<div className="text-center text-gray-400 py-4">
					No match history data available
				</div>
			</div>
		);
	}

	// Fallback if no units were found from valid matches
	if (topUnits.length === 0) {
		return (
			<div className="card-highlight mt-4 p-4">
				<h2 className="text-lg font-bold mb-4">Top Units</h2>
				<div className="text-center text-gray-400 py-4">
					No unit data found in your recent ranked matches
				</div>
			</div>
		);
	}

	// Render top units
	return (
		<div className="card-highlight mt-4 p-4">
			<h2 className="text-lg font-bold mb-4 flex items-center">
				<FaCrown className="text-[--gold] mr-2" /> Top Units
				{currentSetNumber && (
					<span className="text-sm font-normal text-gray-400 ml-2">
						Set {currentSetNumber} (Ranked)
					</span>
				)}
			</h2>

			<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
				{topUnits.map((unit) => {
					// Get unit info with proper fallbacks
					const champData = unitsData[unit.characterId] ||
						unitsData[unit.characterId.toLowerCase()] || {
							name: unit.characterId
								.replace("TFT_", "")
								.replace(/^TFT\d+_/, ""),
							cost: 1,
						};

					// Format display name - get proper name from data or format from ID
					const displayName =
						champData.name ||
						unit.characterId.split("_")[1] ||
						unit.characterId.replace(/^TFT\d+_/, "");

					// Get proper image URL using the same function as MatchHistory
					const cdnUrl = getTFTChampionImageUrl(unit.characterId, displayName);

					// Get cost and border color
					const cost = unit.cost || champData.cost || 1;
					const costColor = COST_COLORS[cost] || COST_COLORS[1];

					return (
						<div
							key={unit.characterId}
							className="flex flex-col p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors duration-150"
						>
							<div className="flex items-center">
								{/* Unit Icon with Cost Border */}
								<div
									className={`w-12 h-12 flex-shrink-0 mr-3 relative border-2 ${costColor} rounded-md overflow-hidden`}
								>
									{cdnUrl ? (
										<Image
											src={typeof cdnUrl === "object" ? cdnUrl.primary : cdnUrl}
											alt={displayName}
											width={48}
											height={48}
											className="object-cover"
											unoptimized
											onError={(e) => {
												const imageElement = e.currentTarget;
												// Check if the source is already the fallback URL
												if (
													typeof cdnUrl === "object" &&
													cdnUrl.fallback &&
													imageElement.src === cdnUrl.fallback
												) {
													// Fallback has already been tried and failed
													imageElement.style.display = "none"; // Hide the broken image
													const fallbackText = imageElement
														.closest("div")
														.querySelector(".fallback-text");
													if (fallbackText) fallbackText.style.display = "flex"; // Show text placeholder
												} else if (
													typeof cdnUrl === "object" &&
													cdnUrl.fallback
												) {
													// Primary failed, try the fallback URL
													imageElement.src = cdnUrl.fallback;
												} else {
													// Primary failed and there is no fallback URL (or cdnUrl wasn't an object)
													imageElement.style.display = "none"; // Hide the broken image
													const fallbackText = imageElement
														.closest("div")
														.querySelector(".fallback-text");
													if (fallbackText) fallbackText.style.display = "flex"; // Show text placeholder
												}
											}}
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-700">
											{displayName.charAt(0) || "?"}
										</div>
									)}
									<div className="fallback-text hidden w-full h-full items-center justify-center text-xs text-gray-400 bg-gray-700">
										{displayName.charAt(0) || "?"}
									</div>

									{/* Star Badge */}
									<div className="absolute bottom-0 right-0 bg-black/70 px-1 text-[10px]">
										{renderStars(unit.mostCommonStarLevel)}
									</div>
								</div>

								{/* Unit Info */}
								<div className="flex-grow overflow-hidden">
									<div className="font-medium text-white text-sm truncate">
										{displayName}
									</div>
									<div className="text-xs text-gray-400 flex items-center">
										<span>
											{unit.gamesPlayed} game{unit.gamesPlayed !== 1 ? "s" : ""}
										</span>
									</div>
									<div
										className={`text-sm font-bold ${getPlacementColor(
											unit.avgPlacement
										)}`}
									>
										#{unit.avgPlacement} avg
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
