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

// Helper function to properly map Community Dragon asset paths
function mapCDragonAssetPath(jsonPath) {
	if (!jsonPath) return null;
	const lower = jsonPath.toLowerCase().replace("/lol-game-data/assets", "");
	return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${lower}`;
}

// Function to generate TFT champion URL based on character ID
function getTFTChampionImageUrl(characterId, championName) {
	// --- NO CHANGES to this function ---
	if (!characterId) return null;
	let setNumber = null;
	const match = characterId.match(/TFT(\d+)/i);
	if (match && match[1]) {
		setNumber = parseInt(match[1]);
	}
	let championBaseName = characterId.split("_")[1];
	if (!championBaseName) return null;
	championBaseName = championBaseName.toLowerCase();
	const baseUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/tft${setNumber}_${championBaseName}/hud/tft${setNumber}_${championBaseName}_square.tft_set${setNumber}`;
	if (setNumber === 14) return `${baseUrl}.jpg`;
	if (setNumber === 13) return `${baseUrl}.png`;
	return `${baseUrl}.png`;
}

// --- Helper function to get border color based on champion COST ---
function getBorderColorForCost(cost) {
	switch (cost) {
		case 1:
			return "border-gray-400"; // Grey for 1-cost
		case 2:
			return "border-green-500"; // Green for 2-cost
		case 3:
			return "border-blue-500"; // Blue for 3-cost
		case 4:
			return "border-purple-500"; // Purple for 4-cost
		case 5:
			return "border-yellow-500"; // Yellow/gold for 5-cost
		default:
			return "border-gray-700"; // Default for unknown/0 cost
	}
}

// --- Helper function to get star color based on CHAMPION COST (not tier) ---
function getStarColorForCost(cost) {
	switch (cost) {
		case 1:
			return "text-gray-400"; // Grey stars for 1-cost
		case 2:
			return "text-green-400"; // Green stars for 2-cost
		case 3:
			return "text-blue-400"; // Blue stars for 3-cost
		case 4:
			return "text-purple-400"; // Purple stars for 4-cost
		case 5:
			return "text-yellow-400"; // Gold stars for 5-cost
		default:
			return "text-gray-600"; // Fallback
	}
}

// Helper function for trait styling
function getTraitChipStyle() {
	return "bg-gray-700 text-gray-200";
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
	// Add state for expanded match
	const [expandedMatchId, setExpandedMatchId] = useState(null);

	// Fetch TFT data (traits, items, champions)
	useEffect(() => {
		async function fetchTFTData() {
			try {
				// Fetch traits and items from Community Dragon (unchanged)
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

	// --- Loading and Empty States (No Changes) ---
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
			{matchDetails.map((match, index) => {
				// --- Participant and basic match data setup (unchanged) ---
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
				const placement = participant.placement;
				let placementSuffix = "th";
				if (placement === 1) placementSuffix = "st";
				else if (placement === 2) placementSuffix = "nd";
				else if (placement === 3) placementSuffix = "rd";
				let placementClass = "border-l-4 border-gray-600";
				if (placement === 1) placementClass = "border-l-4 border-yellow-500";
				else if (placement <= 4) placementClass = "border-l-4 border-blue-500";
				else placementClass = "border-l-4 border-red-600";
				const gameDurationMinutes = Math.floor(match.info.game_length / 60);
				const gameDurationSeconds = Math.round(match.info.game_length % 60);
				const formattedDuration = `${gameDurationMinutes}m ${gameDurationSeconds}s`;
				const gameStage = formatStage(participant.last_round);
				const gameType =
					match.info.tft_game_type?.replace(/_/g, " ") || "Normal";
				const queueId = match.info.queue_id;
				let formattedGameType = "Normal";
				if (queueId === 1100) formattedGameType = "Ranked";
				else if (queueId === 1130) formattedGameType = "Hyper Roll";
				else if (queueId === 1160) formattedGameType = "Double Up";
				else if (gameType.toLowerCase().includes("ranked"))
					formattedGameType = "Ranked";
				const activeTraits =
					participant.traits?.filter((trait) => trait.style > 0) || [];
				activeTraits.sort(
					(a, b) => b.style - a.style || b.num_units - a.num_units
				);
				// Sort units - Changed to prioritize LOWER cost units first (ascending order)
				const units =
					participant.units?.sort((a, b) => {
						// Get cost from Data Dragon first, fallback to Community Dragon
						const costA = getChampionCostFromDD(a.character_id);
						const costB = getChampionCostFromDD(b.character_id);

						// Reversed sorting - lower cost first (ascending)
						if (costA !== costB) return costA - costB;
						return b.tier - a.tier; // Still sort by tier as secondary criteria
					}) || [];
				const augments = participant.augments || [];

				return (
					<div key={matchId}>
						<div
							onClick={() =>
								setExpandedMatchId(expandedMatchId === matchId ? null : matchId)
							}
							className={`tft-match-card bg-[--background-alt] p-3 rounded-md flex gap-4 ${placementClass} shadow-sm cursor-pointer hover:bg-[--card-bg-secondary]/50 transition-colors duration-150`}
						>
							{/* Left Column: Placement & Match Info */}
							<div className="flex flex-col justify-between text-xs w-20 flex-shrink-0">
								{/* ... (content unchanged) ... */}
								<div>
									<div
										className={`font-bold text-lg ${
											placement === 1
												? "text-yellow-400"
												: placement <= 4
												? "text-blue-400"
												: "text-gray-400"
										}`}
									>
										{placement}
										<sup>{placementSuffix}</sup>
									</div>
									<div className="font-semibold text-[--text-primary] capitalize">
										{formattedGameType}
									</div>
								</div>
								<div className="text-[--text-secondary] space-y-0.5">
									<div>{timeAgo}</div>
									<div>{gameStage}</div>
									<div>{formattedDuration}</div>
								</div>
							</div>

							{/* Right Column: Traits & Units */}
							<div className="flex-grow">
								{/* Traits Row */}
								<div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
									{/* ... (trait rendering unchanged) ... */}
									{activeTraits.map((trait) => {
										const traitInfo = traitsData[trait.name.toUpperCase()];
										if (!traitInfo) return null;
										const cdnUrl = mapCDragonAssetPath(traitInfo.iconPath);
										const chipStyle = getTraitChipStyle();
										return (
											<div
												key={trait.name}
												className={`trait-chip ${chipStyle} px-1.5 py-0.5 rounded-sm flex items-center text-xs`}
												title={traitInfo.name}
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
												<span>{trait.num_units}</span>
											</div>
										);
									})}
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

										// Get cost from Data Dragon first, fallback to Community Dragon
										const championCost = getChampionCostFromDD(
											unit.character_id
										);

										// --- Get border color based on COST ---
										const borderColor = getBorderColorForCost(championCost);
										// --- Get star color based on CHAMPION COST ---
										const starColor = getStarColorForCost(championCost);

										return (
											// Champion component with fixed-height item container
											<div
												key={`${unit.character_id}-${unitIdx}`}
												className="flex flex-col items-center"
											>
												{/* Star Rating - Fixed height container */}
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
															src={cdnUrl}
															alt={champion.name}
															width={44}
															height={44}
															className="object-cover"
															unoptimized
															title={champion.name}
															onError={(e) => {
																e.currentTarget.style.display = "none";
																const fallback =
																	e.currentTarget.nextElementSibling;
																if (fallback) fallback.style.display = "flex";
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

												{/* Items - Fixed height container */}
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
														unit.items?.slice(0, 3).map((itemId, itemIdx) => {
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
									{/* Placeholder units - Fixed height containers */}
									{Array.from({ length: Math.max(0, 9 - units.length) }).map(
										(_, i) => {
											// --- Get default border (cost 0) ---
											const defaultBorderColor = getBorderColorForCost(0);
											return (
												<div
													key={`placeholder-${i}`}
													className="flex flex-col items-center opacity-50"
												>
													{/* Fixed height star container */}
													<div className="flex mb-0.5 h-2.5">
														{/* Empty star space to maintain alignment */}
													</div>
													{/* --- Apply default cost border --- */}
													<div
														className={`relative bg-gray-800/50 rounded w-11 h-11 border-2 ${defaultBorderColor}`}
													></div>
													{/* Fixed height item container */}
													<div className="flex justify-center mt-1 h-3.5">
														{/* Empty item space to maintain alignment */}
													</div>
												</div>
											);
										}
									)}
								</div>

								{/* Augments Row */}
								{augments.length > 0 && (
									<div className="mt-3 pt-2 border-t border-[--card-border]/50">
										{/* ... (augment rendering unchanged) ... */}
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

							{/* Add expand/collapse indicator */}
							<div className="flex items-center text-gray-400">
								{expandedMatchId === matchId ? (
									<FaChevronUp className="w-4 h-4" />
								) : (
									<FaChevronDown className="w-4 h-4" />
								)}
							</div>
						</div>

						{/* Expanded Match Details */}
						{expandedMatchId === matchId && (
							<div className="mb-4 animate-fadeIn">
								<TFTMatchDetails
									matchDetails={matchDetails}
									matchId={matchId}
									summonerData={summonerData}
								/>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
