import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaTrophy } from "react-icons/fa";

// Helper function to properly map Community Dragon asset paths (same as in MatchHistory)
function mapCDragonAssetPath(jsonPath) {
	if (!jsonPath) return null;
	const lower = jsonPath.toLowerCase().replace("/lol-game-data/assets", "");
	return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${lower}`;
}

// Helper function to format trait names
function formatTraitName(traitId) {
	// Remove the TFT set prefix (like "TFT14_")
	let name = traitId.replace(/^TFT\d+_/, "");

	// Insert spaces before capital letters and trim any extra spaces
	return name.replace(/([A-Z])/g, " $1").trim();
}

// Map of style indexes to style names and URLs
const TRAIT_STYLES = {
	2: {
		name: "kBronze",
		url: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-tft-team-planner/global/default/images/cteamplanner_activetrait_kbronze.png",
	},
	3: {
		name: "kSilver",
		url: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-tft-team-planner/global/default/images/cteamplanner_activetrait_ksilver.png",
	},
	4: {
		name: "kGold",
		url: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-tft-team-planner/global/default/images/cteamplanner_activetrait_kgold.png",
	},
	5: {
		name: "kGold",
		url: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-tft-team-planner/global/default/images/cteamplanner_activetrait_kgold.png",
	},
	6: {
		name: "kChromatic",
		url: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-tft-team-planner/global/default/images/cteamplanner_activetrait_kchromatic.png",
	},
};

// Default to bronze style if not specified or below bronze
const DEFAULT_STYLE = {
	name: "kBronze",
	url: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-tft-team-planner/global/default/images/cteamplanner_activetrait_kbronze.png",
};

export default function TopTraits({ matchDetails, summonerData }) {
	const [traitsData, setTraitsData] = useState({});
	const [topTraits, setTopTraits] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentSetNumber, setCurrentSetNumber] = useState(null);

	// Debug logging
	useEffect(() => {
		if (matchDetails) {
			console.log(`TopTraits: Received ${matchDetails.length} matches`);
			console.log(
				`TopTraits: Looking for player PUUID: ${summonerData?.puuid?.slice(
					0,
					10
				)}...`
			);
		}
	}, [matchDetails, summonerData]);

	useEffect(() => {
		async function fetchTraitsData() {
			try {
				console.log("TopTraits: Fetching traits data");
				// Fetch traits data from Community Dragon
				const traitsResponse = await fetch(
					"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tfttraits.json"
				);
				const traitsJson = await traitsResponse.json();
				const traitsMap = {};

				traitsJson.forEach((trait) => {
					if (trait && trait.trait_id) {
						const traitData = {
							name: trait.name || formatTraitName(trait.trait_id),
							description: trait.desc,
							iconPath: trait.icon_path,
							traitId: trait.trait_id,
							conditionalTraitSets: trait.conditional_trait_sets || [],
						};
						traitsMap[trait.trait_id] = traitData;
						traitsMap[trait.trait_id.toUpperCase()] = traitData;
					}
				});

				setTraitsData(traitsMap);
				console.log(
					`TopTraits: Loaded ${Object.keys(traitsMap).length} traits`
				);
			} catch (error) {
				console.error("Error fetching traits data:", error);
			}
		}

		fetchTraitsData();
	}, []);

	// Process match data separately to avoid dependencies on traitsData
	useEffect(() => {
		if (!matchDetails || matchDetails.length === 0 || !summonerData?.puuid) {
			setIsLoading(false);
			return;
		}

		try {
			console.log("TopTraits: Processing match history");
			// Determine current set number from the first match
			if (matchDetails[0]?.info?.tft_set_number) {
				setCurrentSetNumber(matchDetails[0].info.tft_set_number);
				console.log(
					`TopTraits: Current set is ${matchDetails[0].info.tft_set_number}`
				);
			}

			// Process match details to extract trait statistics
			const traitStats = {};
			let processedMatches = 0;

			// First, find matches from the current set
			const currentSetMatches = matchDetails.filter((match) => {
				return (
					match?.info?.tft_set_number === matchDetails[0]?.info?.tft_set_number
				);
			});

			console.log(
				`TopTraits: Found ${currentSetMatches.length} matches from the current set`
			);

			// Use the same approach as MatchHistory component to find the player in each match
			currentSetMatches.forEach((match) => {
				if (!match.info) {
					console.log("TopTraits: Match missing info data");
					return;
				}

				// Find the participant (player) in the match using their PUUID
				const participant = match.info.participants?.find(
					(p) => p.puuid === summonerData.puuid
				);

				if (!participant) {
					console.log(
						`TopTraits: Player with PUUID ${summonerData.puuid.slice(
							0,
							8
						)}... not found in participants`
					);
					return;
				}

				// Check for traits array
				const traits = participant.traits;
				if (!Array.isArray(traits) || traits.length === 0) {
					console.log("TopTraits: No traits found for participant");
					return;
				}

				processedMatches++;

				// Find the active/significant traits in this match
				// First get all traits with a style > 0 (active threshold reached)
				const activeTraits = traits.filter((trait) => trait.style > 0);

				// If no active traits (unlikely), fallback to using traits with most units
				if (activeTraits.length === 0) {
					// Sort by units and take top 3
					const significantTraits = [...traits]
						.filter((trait) => trait.num_units > 0)
						.sort((a, b) => b.num_units - a.num_units)
						.slice(0, 3);

					// Process only these significant traits
					significantTraits.forEach((trait) => {
						processTraitStats(trait, participant, traitStats);
					});
				} else {
					// Process only active traits
					activeTraits.forEach((trait) => {
						processTraitStats(trait, participant, traitStats);
					});
				}
			});

			// Helper function to process a trait and update trait stats
			function processTraitStats(trait, participant, traitStats) {
				if (!trait || !trait.name) return;

				const traitName = trait.name;

				if (!traitStats[traitName]) {
					traitStats[traitName] = {
						name: traitName,
						totalPlacements: 0,
						gamesPlayed: 0,
						totalUnits: 0,
						styleCounts: {}, // Track occurrences of each style
						unitCounts: {}, // Track occurrences of each unit count
					};
				}

				traitStats[traitName].totalPlacements += participant.placement;
				traitStats[traitName].gamesPlayed += 1;
				traitStats[traitName].totalUnits += trait.num_units || 0;

				// Track style counts
				const style = trait.style || 0;
				if (!traitStats[traitName].styleCounts[style]) {
					traitStats[traitName].styleCounts[style] = 0;
				}
				traitStats[traitName].styleCounts[style]++;

				// Track unit counts
				const unitCount = trait.num_units || 0;
				if (!traitStats[traitName].unitCounts[unitCount]) {
					traitStats[traitName].unitCounts[unitCount] = 0;
				}
				traitStats[traitName].unitCounts[unitCount]++;
			}

			console.log(
				`TopTraits: Processed ${processedMatches} matches with valid data`
			);
			console.log(
				`TopTraits: Found ${Object.keys(traitStats).length} unique traits`
			);

			// Calculate most frequent style and unit count for each trait
			const traitsArray = Object.values(traitStats)
				.filter((trait) => trait.gamesPlayed > 0)
				.map((trait) => {
					// Find most common style
					let mostCommonStyle = 0;
					let maxStyleCount = 0;

					Object.entries(trait.styleCounts).forEach(([style, count]) => {
						if (count > maxStyleCount) {
							maxStyleCount = count;
							mostCommonStyle = Number(style);
						}
					});

					// Find most common unit count
					let mostCommonUnitCount = 0;
					let maxUnitCount = 0;

					Object.entries(trait.unitCounts).forEach(([units, count]) => {
						if (count > maxUnitCount) {
							maxUnitCount = count;
							mostCommonUnitCount = Number(units);
						}
					});

					return {
						...trait,
						avgPlacement: Math.round(trait.totalPlacements / trait.gamesPlayed),
						avgUnits: Math.round(trait.totalUnits / trait.gamesPlayed),
						mostCommonStyle,
						mostCommonUnitCount,
					};
				});

			// Log the trait stats before sorting
			console.log(
				"Trait stats before sorting:",
				traitsArray.map(
					(t) =>
						`${t.name}: ${t.gamesPlayed} games, style:${t.mostCommonStyle}, avg:${t.avgPlacement}`
				)
			);

			// Sort by most games played, then by best average placement
			traitsArray.sort((a, b) => {
				if (b.gamesPlayed !== a.gamesPlayed) {
					return b.gamesPlayed - a.gamesPlayed;
				}
				return a.avgPlacement - b.avgPlacement;
			});

			// Take top 4 traits or all if less than 4
			const top = traitsArray.slice(0, 4);
			console.log(`TopTraits: Selected ${top.length} top traits`);

			// Log the final selection
			console.log(
				"Final top traits:",
				top.map(
					(t) =>
						`${t.name}: ${t.gamesPlayed} games, style:${t.mostCommonStyle}, avg:${t.avgPlacement}`
				)
			);

			setTopTraits(top);
			setIsLoading(false);
		} catch (error) {
			console.error("Error processing trait statistics:", error);
			setIsLoading(false);
		}
	}, [matchDetails, summonerData]);

	// Get color based on placement
	const getPlacementColor = (avgPlacement) => {
		if (avgPlacement <= 1) return "text-yellow-400";
		if (avgPlacement <= 3) return "text-blue-400";
		if (avgPlacement <= 4) return "text-green-500";
		return "text-red-400";
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="card-highlight mt-4 p-4">
				<h2 className="text-lg font-bold mb-4">Top Traits</h2>
				<div className="animate-pulse space-y-2">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="h-12 bg-gray-700/50 rounded"></div>
					))}
				</div>
			</div>
		);
	}

	// No match data available
	if (!matchDetails || matchDetails.length === 0) {
		return (
			<div className="card-highlight mt-4 p-4">
				<h2 className="text-lg font-bold mb-4">Top Traits</h2>
				<div className="text-center text-gray-400 py-4">
					No match history data available
				</div>
			</div>
		);
	}

	// Fallback if no traits were found from valid matches
	if (topTraits.length === 0) {
		return (
			<div className="card-highlight mt-4 p-4">
				<h2 className="text-lg font-bold mb-4">Top Traits</h2>
				<div className="text-center text-gray-400 py-4">
					No trait data found in your recent matches
				</div>
			</div>
		);
	}

	// Render top traits
	return (
		<div className="card-highlight mt-4 p-4">
			<h2 className="text-lg font-bold mb-4 flex items-center">
				<FaTrophy className="text-[--gold] mr-2" /> Top Traits
				{currentSetNumber && (
					<span className="text-sm font-normal text-gray-400 ml-2">
						Set {currentSetNumber}
					</span>
				)}
			</h2>

			<div className="space-y-3">
				{topTraits.map((trait) => {
					const traitInfo = traitsData[trait.name.toUpperCase()] ||
						traitsData[trait.name] || { name: formatTraitName(trait.name) };

					const iconPath = traitInfo.iconPath;
					const iconUrl = iconPath ? mapCDragonAssetPath(iconPath) : null;

					// Format the display name correctly
					const displayName = traitInfo.name || formatTraitName(trait.name);

					// Get style data for the trait - default to bronze for any style below 2
					let styleData = DEFAULT_STYLE; // Default to bronze
					if (trait.mostCommonStyle >= 2) {
						styleData = TRAIT_STYLES[trait.mostCommonStyle] || DEFAULT_STYLE;
					}

					return (
						<div
							key={trait.name}
							className="flex items-center p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
						>
							{/* Trait Icon with Style Frame */}
							<div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3 relative">
								{/* Style Border Image - always show at least bronze */}
								<div className="absolute inset-0 z-0">
									<Image
										src={styleData.url}
										alt={styleData.name}
										width={40}
										height={40}
										className="object-contain"
										unoptimized
									/>
								</div>

								{/* Trait Icon */}
								<div className="absolute inset-0 z-10 flex items-center justify-center">
									{iconUrl ? (
										<Image
											src={iconUrl}
											alt={displayName}
											width={30}
											height={30}
											className="object-contain"
											unoptimized
											onError={(e) => {
												e.currentTarget.style.display = "none";
												const fallback = e.currentTarget.nextElementSibling;
												if (fallback) fallback.style.display = "flex";
											}}
										/>
									) : (
										<div className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 bg-gray-700 rounded-full">
											{displayName.charAt(0) || "?"}
										</div>
									)}
									<div className="fallback-text hidden w-8 h-8 items-center justify-center text-xs text-gray-400 bg-gray-700 rounded-full">
										{displayName.charAt(0) || "?"}
									</div>
								</div>

								{/* Badge showing unit count */}
								{trait.mostCommonUnitCount > 0 && (
									<div className="absolute -bottom-1 -right-1 bg-gray-800 text-[10px] px-1 rounded-full border border-gray-600 z-20">
										{trait.mostCommonUnitCount}
									</div>
								)}
							</div>

							{/* Trait Info */}
							<div className="flex-grow">
								<div className="font-medium text-white">{displayName}</div>
								<div className="text-xs text-gray-400 flex items-center">
									<span>
										{trait.gamesPlayed} game{trait.gamesPlayed !== 1 ? "s" : ""}
									</span>
									{trait.avgUnits > 0 && (
										<span className="ml-2 text-gray-500">
											· {trait.avgUnits} units
										</span>
									)}
								</div>
							</div>

							{/* Placement */}
							<div className="text-right">
								<div
									className={`text-lg font-bold ${getPlacementColor(
										trait.avgPlacement
									)}`}
								>
									#{trait.avgPlacement}
								</div>
								<div className="text-xs text-gray-400">avg placement</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
