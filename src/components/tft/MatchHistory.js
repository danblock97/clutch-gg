import { useState, useEffect } from "react";
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

// Helper function to properly map Community Dragon asset paths
function mapCDragonAssetPath(jsonPath) {
	if (!jsonPath) return null;
	const lower = jsonPath.toLowerCase().replace("/lol-game-data/assets", "");
	return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${lower}`;
}

// Function to generate TFT champion URL based on character ID with Set 13 fallback
function getTFTChampionImageUrl(characterId, championName) {
	if (!characterId) return null;
	let setNumber = null;
	const match = characterId.match(/TFT(\d+)/i);
	if (match && match[1]) {
		setNumber = parseInt(match[1]);
	}
	let championBaseName = characterId.split("_")[1];
	if (!championBaseName) return null;
	championBaseName = championBaseName.toLowerCase();

	// Dynamic image URLs for different sets with correct paths
	if (setNumber === 14) {
		return {
			primary: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/tft${setNumber}_${championBaseName}/hud/tft${setNumber}_${championBaseName}_square.tft_set${setNumber}.jpg`,
			fallback: `https://raw.communitydragon.org/latest/game/assets/characters/tft13_${championBaseName}/hud/tft13_${championBaseName}_square.tft_set13.png`,
		};
	}
	if (setNumber === 13) {
		return `https://raw.communitydragon.org/latest/game/assets/characters/tft13_${championBaseName}/hud/tft13_${championBaseName}_square.tft_set13.png`;
	}
	// Default fallback for other sets
	return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/tft${setNumber}_${championBaseName}/hud/tft${setNumber}_${championBaseName}_square.tft_set${setNumber}.png`;
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

export default function TFTMatchHistory({ matchDetails, summonerData }) {
	const [traitsData, setTraitsData] = useState({});
	const [itemsData, setItemsData] = useState({});
	const [championsData, setChampionsData] = useState({});
	const [dataDragonChampions, setDataDragonChampions] = useState({});
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	const [expandedMatchId, setExpandedMatchId] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [companionsData, setCompanionsData] = useState({});
	const matchesPerPage = 10;

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
					const dataDragonResponse = await fetch(
						"https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/tft-champion.json"
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
		if (!characterId) return 0;

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
		const matchDate = new Date(match.info.game_datetime);
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

	return (
		<div className="space-y-2">
			{Object.entries(matchesByDay).map(([day, matches]) => (
				<div key={day} className="mb-4">
					<h2 className="text-xl font-semibold text-[--text-primary] my-4">
						{day}
					</h2>
					{matches.map((match, index) => {
						// Get participant and basic match data
						const participant = match.info?.participants?.find(
							(p) => p.puuid === summonerData.puuid
						);
						if (!participant) return null;
						const matchId = match.metadata.match_id || `match-${index}`;
						const matchDate = new Date(match.info.game_datetime);
						const now = new Date();
						const diffTime = Math.abs(now - matchDate);
						const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
						const diffHours = Math.floor(
							(diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
						);
						let timeAgo =
							diffHours < 1
								? `${Math.floor(diffTime / (1000 * 60))}m ago`
								: diffDays > 0
								? `${diffDays}d ago`
								: `${diffHours}h ago`;
						if (diffTime < 60000) timeAgo = "Just now";

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

						return (
							<div key={matchId} className="mb-3">
								<div
									onClick={() =>
										setExpandedMatchId(
											expandedMatchId === matchId ? null : matchId
										)
									}
									className={`tft-match-card bg-[--background-alt] p-3 rounded-md flex gap-4 ${placementClass} shadow-sm cursor-pointer hover:bg-[--card-bg-secondary]/50 transition-colors duration-150`}
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
												className={`font-bold text-2xl ${
													placement === 1
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
												{timeAgo}
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
																		// Try fallback URL if available
																		if (
																			typeof cdnUrl === "object" &&
																			cdnUrl.fallback
																		) {
																			e.currentTarget.src = cdnUrl.fallback;
																		} else {
																			// If no fallback or fallback also failed, show text fallback
																			e.currentTarget.style.display = "none";
																			const fallback =
																				e.currentTarget.nextElementSibling;
																			if (fallback)
																				fallback.style.display = "flex";
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
									<div className="flex flex-col items-end ml-2">
										{/* Game Mode */}
										<div className="text-sm font-semibold text-[--text-primary] capitalize whitespace-nowrap mb-auto">
											{formattedGameType}
										</div>

										{/* Expand/collapse indicator */}
										<div className="text-gray-400 mt-auto">
											{expandedMatchId === matchId ? (
												<FaChevronUp className="w-4 h-4" />
											) : (
												<FaChevronDown className="w-4 h-4" />
											)}
										</div>
									</div>
								</div>

								{/* Expanded Match Details */}
								{expandedMatchId === matchId && (
									<div className="mb-4 animate-fadeIn">
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
				</div>
			))}

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex justify-center items-center mt-6 space-x-1 text-sm">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className={`px-3 py-1 rounded ${
							currentPage === 1
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
							className={`px-3 py-1 rounded ${
								currentPage === page
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
						className={`px-3 py-1 rounded ${
							currentPage === totalPages
								? "bg-gray-700 cursor-not-allowed text-gray-500"
								: "bg-gray-800 hover:bg-gray-700 text-gray-200"
						}`}
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}
