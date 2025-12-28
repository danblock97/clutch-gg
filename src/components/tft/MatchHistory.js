import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
	FaClock,
	FaCoins,
	FaChartLine,
	FaStar,
	FaChevronDown,
	FaChevronUp,
} from "react-icons/fa";
import TFTMatchDetails from "./MatchDetails";
import {
	fetchTFTCompanions,
	getCompanionIconUrl,
} from "@/lib/tft/companionsApi";

function useBreakpoint() {
	const [breakpoint, setBreakpoint] = useState("mobile");

	useEffect(() => {
		function handleResize() {
			const width = window.innerWidth;
			if (width < 768) {
				setBreakpoint("mobile");
			} else if (width < 1024) {
				setBreakpoint("md");
			} else {
				setBreakpoint("lg");
			}
		}

		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return breakpoint;
}

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

// Helper function to get border color based on champion cost
function getBorderColorForCost(cost) {
	switch (cost) {
		case 1:
			return "border-gray-400";
		case 2:
			return "border-green-500";
		case 3:
			return "border-blue-500";
		case 4:
			return "border-purple-500";
		case 5:
			return "border-yellow-500";
		case 0: // Special / Summoned units
			return "border-teal-400";
		default:
			return "border-gray-700";
	}
}

// Helper function to get star color based on champion cost
function getStarColorForCost(cost) {
	switch (cost) {
		case 1:
			return "text-gray-400";
		case 2:
			return "text-green-400";
		case 3:
			return "text-blue-400";
		case 4:
			return "text-purple-400";
		case 5:
			return "text-yellow-400";
		case 0: // Special / Summoned units
			return "text-teal-400";
		default:
			return "text-gray-600";
	}
}

// Helper function for trait styling based on tier
function getTraitChipStyle(style) {
	switch (style) {
		case 4:
			return "bg-gradient-to-br from-purple-400 via-pink-500 to-yellow-400 text-white shadow-lg border border-purple-300/50"; // Prismatic
		case 3:
			return "bg-yellow-500/40 text-yellow-100 border border-yellow-500"; // Gold
		case 2:
			return "bg-gray-400/40 text-gray-100 border border-gray-400"; // Silver
		case 1:
			return "bg-[#cd7f32]/40 text-[#ffbf80] border border-[#cd7f32]"; // Bronze
		default:
			return "bg-black/30 text-gray-400 border border-gray-700"; // Inactive
	}
}

// Helper function to format game stage
function formatStage(round) {
	if (round <= 0) return "-";
	const stage = Math.ceil(round / 7) + 1;
	const subStage = round % 7 || (round > 0 ? 7 : 0);
	if (stage <= 1) return "-";
	return `Stage ${stage}-${subStage}`;
}

// Function to get gradient background based on placement
const getGradientBackground = (placement) => {
	if (placement === 1) {
		// 1st place: Gold gradient
		return "bg-gradient-to-r from-[--card-bg] via-yellow-500/20 to-[--card-bg] border border-[--card-border]";
	} else if (placement <= 4) {
		// 2nd-4th place: Blue gradient (Top 4)
		return "bg-gradient-to-r from-[--card-bg] via-blue-500/20 to-[--card-bg] border border-[--card-border]";
	} else {
		// 5th-8th place: Red gradient (Bottom 4)
		return "bg-gradient-to-r from-[--card-bg] via-red-600/20 to-[--card-bg] border border-[--card-border]";
	}
};

export default function TFTMatchHistory({ matchDetails, summonerData }) {
	const [traitsData, setTraitsData] = useState({});
	const [itemsData, setItemsData] = useState({});
	const [championsData, setChampionsData] = useState({});
	const [dataDragonChampions, setDataDragonChampions] = useState({});
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [companionsData, setCompanionsData] = useState({});
	const [expandedMatchId, setExpandedMatchId] = useState(null);

	const toggleExpand = (matchId) => {
		setExpandedMatchId(expandedMatchId === matchId ? null : matchId);
	};
	const matchesPerPage = 10;
	const breakpoint = useBreakpoint();
	const router = useRouter();

	// Fetch TFT data (traits, items, champions, companions)
	useEffect(() => {
		async function fetchTFTData() {
			try {
				// Fetch traits from Community Dragon
				const traitsResponse = await fetch(
					"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tfttraits.json"
				);
				const traitsJson = await traitsResponse.json();
				const traitsMap = {};
				traitsJson.forEach((trait) => {
					if (trait && trait.trait_id) {
						const traitData = {
							name: trait.name,
							description: trait.desc,
							iconPath: trait.icon_path,
						};
						traitsMap[trait.trait_id] = traitData;
						traitsMap[trait.trait_id.toUpperCase()] = traitData;
					}
				});

				// Fetch items from Community Dragon
				const itemsResponse = await fetch(
					"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tftitems.json"
				);
				const itemsJson = await itemsResponse.json();
				const itemsMap = {};
				itemsJson.forEach((item) => {
					// Store by numeric ID
					if (item.id !== undefined) {
						itemsMap[item.id] = {
							name: item.name,
							description: item.desc,
							iconPath: item.squareIconPath,
						};
					}

					// Also store by nameId (for TFT_Item_X format)
					if (item.nameId) {
						itemsMap[item.nameId] = {
							name: item.name,
							description: item.desc,
							iconPath: item.squareIconPath,
						};
					}
				});

				// Fetch champions from Community Dragon for basic info
				const championsResponse = await fetch(
					"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tftchampions.json"
				);
				const championsJson = await championsResponse.json();
				const championsMap = {};
				championsJson.forEach((champion) => {
					if (champion && champion.character_id) {
						const champData = {
							name: champion.name,
							cost: champion.cost,
							traits: champion.traits || [],
							iconPath: champion.squareIconPath,
						};
						championsMap[champion.character_id] = champData;
						championsMap[champion.character_id.toUpperCase()] = champData;
					}
				});

				// Fetch champions from Data Dragon for more accurate cost data
				try {
					const versionsResponse = await fetch(
						"https://ddragon.leagueoflegends.com/api/versions.json"
					);
					const versions = await versionsResponse.json();
					const latestVersion = versions[0]; // Get latest LoL patch version

					const dataDragonResponse = await fetch(
						`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/tft-champion.json`
					);
					const ddJson = await dataDragonResponse.json();
					setDataDragonChampions(ddJson.data || {});
				} catch (error) {
					console.error("Error fetching Data Dragon champions:", error);
				}

				// Fetch companions data
				const companions = await fetchTFTCompanions();
				setCompanionsData(companions);

				setTraitsData(traitsMap);
				setItemsData(itemsMap);
				setChampionsData(championsMap);
				setIsDataLoaded(true);
			} catch (error) {
				console.error("Error fetching TFT data:", error);
				setIsDataLoaded(true);
			}
		}
		fetchTFTData();
	}, []);

	// Helper function to get champion cost from Data Dragon data
	const getChampionCostFromDD = (characterId) => {
		if (!characterId || !dataDragonChampions) return 0;
		const lowerCaseId = characterId.toLowerCase();

		// Attempt lookup using the full character ID (e.g., tft16_lucian) if available in DDragon keys
		// Data Dragon keys usually have specific casing, so we check case-insensitively by iterating if needed
		// properly optimized:
		if (dataDragonChampions[characterId]) {
			return dataDragonChampions[characterId].tier || 0;
		}

		// Try finding key case-insensitively directly
		const ddKeys = Object.keys(dataDragonChampions);
		const exactMatchKey = ddKeys.find(key => key.toLowerCase() === lowerCaseId);
		if (exactMatchKey) {
			return dataDragonChampions[exactMatchKey].tier || 0;
		}

		// Fallback: Extract name part and set number to find the correct version
		// e.g., "tft16_lucian" -> set "16", name "lucian"
		const match = lowerCaseId.match(/tft(\d+)_(.+)/);
		const setNumber = match ? match[1] : null;
		const championName = match ? match[2] : null;

		if (championName) {
			let bestMatch = null;

			for (const key of ddKeys) {
				const lowerKey = key.toLowerCase();
				// Check if DDragon key ends with the extracted name
				if (lowerKey.endsWith(championName)) {
					// If we have a set number, verify the key also contains it (e.g. "tft16" or "set16")
					if (setNumber) {
						if (lowerKey.includes(`tft${setNumber}`) || lowerKey.includes(`set${setNumber}`)) {
							return dataDragonChampions[key].tier || 0; // Found exact set match
						}
					} else {
						// No set number in ID? Just take the first match, or keep searching?
						// For now, keep the first match found, but set specific matches are prioritized above.
						if (!bestMatch) bestMatch = dataDragonChampions[key];
					}
				}
			}
			// Return the best filtered match if found
			if (bestMatch) return bestMatch.tier || 0;
		}

		// Final fallback to Community Dragon data
		return championsData[characterId.toUpperCase()]?.cost || 0;
	};

	// Pagination logic
	const totalMatches = matchDetails.length;
	const totalPages = Math.ceil(totalMatches / matchesPerPage);
	const indexOfLastMatch = currentPage * matchesPerPage;
	const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
	const currentMatches = matchDetails.slice(
		indexOfFirstMatch,
		indexOfLastMatch
	);
	// Group matches by date
	const matchesByDay = currentMatches.reduce((acc, match) => {
		// Handle multiple possible date field formats
		const gameDateRaw =
			match.info.game_datetime ?? match.info.gameCreation ?? Date.now();
		let matchDate = new Date(gameDateRaw);

		// Validate the date
		if (isNaN(matchDate.getTime())) {
			// If invalid date, use current date as fallback
			matchDate = new Date();
		}

		const formattedDate = matchDate.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
		});
		if (!acc[formattedDate]) {
			acc[formattedDate] = [];
		}
		acc[formattedDate].push(match);
		return acc;
	}, {});

	// Handle page change function
	const handlePageChange = (pageNumber) => {
		if (pageNumber < 1 || pageNumber > totalPages) return;
		setCurrentPage(pageNumber);
		// Reset expanded match when changing pages
		setExpandedMatchId(null);
	};

	// Loading state
	if (!isDataLoaded) {
		return (
			<div className="flex justify-center items-center py-10 bg-[--background-alt] rounded-lg">
				<div className="lds-ring">
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
				<span className="ml-3 text-[--text-secondary]">
					Loading match data...
				</span>
			</div>
		);
	}

	// Empty state
	if (!matchDetails || matchDetails.length === 0) {
		return (
			<div className="empty-match-history bg-[--background-alt] rounded-lg">
				<div className="flex flex-col items-center justify-center py-12 px-4">
					<Image
						src="/images/bee-sad.png"
						alt="No matches found"
						width={100}
						height={100}
						className="opacity-60 mb-4"
						unoptimized
					/>
					<h3 className="text-lg font-semibold mb-2 text-[--text-primary]">
						No Recent Matches Found
					</h3>
					<p className="text-[--text-secondary] text-center max-w-md text-sm">
						We couldn't find any TFT matches for this summoner. Play a match!
					</p>
				</div>
			</div>
		);
	}

	const filteredMatches = matchDetails.filter(
		(match) =>
			match &&
			match.info &&
			Array.isArray(match.info.participants) &&
			match.info.participants.length > 0 &&
			(match.info.game_datetime || match.info.gameCreation)
	);

	return (
		<div className="space-y-2 overflow-x-auto">
			{Object.entries(matchesByDay).map(([day, matches]) => (
				<div key={day} className="mb-4">
					<h2 className="text-xl font-semibold text-[--text-primary] my-4">
						{day}
					</h2>{" "}
					{matches.map((match, index) => {
						// Get participant and basic match data
						const participant = match.info?.participants?.find(
							(p) => p.puuid === summonerData.puuid
						);
						if (!participant) return null;
						const matchId = match.metadata.match_id || `match-${index}`;

						// Enhanced defensive date handling with proper timestamp conversion
						let gameDateRaw =
							match.info.game_datetime ?? match.info.gameCreation ?? 0;

						// Handle different timestamp formats
						// game_datetime might be in seconds, gameCreation is typically in milliseconds
						if (typeof gameDateRaw === "number" && gameDateRaw < 1e12) {
							// If timestamp is less than 1e12, it's likely in seconds, convert to milliseconds
							gameDateRaw = gameDateRaw * 1000;
						}

						const gameDate = new Date(gameDateRaw);
						const now = new Date();

						// Validate the date and provide fallback
						if (isNaN(gameDate.getTime()) || gameDate.getTime() === 0) {
							// Use current time minus a reasonable offset as fallback
							gameDate.setTime(now.getTime() - index * 3600000); // Subtract hours based on index
						}

						const diffTime = Math.abs(now - gameDate);
						const diffMinutes = Math.floor(diffTime / (1000 * 60));
						const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
						const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
						const diffWeeks = Math.floor(diffDays / 7);
						const diffMonths = Math.floor(diffDays / 30);
						const diffYears = Math.floor(diffDays / 365);

						let formattedTimeAgo;
						if (diffTime < 60000) {
							formattedTimeAgo = "Just now";
						} else if (diffMinutes < 60) {
							formattedTimeAgo = `${diffMinutes}m ago`;
						} else if (diffHours < 24) {
							formattedTimeAgo = `${diffHours}h ago`;
						} else if (diffDays < 7) {
							formattedTimeAgo = `${diffDays}d ago`;
						} else if (diffWeeks < 4) {
							formattedTimeAgo =
								diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
						} else if (diffMonths < 12) {
							formattedTimeAgo =
								diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
						} else {
							formattedTimeAgo =
								diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
						}

						// Get placement and styling
						const placement = participant.placement;
						let placementSuffix = "th";
						if (placement === 1) placementSuffix = "st";
						else if (placement === 2) placementSuffix = "nd";
						else if (placement === 3) placementSuffix = "rd";
						let placementClass = "border-l-4 border-gray-600";
						if (placement === 1)
							placementClass = "border-l-4 border-yellow-500";
						else if (placement <= 4)
							placementClass = "border-l-4 border-blue-500";
						else placementClass = "border-l-4 border-red-600";

						// Determine game type
						const gameType =
							match.info.tft_game_type?.replace(/_/g, " ") || "Normal";
						const queueId = match.info.queue_id;
						let formattedGameType = "Normal";
						if (queueId === 1100) formattedGameType = "Ranked";
						else if (queueId === 1130) formattedGameType = "Hyper Roll";
						else if (queueId === 1160) formattedGameType = "Double Up";
						else if (gameType.toLowerCase().includes("ranked"))
							formattedGameType = "Ranked";

						// Filter and sort active traits
						const activeTraits =
							participant.traits?.filter((trait) => trait.style > 0) || [];
						activeTraits.sort(
							(a, b) => b.style - a.style || b.num_units - a.num_units
						);

						// Sort units - lower cost first (ascending order)
						const units =
							participant.units?.sort((a, b) => {
								const costA = getChampionCostFromDD(a.character_id);
								const costB = getChampionCostFromDD(b.character_id);
								if (costA !== costB) return costA - costB;
								return b.tier - a.tier; // Sort by tier as secondary criteria
							}) || [];

						const augments = participant.augments || [];

						// Get companion data
						const companion = participant.companion
							? companionsData[participant.companion.content_ID]
							: null;
						const companionIconUrl = companion
							? getCompanionIconUrl(companion.iconPath)
							: null;

						const isExpanded = expandedMatchId === matchId;

						return (
							<div key={matchId} className="mb-3 overflow-x-auto relative">
								<div
									onClick={() => toggleExpand(matchId)}
									className={`tft-match-card bg-[--background-alt] p-3 rounded-md flex gap-4 ${getGradientBackground(
										placement
									)} shadow-sm cursor-pointer hover:bg-[--card-bg-secondary]/50 transition-colors duration-150 min-w-[768px] relative`}
								>
									{/* Companion and placement section */}
									<div className="flex flex-col items-start flex-shrink-0">
										<div className="flex items-start space-x-3">
											{/* Companion Image */}
											{companionIconUrl ? (
												<div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-700/50">
													<Image
														src={companionIconUrl}
														alt={companion?.name || "Companion"}
														width={48}
														height={48}
														className="object-cover w-full h-full"
														title={companion?.name || "Companion"}
														unoptimized
													/>
												</div>
											) : (
												<div className="w-12 h-12 bg-gray-800/50 rounded-md border border-gray-700/50 flex-shrink-0"></div>
											)}

											{/* Placement */}
											<div
												className={`font-bold text-2xl ${placement === 1
													? "text-yellow-400"
													: placement <= 4
														? "text-blue-400"
														: "text-gray-400"
													}`}
											>
												{placement}
												<sup className="text-lg">{placementSuffix}</sup>
											</div>
										</div>
									</div>

									{/* Middle - Units and Traits */}
									<div className="flex-grow">
										{/* Traits Row with Time Ago */}
										<div className="flex flex-wrap items-center justify-between mb-2">
											{/* Traits */}
											<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
												{activeTraits.map((trait) => {
													const traitInfo =
														traitsData[trait.name.toUpperCase()];
													if (!traitInfo) return null;
													const cdnUrl = mapCDragonAssetPath(
														traitInfo.iconPath
													);
													const chipStyle = getTraitChipStyle(trait.style);

													// Build tooltip content
													let tooltipContent = traitInfo.name;
													if (trait.num_units) {
														tooltipContent += ` (${trait.num_units})`;
													}
													if (traitInfo.description) {
														tooltipContent += `\n\n${traitInfo.description}`;
													}

													return (
														<div
															key={trait.name}
															className={`flex items-center px-1.5 py-0.5 rounded ${chipStyle}`}
															title={tooltipContent}
														>
															{cdnUrl && (
																<div className="w-3.5 h-3.5 mr-1 relative">
																	<Image
																		src={cdnUrl}
																		alt=""
																		width={14}
																		height={14}
																		className="object-contain"
																		unoptimized
																	/>
																</div>
															)}
															<span className="font-medium mr-1">
																{traitInfo.name}
															</span>
															<span className="font-bold">
																{trait.num_units}
															</span>
														</div>
													);
												})}
											</div>

											{/* Time ago */}
											<div className="text-xs text-[--text-secondary] whitespace-nowrap">
												{formattedTimeAgo}
											</div>
										</div>

										{/* Units Row */}
										<div className="flex items-end gap-1.5">
											{units.map((unit, unitIdx) => {
												const champion = championsData[
													unit.character_id.toUpperCase()
												] || {
													name: unit.character_id.split("_")[1] || "Unknown",
													cost: 0,
												};
												const stars = unit.tier;
												const cdnUrl = getTFTChampionImageUrl(
													unit.character_id,
													champion.name
												);

												// Get champion cost
												const championCost = getChampionCostFromDD(
													unit.character_id
												);

												const borderColor = getBorderColorForCost(championCost);
												const starColor = getStarColorForCost(championCost);

												return (
													<div
														key={`${unit.character_id}-${unitIdx}`}
														className="flex flex-col items-center"
													>
														{/* Star Rating */}
														<div className="flex mb-0.5 h-2.5">
															{Array.from({ length: stars }).map((_, i) => (
																<FaStar
																	key={i}
																	className={`w-2.5 h-2.5 ${starColor}`}
																/>
															))}
														</div>

														{/* Champion Icon */}
														<div
															className={`relative bg-gray-800 rounded w-11 h-11 flex items-center justify-center overflow-hidden border-2 ${borderColor}`}
														>
															{cdnUrl ? (
																<Image
																	src={
																		typeof cdnUrl === "object"
																			? cdnUrl.primary
																			: cdnUrl
																	}
																	alt={champion.name}
																	width={44}
																	height={44}
																	className="object-cover"
																	unoptimized
																	title={champion.name}
																	onError={(e) => {
																		const imageElement = e.currentTarget;
																		if (
																			typeof cdnUrl === "object" &&
																			cdnUrl.fallback &&
																			imageElement.src === cdnUrl.fallback
																		) {
																			imageElement.style.display = "none";
																			const fallbackText = imageElement
																				.closest("div")
																				.querySelector(".fallback-text");
																			if (fallbackText)
																				fallbackText.style.display = "flex";
																		} else if (
																			typeof cdnUrl === "object" &&
																			cdnUrl.fallback
																		) {
																			imageElement.src = cdnUrl.fallback;
																		} else {
																			imageElement.style.display = "none";
																			const fallbackText = imageElement
																				.closest("div")
																				.querySelector(".fallback-text");
																			if (fallbackText)
																				fallbackText.style.display = "flex";
																		}
																	}}
																/>
															) : (
																<div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
																	?
																</div>
															)}
															<div className="fallback-text hidden absolute inset-0 items-center justify-center text-xs text-gray-400 bg-gray-700">
																{champion.name?.substring(0, 3) || "?"}
															</div>
														</div>

														{/* Items */}
														<div className="flex justify-center mt-1 h-3.5 space-x-0.5">
															{/* Check for itemNames array first */}
															{unit.itemNames
																?.slice(0, 3)
																.map((itemName, itemIdx) => {
																	const item = itemsData[itemName];
																	const itemCdnUrl = item
																		? mapCDragonAssetPath(item.iconPath)
																		: null;
																	return (
																		<div
																			key={`${itemName}-${itemIdx}`}
																			className="w-3.5 h-3.5 bg-gray-900 rounded-sm overflow-hidden relative border border-black/50"
																			title={item?.name || itemName}
																		>
																			{itemCdnUrl ? (
																				<Image
																					src={itemCdnUrl}
																					alt=""
																					width={14}
																					height={14}
																					className="object-contain"
																					unoptimized
																				/>
																			) : (
																				<div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500">
																					?
																				</div>
																			)}
																		</div>
																	);
																})}

															{/* Fallback to numeric items array */}
															{!unit.itemNames &&
																unit.items
																	?.slice(0, 3)
																	.map((itemId, itemIdx) => {
																		const item = itemsData[itemId];
																		const itemCdnUrl = item
																			? mapCDragonAssetPath(item.iconPath)
																			: null;
																		return (
																			<div
																				key={`${itemId}-${itemIdx}`}
																				className="w-3.5 h-3.5 bg-gray-900 rounded-sm overflow-hidden relative border border-black/50"
																				title={item?.name || "Unknown Item"}
																			>
																				{itemCdnUrl ? (
																					<Image
																						src={itemCdnUrl}
																						alt=""
																						width={14}
																						height={14}
																						className="object-contain"
																						unoptimized
																					/>
																				) : (
																					<div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500">
																						?
																					</div>
																				)}
																			</div>
																		);
																	})}
														</div>
													</div>
												);
											})}
											{/* Placeholder units */}
											{Array.from({
												length: Math.max(0, 9 - units.length),
											}).map((_, i) => {
												const defaultBorderColor = getBorderColorForCost(0);
												return (
													<div
														key={`placeholder-${i}`}
														className="flex flex-col items-center opacity-50"
													>
														<div className="flex mb-0.5 h-2.5">
															{/* Empty star space to maintain alignment */}
														</div>
														<div
															className={`relative bg-gray-800/50 rounded w-11 h-11 border-2 ${defaultBorderColor}`}
														></div>
														<div className="flex justify-center mt-1 h-3.5">
															{/* Empty item space to maintain alignment */}
														</div>
													</div>
												);
											})}
										</div>

										{/* Augments Row */}
										{augments.length > 0 && (
											<div className="mt-3 pt-2 border-t border-[--card-border]/50">
												<div className="flex flex-wrap items-center gap-2">
													{augments.map((augmentId, idx) => {
														const augmentName = augmentId
															.replace(/^TFT\d+_Augment_/, "")
															.replace(/([A-Z])/g, " $1")
															.trim();
														return (
															<div
																key={`${augmentId}-${idx}`}
																className="flex items-center bg-gradient-to-br from-purple-800/50 to-indigo-800/50 p-1 rounded text-xs text-purple-200 shadow-sm"
																title={augmentId}
															>
																<div className="w-4 h-4 rounded bg-black/30 mr-1.5 flex items-center justify-center text-[10px]"></div>
																{augmentName || "Unknown Augment"}
															</div>
														);
													})}
												</div>
											</div>
										)}
									</div>

									{/* Right Column - Game Mode and expand indicator */}
									<div className="flex flex-col items-end ml-2 h-full justify-between">
										{/* Game Mode */}
										<div className="text-sm font-semibold text-[--text-primary] capitalize whitespace-nowrap">
											{formattedGameType}
										</div>

										{/* Expand/collapse indicator */}
										<div className="flex items-center mt-2">
											{isExpanded ? (
												<FaChevronUp className="text-gray-400" />
											) : (
												<FaChevronDown className="text-gray-400" />
											)}
										</div>
									</div>

								</div>
								{/* Expanded match details */}
								{isExpanded && (
									<div className="mt-2 mb-4">
										<TFTMatchDetails
											matchDetails={matchDetails}
											matchId={matchId}
											summonerData={summonerData}
											companionsData={companionsData}
										/>
									</div>
								)}
							</div>
						);
					})}
				</div >
			))}

			{/* Pagination Controls */}
			{
				totalPages > 1 && (
					<div className="flex justify-center items-center mt-6 space-x-1 text-sm">
						<button
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className={`px-3 py-1 rounded ${currentPage === 1
								? "bg-gray-700 cursor-not-allowed text-gray-500"
								: "bg-gray-800 hover:bg-gray-700 text-gray-200"
								}`}
						>
							Previous
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<button
								key={page}
								onClick={() => handlePageChange(page)}
								className={`px-3 py-1 rounded ${currentPage === page
									? "bg-gray-700 text-white"
									: "bg-gray-800 hover:bg-gray-700 text-gray-200"
									}`}
							>
								{page}
							</button>
						))}
						<button
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							className={`px-3 py-1 rounded ${currentPage === totalPages
								? "bg-gray-700 cursor-not-allowed text-gray-500"
								: "bg-gray-800 hover:bg-gray-700 text-gray-200"
								}`}
						>
							Next
						</button>
					</div>
				)
			}
		</div >
	);
}
