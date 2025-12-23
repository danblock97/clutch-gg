import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTrophy, FaChartLine, FaDesktop } from "react-icons/fa";

// (removed unused formatGameTime)

// Helper function to get winrate color
function getWinrateColor(winrate) {
	if (winrate >= 65) return "text-green-500";
	if (winrate >= 55) return "text-green-400";
	if (winrate >= 50) return "text-blue-400";
	if (winrate >= 45) return "text-yellow-400";
	return "text-red-400";
}

// Helper function to get real placements from match history data
function getRealPlacements(matchHistory, puuid, count = 5) {
	if (
		!matchHistory ||
		!Array.isArray(matchHistory) ||
		matchHistory.length === 0 ||
		!puuid
	) {
		return generateFallbackPlacements(5, 5); // Always return 5 fallback placements if no match data
	}

	// Sort matches by game datetime (newest first)
	const sortedMatches = [...matchHistory].sort(
		(a, b) => (b.info?.game_datetime || 0) - (a.info?.game_datetime || 0)
	);

	// Extract placements from player's recent matches
	const placements = [];
	const processedMatchIds = new Set(); // Track processed matches to avoid duplicates

	// Get current TFT set from the live game if available
	const currentTFTSet = getSetInfoFromMatches(sortedMatches);

	// First pass: try to get ranked games from current set
	for (const match of sortedMatches) {
		// Skip if not valid match data or already processed
		if (
			!match.info ||
			!Array.isArray(match.info.participants) ||
			!match.metadata?.match_id
		) {
			continue;
		}
		if (processedMatchIds.has(match.metadata.match_id)) {
			continue;
		}
		processedMatchIds.add(match.metadata.match_id);

		// Only consider ranked games (queue_id 1100) and games from the current set
		const isRanked = match.info.queue_id === 1100;
		const matchSetInfo = getMatchSetInfo(match);
		const isCurrentSet = !currentTFTSet || matchSetInfo === currentTFTSet;

		if (isRanked && isCurrentSet) {
			const participant = match.info.participants.find(
				(p) => p.puuid === puuid
			);
			if (participant && typeof participant.placement === "number") {
				placements.push(participant.placement);
			}
		}
	}

	// Second pass: if we still don't have enough placements, include normal games from current set
	if (placements.length < count) {
		processedMatchIds.clear(); // Reset processed matches
		for (const match of sortedMatches) {
			if (placements.length >= count) break;

			if (
				!match.info ||
				!Array.isArray(match.info.participants) ||
				!match.metadata?.match_id
			) {
				continue;
			}
			if (processedMatchIds.has(match.metadata.match_id)) {
				continue;
			}
			processedMatchIds.add(match.metadata.match_id);

			// Include any games from current set
			const matchSetInfo = getMatchSetInfo(match);
			const isCurrentSet = !currentTFTSet || matchSetInfo === currentTFTSet;

			if (isCurrentSet) {
				const participant = match.info.participants.find(
					(p) => p.puuid === puuid
				);
				if (
					participant &&
					typeof participant.placement === "number" &&
					!placements.includes(participant.placement)
				) {
					placements.push(participant.placement);
				}
			}
		}
	}

	// If we still don't have enough placements, fall back to any games
	if (placements.length < count) {
		processedMatchIds.clear(); // Reset processed matches
		for (const match of sortedMatches) {
			if (placements.length >= count) break;

			if (
				!match.info ||
				!Array.isArray(match.info.participants) ||
				!match.metadata?.match_id
			) {
				continue;
			}
			if (processedMatchIds.has(match.metadata.match_id)) {
				continue;
			}
			processedMatchIds.add(match.metadata.match_id);

			// Include any game with valid placement data
			const participant = match.info.participants.find(
				(p) => p.puuid === puuid
			);
			if (
				participant &&
				typeof participant.placement === "number" &&
				!placements.includes(participant.placement)
			) {
				placements.push(participant.placement);
			}
		}
	}

	// If we still don't have enough placements, pad with fallback placements
	if (placements.length < count) {
		const neededPlacements = count - placements.length;
		const fallbackPlacements = generateFallbackPlacements(5, 5).slice(
			0,
			neededPlacements
		);
		placements.push(...fallbackPlacements);
	}

	return placements.slice(0, count);
}

// Helper function to determine TFT set from match data
function getMatchSetInfo(match) {
	// Try to extract set information from different fields
	if (match.info?.tft_set_core_name) {
		return match.info.tft_set_core_name;
	}

	// Try to determine from game variation
	if (match.info?.tft_game_type) {
		// Extract pattern like "TFT11_GameVariation" to get set number
		const setMatch = match.info.tft_game_type.match(/TFT(\d+)/i);
		if (setMatch && setMatch[1]) {
			return `TFT${setMatch[1]}`;
		}
	}

	// Try to extract from champion IDs (e.g., TFT11_Cassiopeia)
	if (match.info?.participants?.[0]?.units?.[0]?.character_id) {
		const unitId = match.info.participants[0].units[0].character_id;
		const setMatch = unitId.match(/TFT(\d+)/i);
		if (setMatch && setMatch[1]) {
			return `TFT${setMatch[1]}`;
		}
	}

	return null; // Can't determine the set
}

// Get TFT set info from a collection of matches (use the most common one)
function getSetInfoFromMatches(matches) {
	if (!matches || matches.length === 0) return null;

	const setCounts = {};
	let maxCount = 0;
	let mostCommonSet = null;

	// Count occurrences of each set
	for (const match of matches) {
		const setInfo = getMatchSetInfo(match);
		if (setInfo) {
			setCounts[setInfo] = (setCounts[setInfo] || 0) + 1;
			if (setCounts[setInfo] > maxCount) {
				maxCount = setCounts[setInfo];
				mostCommonSet = setInfo;
			}
		}
	}

	return mostCommonSet;
}

// Helper function to generate fallback placement data when real data is unavailable
function generateFallbackPlacements(wins, losses) {
	const total = wins + losses;
	if (total === 0) return [];

	// Generate more stable placement data based on wins/losses ratio for demo
	const placements = [];
	// Use deterministic placements based on wins/losses ratio
	const winRatio = total > 0 ? wins / total : 0.5;
	for (let i = 0; i < 5; i++) {
		// Generate placement weighted by win ratio - better win ratio = better placements
		const baseValue = Math.max(1, Math.min(8, Math.ceil(8 - winRatio * 7)));
		// Add small variance but maintain consistency
		const variance = ((i + 1) % 3) - 1;
		placements.push(Math.max(1, Math.min(8, baseValue + variance)));
	}
	return placements;
}

// Helper function to get placement color based on position
function getPlacementColor(placement) {
	if (placement <= 2) return "bg-[--success]"; // 1st-2nd
	if (placement <= 4) return "bg-blue-500"; // 3rd-4th
	if (placement <= 6) return "bg-yellow-500"; // 5th-6th
	return "bg-[--error]"; // 7th-8th
}

// Helper function to format last 10 games performance
// (removed: unused last-10 games helper)

// Color helper for average placement value
function getAveragePlacementColor(avg) {
	if (typeof avg !== "number" || Number.isNaN(avg)) return "text-[--text-secondary]";
	if (avg <= 3.5) return "text-green-400";
	if (avg <= 5) return "text-yellow-400";
	return "text-red-400";
}

// Helper: robustly extract TFT set number from live game or related data
function getTFTSetNumber(liveGameData, matchHistory) {
	// First try from gameVariation
	if (liveGameData.gameVariation) {
		// Common patterns are: "TFT11", "TFTSet11", "Set11", etc.
		const setMatch = liveGameData.gameVariation.match(/(?:TFT)?(?:Set)?(\d+)/i);
		if (setMatch && setMatch[1]) {
			return `Set ${setMatch[1]}`;
		}
	}

	// Direct fields commonly present in some payloads
	if (typeof liveGameData.tft_set_number === "number") {
		return `Set ${liveGameData.tft_set_number}`;
	}
	if (typeof liveGameData.tftSetNumber === "number") {
		return `Set ${liveGameData.tftSetNumber}`;
	}
	if (typeof liveGameData.tft_set_core_name === "string") {
		const m = liveGameData.tft_set_core_name.match(/(?:TFT)?(?:Set)?(\d+)/i);
		if (m && m[1]) return `Set ${m[1]}`;
	}

	// Try from other data like tftGameType or champion/unit data
	if (liveGameData.tftGameType) {
		const setMatch = liveGameData.tftGameType.match(/TFT(\d+)/i);
		if (setMatch && setMatch[1]) {
			return `Set ${setMatch[1]}`;
		}
	}

	// Try to infer from participants' units (character_id often includes TFTxx_ prefix)
	if (Array.isArray(liveGameData.participants)) {
		for (const p of liveGameData.participants) {
			if (Array.isArray(p?.units)) {
				for (const u of p.units) {
					const id = u?.character_id || u?.characterId || u?.name;
					if (typeof id === "string") {
						const m = id.match(/TFT(\d+)/i);
						if (m && m[1]) return `Set ${m[1]}`;
					}
				}
			}
		}
	}

	// Use recent match history (most common set) if available
	if (Array.isArray(matchHistory) && matchHistory.length > 0) {
		const common = getSetInfoFromMatches(matchHistory);
		if (common) {
			const m = String(common).match(/TFT(\d+)/i);
			if (m && m[1]) return `Set ${m[1]}`;
		}
	}

	// If we can't determine, check current date - this is a fallback
	// As of late 2025, default to current set if undetectable
	return "Set 16";
}

/**
 * TFT LiveGame component
 */
export default function LiveGame({ liveGameData, region, matchHistory }) {
	const [time, setTime] = useState("");
	const [showSpectateInfo, setShowSpectateInfo] = useState(false);

	const handleSpectate = () => {
		try {
			const encryptionKey = liveGameData?.observers?.encryptionKey;
			// Prefer platformId from live game payload; fall back to region prop
			const platformIdRaw = liveGameData?.platformId || region;
			const platformId = (platformIdRaw || "").toUpperCase();
			const gameId = liveGameData?.gameId;
			if (!encryptionKey || !platformId || !gameId) return;
			const params = new URLSearchParams({
				platformId,
				encryptionKey,
				gameId: String(gameId),
			});
			if (typeof window !== "undefined") {
				window.open(`/api/tft/spectate?${params.toString()}`);
				setShowSpectateInfo(true);
			}
		} catch (e) {}
	};

	// Ensure region has a valid fallback with proper Riot region format
	const validRegion = region || "EUW1"; // Using EUW1 as fallback instead of "europe"

	// Set game timer
	useEffect(() => {
		const updateTimer = () => {
			const now = Date.now();
			const dur = now - liveGameData.gameStartTime;
			const s = Math.floor((dur / 1000) % 60);
			const m = Math.floor((dur / 60000) % 60);
			const h = Math.floor(dur / 3600000);
			setTime(`${h > 0 ? h + "h " : ""}${m}m ${s}s`);
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [liveGameData]);

	// Format rank for display
	const formatRank = (rank) => {
		if (!rank || typeof rank !== "string") return "Unranked";
		return rank;
	};

	// Get TFT game mode name
	const getTFTGameMode = (queueId) => {
		switch (queueId) {
			case 1090:
				return "Normal TFT";
			case 1100:
				return "Ranked TFT";
			case 1110:
				return "Tutorial TFT";
			case 1130:
				return "Hyper Roll";
			case 1150:
				return "Double Up";
			default:
				return "Teamfight Tactics";
		}
	};

	const modeName = getTFTGameMode(liveGameData.gameQueueConfigId);
	const isRanked = liveGameData.gameQueueConfigId === 1100;

	// Sort participants by rank/LP
	const sortedParticipants = [...liveGameData.participants].sort((a, b) => {
		// First, sort by whether they have a rank
		const aHasRank = a.rank && a.rank !== "Unranked";
		const bHasRank = b.rank && b.rank !== "Unranked";

		if (aHasRank !== bHasRank) {
			return aHasRank ? -1 : 1;
		}

		// Both have ranks or both don't have ranks
		if (!aHasRank) {
			// Sort by level instead if unranked
			return b.summonerLevel - a.summonerLevel;
		}

		// Sort by rank tier
		const rankTiers = {
			CHALLENGER: 9,
			GRANDMASTER: 8,
			MASTER: 7,
			DIAMOND: 6,
			PLATINUM: 5,
			EMERALD: 4,
			GOLD: 3,
			SILVER: 2,
			BRONZE: 1,
			IRON: 0,
		};

		const aTier = a.rank.split(" ")[0].toUpperCase();
		const bTier = b.rank.split(" ")[0].toUpperCase();

		if (rankTiers[aTier] !== rankTiers[bTier]) {
			return rankTiers[bTier] - rankTiers[aTier];
		}

		// Same tier, sort by rank (I, II, III, IV)
		const aRank = a.rank.split(" ")[1] || "I";
		const bRank = b.rank.split(" ")[1] || "I";
		const rankValues = { I: 4, II: 3, III: 2, IV: 1 };

		if (rankValues[aRank] !== rankValues[bRank]) {
			return rankValues[aRank] - rankValues[bRank];
		}

		// Same tier and rank, sort by LP
		return b.lp - a.lp;
	});


	// Enhanced card-based rendering (legacy)
	const renderLegacyTFTCard_DO_NOT_USE = (p) => {
		const rankTxt = formatRank(p.rank);
		const total = p.wins + p.losses;
		const wr = total > 0 ? ((p.wins / total) * 100).toFixed(1) : 0;
		const winrateColor = getWinrateColor(wr);

		// Extract tier for conditional display
		const shortRank =
			rankTxt !== "Unranked" ? rankTxt.split(" ")[0].toLowerCase() : null;

		const lastPlacements =
			getRealPlacements(matchHistory, p.puuid) ||
			generateFallbackPlacements(p.wins, p.losses);

		return (
			<div
				className="card-highlight text-[--text-primary] border-l-4 border-[--tft-primary] rounded-md p-4 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-gray-800 to-[#13151b]"
			>
				<div className="flex items-center space-x-3 mb-3">
					{/* Profile Icon with Level Badge */}
					<div className="relative">
						<div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[--tft-primary]">
							<Image
								src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${
									p.profileIconId || 1
								}.jpg`}
								alt=""
								fill
								className="object-cover"
							/>
						</div>
						<div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[--tft-primary] to-[--tft-secondary] text-white text-xs font-bold flex items-center justify-center w-6 h-6 rounded-full shadow">
							{p.summonerLevel}
						</div>
					</div>

					{/* Name, Rank & Stats */}
					<div className="flex-grow">
						<Link
							href={`/tft/profile?gameName=${encodeURIComponent(
								p.gameName
							)}&tagLine=${encodeURIComponent(
								p.tagLine
							)}&region=${encodeURIComponent(validRegion)}`}
							className="font-bold text-white hover:text-[--tft-primary] transition-colors text-sm md:text-base truncate block"
						>
							{p.gameName}
							<span className="text-gray-400 font-normal">#{p.tagLine}</span>
						</Link>

						{/* Rank Display */}
						<div className="flex items-center mt-1">
							{shortRank && shortRank !== "unranked" && (
								<div className="relative w-5 h-5 mr-1.5">
									<Image
										src={`/images/league/rankedEmblems/${shortRank}.webp`}
										alt=""
										fill
										className="object-contain"
									/>
								</div>
							)}
							<span className="text-sm font-medium truncate">
								{rankTxt !== "Unranked" ? (
									<>
										{rankTxt}{" "}
										<span className="text-[--tft-secondary] font-bold">
											{p.lp} LP
										</span>
									</>
								) : (
									"Unranked"
								)}
							</span>
						</div>
					</div>
				</div>

				{/* Stats Row */}
				<div className="grid grid-cols-3 gap-2 text-center border-t border-gray-700/50 pt-3">
					{/* Win/Loss */}
					<div className="stat-block">
						<span className="text-xs text-[--text-secondary] uppercase">
							Record
						</span>
						<div className="flex items-center justify-center gap-1 mt-1">
							<span className="text-[--success] font-semibold text-sm">
								{p.wins}W
							</span>
							<span className="text-[--text-secondary]">/</span>
							<span className="text-[--error] font-semibold text-sm">
								{p.losses}L
							</span>
						</div>
					</div>

					{/* Win Rate */}
					<div className="stat-block">
						<span className="text-xs text-[--text-secondary] uppercase">
							Win Rate
						</span>
						<div className="flex items-center justify-center mt-1">
							<FaChartLine className={`${winrateColor} mr-1 text-xs`} />
							<span className={`font-bold text-sm ${winrateColor}`}>{wr}%</span>
						</div>
					</div>

					{/* Recent Placements */}
					<div className="stat-block">
						<span className="text-xs text-[--text-secondary] uppercase">
							Placements
						</span>
						<div className="flex items-center justify-center gap-0.5 mt-1">
							{lastPlacements.map((placement, idx) => (
								<div
									key={idx}
									className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white ${getPlacementColor(
										placement
									)}`}
								>
									{placement}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	};


	// Neon/glass drastically redesigned card
	const renderNeonCard = (p) => {
		const rankTxt = formatRank(p.rank);
		const total = p.wins + p.losses;
		const wr = total > 0 ? ((p.wins / total) * 100).toFixed(1) : 0;
		const winrateColor = getWinrateColor(wr);
		const shortRank = rankTxt !== "Unranked" ? rankTxt.split(" ")[0].toLowerCase() : null;
		const lastPlacements = getRealPlacements(matchHistory, p.puuid) || generateFallbackPlacements(p.wins, p.losses);
		const avgPlacementVal = lastPlacements.length
			? lastPlacements.reduce((a, b) => a + b, 0) / lastPlacements.length
			: NaN;
		const avgPlacementText = Number.isNaN(avgPlacementVal)
			? "-"
			: avgPlacementVal.toFixed(1);
		const avgColor = getAveragePlacementColor(avgPlacementVal);
		const top4Rate = lastPlacements.length
			? Math.round((lastPlacements.filter((x) => x <= 4).length / lastPlacements.length) * 100)
			: 0;
		const bestFinish = lastPlacements.length ? Math.min(...lastPlacements) : "-";

		return (
			<div className="neon-card p-4">
				<div className="flex items-start gap-3">
					<div className="relative w-16 h-16 hex-mask overflow-hidden ring-2 ring-[--tft-primary]/40">
						<Image
							src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${p.profileIconId || 1}.jpg`}
							alt=""
							fill
							className="object-cover"
						/>
						<div className="absolute -bottom-1 -right-1 neon-chip bg-[--tft-secondary]/20 border-[--tft-secondary]/40 text-white">
							{p.summonerLevel}
						</div>
					</div>

					<div className="flex-1 min-w-0">
						<Link
							href={`/tft/profile?gameName=${encodeURIComponent(p.gameName)}&tagLine=${encodeURIComponent(p.tagLine)}&region=${encodeURIComponent(validRegion)}`}
							className="block font-extrabold text-white text-base md:text-lg truncate hover:text-[--tft-primary] transition-colors"
						>
							{p.gameName}
							<span className="text-[--text-secondary] font-semibold">#{p.tagLine}</span>
						</Link>
						<div className="mt-1 flex items-center gap-2 text-sm">
							{shortRank && shortRank !== "unranked" && (
								<span className="relative inline-flex w-5 h-5">
									<Image src={`/images/league/rankedEmblems/${shortRank}.webp`} alt="" fill className="object-contain opacity-80" />
								</span>
							)}
							<span className="text-white/90 font-semibold truncate">
								{rankTxt !== "Unranked" ? (
									<>
										{rankTxt}
										<span className="text-[--tft-secondary] font-bold ml-1">{p.lp} LP</span>
									</>
								) : (
									"Unranked"
								)}
							</span>
						</div>
					</div>
				</div>

				<div className="mt-3">
					<div className="flex items-center justify-between text-xs text-[--text-secondary] mb-1">
						<span className="uppercase tracking-wide">Win Rate</span>
						<span className={`font-bold ${winrateColor}`}>{wr}%</span>
					</div>
					<div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
						<div className="h-full rounded-full bg-gradient-to-r from-[--tft-secondary] to-[--tft-primary]" style={{ width: `${wr}%` }} />
					</div>
				</div>

				<div className="mt-4">
					<div className="flex items-center justify-between text-xs text-[--text-secondary] mb-1">
						<span className="uppercase tracking-wide">Recent Performance</span>
						<span className="neon-chip bg-white/5 whitespace-nowrap">Record {p.wins}W/{p.losses}L</span>
					</div>
						<div className="grid grid-cols-3 gap-2 text-xs text-[--text-secondary]">
							<div className="neon-chip justify-center whitespace-nowrap">Avg
								<span className={`ml-1 font-bold ${avgColor}`}>{avgPlacementText}</span>
							</div>
							<div className="neon-chip justify-center whitespace-nowrap">Top4
								<span className="ml-1 font-bold text-[--tft-primary]">{top4Rate}%</span>
							</div>
							<div className="neon-chip justify-center whitespace-nowrap">Best
								<span className="ml-1 font-bold text-[--success]">#{bestFinish}</span>
							</div>
						</div>
					<div className="mt-3 flex items-center flex-wrap gap-1">
						{lastPlacements.map((placement, idx) => (
							<span key={idx} className={`px-2 py-0.5 rounded-md text-xs font-bold text-white ${getPlacementColor(placement)}`}>#{placement}</span>
						))}
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="neon-panel w-full overflow-hidden">
			{/* Enhanced Header with Mode, Time, and View Toggle */}
			<div className="neon-header">
				<div className="flex items-center">
					<div className="flex items-center gap-2">
						<span className="px-2 py-0.5 bg-[--tft-primary]/20 text-[--tft-primary] rounded">
							LIVE
						</span>
						<span>
							{modeName}
							{isRanked ? " (Ranked)" : ""}
						</span>
					</div>
					<div className="hidden md:inline-flex neon-chip ml-4">
						<FaTrophy className="text-[--tft-secondary] mr-1" />
						<span>{liveGameData.participants.length} Players</span>
					</div>
				</div>

				<div className="flex items-center gap-2 sm:gap-4">
					{/* Time Counter */}
					<div className="flex items-center">
						<div className="flex h-2 w-2 relative mr-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
						</div>
						<span className="font-mono">{time}</span>
					</div>
					<button
						onClick={handleSpectate}
						disabled={!liveGameData?.observers?.encryptionKey}
						className={`btn-spectate ml-1 sm:ml-2`}
					>
						<FaDesktop className="w-4 h-4" />
						Spectate
					</button>
				</div>
			</div>

			{/* Players grid */}
			<div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{sortedParticipants.map((participant, index) => (
					<div key={participant.puuid || participant.summonerId || index}>
						{renderNeonCard(participant)}
					</div>
				))}
			</div>

			{/* Footer with game details */}
			<div className="py-2 px-4 text-[11px] text-[--text-secondary] border-t border-[--card-border] flex justify-between">
				<div>
					Game started{" "}
					{new Date(liveGameData.gameStartTime).toLocaleTimeString()}
				</div>
				<div>TFT Set: {getTFTSetNumber(liveGameData, matchHistory)}</div>
			</div>
			{showSpectateInfo && (
				<div className="fixed inset-0 z-[10000] bg-black/70" onClick={() => setShowSpectateInfo(false)}>
					<div className="absolute left-1/2 -translate-x-1/2 top-6 w-full max-w-lg px-4">
						<div className="bg-[#1b1b2d] text-white rounded-xl border border-gray-700 shadow-2xl overflow-hidden animate-fade-down" onClick={(e) => e.stopPropagation()}>
							<div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
								<h3 className="text-base font-semibold tracking-wide">How to spectate</h3>
								<button aria-label="Close" className="text-gray-400 hover:text-white transition" onClick={() => setShowSpectateInfo(false)}>✕</button>
							</div>
							<div className="px-4 py-4 text-sm space-y-3">
								<ol className="list-decimal ml-5 space-y-1.5">
									<li>Double‑click the downloaded file</li>
									<li>If SmartScreen appears: More info → Run anyway</li>
									<li>Wait for the spectator delay, then the game will open</li>
								</ol>
								<p className="text-xs text-gray-400">You can open the file to inspect its contents anytime.</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
