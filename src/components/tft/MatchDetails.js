import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	FaStar,
	FaCoins,
	FaBolt,
	FaCrown,
	FaSkull,
	FaQuestionCircle,
} from "react-icons/fa";
import {
	fetchTFTCompanions,
	getCompanionIconUrl,
} from "@/lib/tft/companionsApi";

// --- Helper Functions ---

// Map Community Dragon paths (Your Original Logic)
function mapCDragonAssetPath(jsonPath) {
	if (!jsonPath) return null;
	// Ensure path starts correctly, remove potential double slashes
	const cleanPath = jsonPath.replace(/^\/+/, "");
	const lower = cleanPath.toLowerCase().replace("lol-game-data/assets", ""); // Handle potential leading slash
	return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${
		lower.startsWith("/") ? lower.substring(1) : lower
	}`;
}

// Get Champion Image URL with Set 13 fallback for Set 14
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

// Get Border Color by Cost (UI Styling)
function getBorderColorForCost(cost) {
	switch (cost) {
		case 1:
			return "border-gray-500";
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

// Get Star Color (UI Styling - Matched to Image)
function getStarColorForCost(cost) {
	return "text-yellow-400"; // Always gold stars like image
}

// Format Stage String (UI Formatting)
function formatStage(round) {
	if (!round || round <= 0) return "-";
	// Simple stage calculation (adjust if specific set logic is needed)
	const stage = Math.max(1, Math.floor(round / 7) + 1); // Ensure stage is at least 1
	const subStage = Math.max(1, (round % 7) + 1); // Ensure substage is at least 1
	// Skip rendering for very early rounds if desired (e.g., before 2-1)
	if (stage < 2) return "-";
	return `${stage}-${subStage}`;
}

// Get Trait Chip Style (UI Styling)
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

// Get Placement Text Class (UI Styling)
function getPlacementClass(placement) {
	if (placement === 1) return "text-yellow-400 font-bold";
	if (placement <= 4) return "text-sky-300";
	return "text-gray-400";
}

// Get Ordinal Suffix (Unchanged Logic)
function getOrdinal(n) {
	const s = ["th", "st", "nd", "rd"];
	const v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Format Ordinal Placement (e.g., 1st, 2nd, 3rd)
function formatPlacement(placement) {
	if (placement === 1) return "1st";
	if (placement === 2) return "2nd";
	if (placement === 3) return "3rd";
	return `${placement}th`;
}

// Format Game Duration (UI Formatting)
function formatGameDuration(seconds) {
	if (seconds === null || seconds === undefined) return "-";
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

// Get text description for trait tiers
function getTierText(style) {
	switch (style) {
		case 4:
			return "Prismatic Tier";
		case 3:
			return "Gold Tier";
		case 2:
			return "Silver Tier";
		case 1:
			return "Bronze Tier";
		default:
			return "";
	}
}

// --- Main Component ---

export default function TFTMatchDetails({
	matchDetails,
	matchId,
	summonerData, // Contains puuid of the viewing player
	companionsData: propCompanionsData, // Accept companions data as a prop
}) {
	// State
	const [traitsData, setTraitsData] = useState({});
	const [itemsData, setItemsData] = useState({});
	const [championsData, setChampionsData] = useState({}); // Community Dragon data
	const [augmentsData, setAugmentsData] = useState({}); // Augment data
	const [dataDragonChampions, setDataDragonChampions] = useState({}); // Data Dragon data (for cost)
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	const [playersData, setPlayersData] = useState({}); // Summoner names/tags
	const [companionsData, setCompanionsData] = useState(
		propCompanionsData || {}
	); // Use prop data or initialize empty

	// Effect to Fetch Core TFT Data (Traits, Items, Champions, Augments)
	useEffect(() => {
		async function fetchTFTData() {
			try {
				// Fetch traits
				const traitsResponse = await fetch(
					"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tfttraits.json"
				);
				const traitsJson = await traitsResponse.json();
				const traitsMap = {};
				traitsJson.forEach((trait) => {
					if (trait?.trait_id) {
						const key = trait.trait_id.toLowerCase();
						traitsMap[key] = {
							name: trait.name,
							description: trait.desc,
							iconPath: trait.icon_path,
							effects: trait.effects || [],
						};
					}
				});
				setTraitsData(traitsMap);

				// Fetch items
				const itemsResponse = await fetch(
					"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tftitems.json"
				);
				const itemsJson = await itemsResponse.json();
				const itemsMap = {};
				itemsJson.forEach((item) => {
					// Use iconData (more reliable path from CDragon JSON) or loadoutsIcon as fallback
					const icon = item.iconData || item.loadoutsIcon || item.iconPath; // Prioritize iconData
					if (item.id !== undefined)
						itemsMap[item.id] = {
							name: item.name,
							description: item.desc,
							iconPath: icon,
						};
					if (item.nameId)
						itemsMap[item.nameId.toLowerCase()] = {
							name: item.name,
							description: item.desc,
							iconPath: icon,
						};
				});
				setItemsData(itemsMap);

				// Fetch Community Dragon champions (Fallback source for name/traits)
				const championsResponse = await fetch(
					"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tftchampions.json"
				);
				const championsJson = await championsResponse.json();
				const championsMap = {};
				championsJson.forEach((champion) => {
					if (champion?.character_id) {
						const key = champion.character_id.toLowerCase();
						championsMap[key] = {
							name: champion.name,
							cost: champion.cost,
							traits: champion.traits || [],
							iconPath: champion.squareIconPath,
						};
					}
				});
				setChampionsData(championsMap);

				// Fetch Data Dragon (Champions for Cost, Augments)
				try {
					const versionsResponse = await fetch(
						"https://ddragon.leagueoflegends.com/api/versions.json"
					);
					const versions = await versionsResponse.json();
					const latestVersion = versions[0]; // Get latest LoL patch version

					// Fetch DDragon Champions (mainly for accurate tier/cost)
					const dataDragonResponse = await fetch(
						`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/tft-champion.json`
					);
					const ddJson = await dataDragonResponse.json();
					setDataDragonChampions(ddJson.data || {});

					// Fetch DDragon Augments
					const augmentResponse = await fetch(
						`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/tft-augments.json`
					);
					const augJson = await augmentResponse.json();
					const augMap = {};
					Object.values(augJson.data || {}).forEach((aug) => {
						if (aug?.id)
							augMap[aug.id.toLowerCase()] = {
								name: aug.name,
								desc: aug.desc,
								iconPath: aug.icon,
							};
					});
					setAugmentsData(augMap);
				} catch (error) {
					console.error("Error fetching Data Dragon data:", error);
					// Handle error - potentially rely only on CDragon data
				}

				// Fetch companions data if not provided as prop
				if (
					!propCompanionsData ||
					Object.keys(propCompanionsData).length === 0
				) {
					const companions = await fetchTFTCompanions();
					setCompanionsData(companions);
				}

				setIsDataLoaded(true);
			} catch (error) {
				console.error("Error fetching base TFT data:", error);
				setIsDataLoaded(true); // Still set loaded to show error or partial data
			}
		}
		fetchTFTData();
	}, [propCompanionsData]);

	// Update companionsData if prop changes
	useEffect(() => {
		if (propCompanionsData && Object.keys(propCompanionsData).length > 0) {
			setCompanionsData(propCompanionsData);
		}
	}, [propCompanionsData]);

	// Effect to Fetch Player Names/Tags (Simulated - Adapt if you fetch this elsewhere)
	useEffect(() => {
		if (!matchDetails || !matchId) return;
		const match = matchDetails.find((m) => m.metadata.match_id === matchId);
		if (!match || !match.info?.participants) return;

		const players = {};
		match.info.participants.forEach((p) => {
			if (p.puuid) {
				// Use data directly from match if available, otherwise placeholder
				players[p.puuid] = {
					name: p.riotIdGameName || p.name || "Unknown",
					tagLine: p.riotIdTagline || "", // May be empty string if unavailable
				};
			}
		});
		setPlayersData(players);
	}, [matchDetails, matchId]);

	// Helper to get Champion Cost (Uses Data Dragon first)
	const getChampionCostFromDD = (characterId) => {
		if (!characterId || !dataDragonChampions) return 0;
		const lowerCaseId = characterId.toLowerCase();

		// Attempt lookup using the full character ID (e.g., tft11_ahri) if available in DDragon keys
		if (dataDragonChampions[lowerCaseId]) {
			return dataDragonChampions[lowerCaseId].tier || 0;
		}

		// Fallback: Extract name part (e.g., "ahri") and try matching DDragon keys ending with it
		const nameMatch = lowerCaseId.match(/tft\d+_(.+)/);
		const championKeyPart = nameMatch ? nameMatch[1] : null; // Extracted name like "ahri"

		if (championKeyPart) {
			for (const key in dataDragonChampions) {
				// Check if DDragon key (e.g., "TFT11_Ahri") ends with the extracted name part
				// Case-insensitive comparison recommended
				if (key.toLowerCase().endsWith(championKeyPart)) {
					return dataDragonChampions[key].tier || 0;
				}
			}
		}

		// Final fallback to Community Dragon data (may be less accurate)
		return championsData[lowerCaseId]?.cost || 0;
	};

	// --- Render Logic ---
	if (!matchDetails || !matchId) {
		return (
			<div className="card-highlight p-6 text-center text-[--text-secondary]">
				Loading...
			</div>
		);
	}
	const match = matchDetails.find((m) => m.metadata.match_id === matchId);

	if (!match || !isDataLoaded) {
		return (
			<div className="card-highlight p-6 text-center">
				<p className="text-[--text-secondary]">
					{isDataLoaded ? "Match data not found." : "Loading match data..."}
				</p>
			</div>
		);
	}

	const participants = match.info.participants || [];
	participants.sort((a, b) => a.placement - b.placement); // Sort by placement

	return (
		<div className="card-highlight overflow-hidden shadow-xl">
			{/* Table Header Row */}
			<div className="flex items-center px-3 py-1.5 bg-black/30 text-xs font-semibold text-gray-400 border-b border-gray-700/50 sticky top-0 z-20">
				<div className="w-[4%] text-center">#</div>
				<div className="w-[18%] pl-1">Summoner</div>
				<div className="w-[25%] pl-8 text-center">Synergies</div>
				<div className="w-[40%] pl-44">Units</div>
				<div className="w-[13%] flex justify-end gap-4 pr-1">
					<div className="flex flex-col items-center">
						<FaBolt className="text-purple-400 w-3 h-3 mb-0.5" />
					</div>
					<div className="flex flex-col items-center">
						<FaCoins className="text-yellow-400 w-3 h-3 mb-0.5" />
					</div>
					<div className="flex flex-col items-center">
						<FaSkull className="text-gray-400 w-3 h-3 mb-0.5" />
					</div>
				</div>
			</div>
			{/* Participant Rows */}
			<div className="divide-y divide-gray-700/30">
				{participants.map((p, index) => (
					<ParticipantRow
						key={p.puuid || index}
						participant={p}
						traitsData={traitsData}
						itemsData={itemsData}
						championsData={championsData}
						augmentsData={augmentsData}
						getChampionCostFromDD={getChampionCostFromDD}
						isCurrentPlayer={p.puuid === summonerData?.puuid}
						playerData={playersData[p.puuid]}
						getTFTChampionImageUrl={getTFTChampionImageUrl}
						mapCDragonAssetPath={mapCDragonAssetPath}
						companionsData={companionsData}
						getCompanionIconUrl={getCompanionIconUrl}
					/>
				))}
			</div>
		</div>
	);
}

// --- Participant Row Component ---

function ParticipantRow({
	participant,
	traitsData,
	itemsData,
	championsData, // CDragon data (names/fallback)
	augmentsData,
	getChampionCostFromDD,
	isCurrentPlayer,
	playerData,
	getTFTChampionImageUrl, // Use the passed original function
	mapCDragonAssetPath,
	companionsData,
	getCompanionIconUrl,
}) {
	// Get companion data for the participant
	const companion = participant.companion
		? companionsData[participant.companion.content_ID]
		: null;
	const companionIconUrl = companion
		? getCompanionIconUrl(companion.iconPath)
		: null;

	// Sort units by cost (desc) then tier (desc)
	const sortedUnits = [...(participant.units || [])].sort((a, b) => {
		const costA = getChampionCostFromDD(a.character_id);
		const costB = getChampionCostFromDD(b.character_id);
		if (costB !== costA) return costB - costA;
		return (b.tier || 0) - (a.tier || 0);
	});

	// Filter/sort active traits
	const activeTraits = (participant.traits || [])
		.filter((trait) => trait.style > 0 && traitsData[trait.name?.toLowerCase()])
		.sort(
			(a, b) =>
				(b.style || 0) - (a.style || 0) ||
				(b.num_units || 0) - (a.num_units || 0)
		);

	// Get augment IDs
	const participantAugments = participant.augments || [];

	// Get item IDs (preferring `items` array which usually holds numerical IDs)
	const unitItemsSource = participant.items || []; // Use participant.items as the primary source

	return (
		<div
			className={`flex items-stretch px-3 py-2 gap-2 text-sm ${
				isCurrentPlayer ? "bg-blue-900/20" : ""
			} hover:bg-gray-700/20 transition-colors duration-150 min-h-[60px]`}
		>
			{/* Placement */}
			<div className="w-[4%] flex items-center justify-center text-center shrink-0">
				<span
					className={`${getPlacementClass(participant.placement)} text-base`}
				>
					{formatPlacement(participant.placement)}
				</span>
			</div>

			{/* Summoner with bigger companion image */}
			<div className="w-[18%] flex items-center pl-1 shrink-0">
				{/* Companion icon - larger and not cut off */}
				{companionIconUrl ? (
					<div className="relative w-9 h-9 mr-2 flex-shrink-0 overflow-hidden rounded-md border border-gray-700/50">
						<Image
							src={companionIconUrl}
							alt={companion?.name || "Companion"}
							width={36}
							height={36}
							className="object-cover w-full h-full"
							title={`${companion?.name || "Companion"}${
								companion?.speciesName ? ` (${companion.speciesName})` : ""
							}`}
							unoptimized
						/>
					</div>
				) : (
					<div className="relative w-9 h-9 mr-2 flex-shrink-0 bg-gray-800/50 rounded-md border border-gray-700/50"></div>
				)}

				{/* Summoner name and tag */}
				{playerData?.name ? (
					<Link
						href={`/profile/${encodeURIComponent(playerData.name)}/${
							playerData.tagLine || "NA1"
						}`}
						legacyBehavior
					>
						<a
							className="font-semibold text-gray-100 hover:text-blue-400 truncate"
							title={`${playerData.name}#${playerData.tagLine}`}
						>
							{playerData.name}
							<span className="text-[--text-secondary] text-xs ml-1">
								#{playerData.tagLine}
							</span>
						</a>
					</Link>
				) : (
					<span className="font-semibold text-gray-100 truncate">Unknown</span>
				)}
			</div>

			{/* Synergies (Traits) */}
			<div className="w-[25%] flex flex-wrap items-center justify-center gap-1 pl-1 shrink-0">
				{activeTraits.map((trait) => {
					const traitInfo = traitsData[trait.name?.toLowerCase()];
					if (!traitInfo) return null;
					const cdnUrl = traitInfo.iconPath
						? mapCDragonAssetPath(traitInfo.iconPath)
						: null;
					const traitStyle = getTraitChipStyle(trait.style);

					// Build a more informative tooltip without undefined values
					let tooltipContent = traitInfo.name;
					if (trait.num_units) {
						tooltipContent += ` (${trait.num_units})`;
					}

					// Add active tier information if available
					const activeTierText = getTierText(trait.style);
					if (activeTierText) {
						tooltipContent += `\n${activeTierText}`;
					}

					// Add description if available
					if (traitInfo.description) {
						tooltipContent += `\n\n${traitInfo.description}`;
					}

					return (
						<div
							key={trait.name}
							className={`flex items-center px-1.5 py-0.5 rounded ${traitStyle}`}
							title={tooltipContent}
						>
							{cdnUrl && (
								<div className="w-4 h-4 mr-1">
									<Image
										src={cdnUrl}
										alt=""
										width={16}
										height={16}
										className="object-contain"
										unoptimized
									/>
								</div>
							)}
							<span className="text-xs font-medium mr-1">{traitInfo.name}</span>
							<span className="text-xs font-bold">{trait.num_units}</span>
						</div>
					);
				})}
			</div>

			{/* Units & Items */}
			<div className="w-[40%] flex flex-wrap items-start gap-x-1 gap-y-0.5 pl-1 grow">
				{sortedUnits.map((unit, idx) => {
					const championCost = getChampionCostFromDD(unit.character_id);
					const borderColor = getBorderColorForCost(championCost);
					const starColor = getStarColorForCost(championCost);
					const champName =
						championsData[unit.character_id?.toLowerCase()]?.name ||
						unit.character_id?.split("_")[1] ||
						"Unknown";
					// Use the passed original function for the champion image URL
					const cdnUrl = getTFTChampionImageUrl(unit.character_id, champName);
					// Get item IDs for this unit (ensure it's an array)
					const unitItems = unit.items || [];

					return (
						<div
							key={`${unit.character_id}-${idx}`}
							className="flex flex-col items-center relative w-8"
							title={champName}
						>
							{/* Stars */}
							<div className="flex h-2 -mb-0.5 z-10">
								{Array.from({ length: unit.tier || 0 }).map((_, i) => (
									<FaStar
										key={i}
										className={`w-1.5 h-1.5 ${starColor}`}
										style={{ filter: "drop-shadow(0 0 1px black)" }}
									/>
								))}
							</div>
							{/* Champion Icon */}
							<div
								className={`relative bg-gray-900 rounded w-8 h-8 flex items-center justify-center overflow-hidden border ${borderColor}`}
							>
								{cdnUrl ? (
									<Image
										src={typeof cdnUrl === "object" ? cdnUrl.primary : cdnUrl}
										alt=""
										width={32}
										height={32}
										className="object-cover scale-105"
										unoptimized
										title={champName}
										onError={(e) => {
											// Try fallback URL if available
											if (typeof cdnUrl === "object" && cdnUrl.fallback) {
												e.currentTarget.src = cdnUrl.fallback;
											} else {
												e.currentTarget.style.display = "none";
												const fallback = e.currentTarget
													.closest("div")
													.querySelector(".fallback-text");
												if (fallback) fallback.style.display = "flex";
											}
										}}
									/>
								) : (
									<div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
										?
									</div>
								)}
								<div className="fallback-text hidden absolute inset-0 items-center justify-center text-[8px] font-semibold text-white bg-gray-700/80">
									{champName?.substring(0, 3) || "?"}
								</div>
							</div>
							{/* Items */}
							<div className="flex justify-center items-center mt-0.5 h-3 space-x-0.5">
								{unitItems.slice(0, 3).map((itemIdentifier, itemIdx) => {
									// Assume itemIdentifier is a numerical ID
									const item = itemsData[itemIdentifier];
									// Construct URL using the mapped iconPath (which uses iconData/loadoutsIcon)
									const itemCdnUrl = item?.iconPath
										? `https://raw.communitydragon.org/latest/game/${item.iconPath
												?.toLowerCase()
												.replace(".dds", ".png")}`
										: null;
									const itemName = item?.name || `Item ID: ${itemIdentifier}`;
									const itemDesc = item?.description || "";
									const itemTitle = `${itemName}\n\n${itemDesc.replace(
										/<[^>]*>?/gm,
										""
									)}`; // Basic HTML strip for tooltip

									return (
										<div
											key={`${itemIdentifier}-${itemIdx}`}
											className="w-3 h-3 bg-black/50 rounded-sm overflow-hidden relative border border-black/50"
											title={itemTitle}
										>
											{itemCdnUrl ? (
												<Image
													src={itemCdnUrl}
													alt=""
													width={12}
													height={12}
													className="object-contain"
													unoptimized
													onError={(e) => {
														e.currentTarget.style.opacity = "0.3";
													}}
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center text-[7px] text-gray-500">
													?
												</div>
											)}
										</div>
									);
								})}
								{/* Render empty slots */}
								{Array.from({ length: 3 - unitItems.length }).map((_, i) => (
									<div
										key={`empty-${i}`}
										className="w-3 h-3 bg-black/20 rounded-sm border border-black/30"
									></div>
								))}
							</div>
						</div>
					);
				})}
			</div>

			{/* Stats - Individual Columns */}
			<div className="w-[13%] flex items-center justify-end gap-4 pr-1 text-xs shrink-0">
				{/* Damage */}
				<div
					className="flex flex-col items-center"
					title="Damage Dealt to Players"
				>
					<FaBolt className="text-purple-400 w-3 h-3 mb-0.5" />
					<span className="text-[11px]">
						{participant.total_damage_to_players || 0}
					</span>
				</div>

				{/* Gold */}
				<div className="flex flex-col items-center" title="Gold Left">
					<FaCoins className="text-yellow-400 w-3 h-3 mb-0.5" />
					<span className="text-[11px]">{participant.gold_left || 0}</span>
				</div>

				{/* Eliminations */}
				<div className="flex flex-col items-center" title="Players Eliminated">
					<FaSkull className="text-gray-400 w-3 h-3 mb-0.5" />
					<span className="text-[11px]">
						{participant.players_eliminated || 0}
					</span>
				</div>
			</div>
		</div>
	);
}
