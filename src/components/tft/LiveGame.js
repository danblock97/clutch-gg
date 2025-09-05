import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	FaCoins,
	FaStar,
	FaTrophy,
	FaChartLine,
	FaExchangeAlt,
	FaDesktop,
} from "react-icons/fa";

/**
 * Format game time in minutes and seconds
 */
function formatGameTime(ms) {
	const s = Math.floor((ms / 1000) % 60);
	const m = Math.floor((ms / 60000) % 60);
	return `${m}m ${s}s`;
}

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
function formatLast10Games(wins, losses) {
	const total = wins + losses;
	if (total === 0) return [];

	// For demonstration, generate random W/L sequence
	// In a real implementation, this would use actual match history data
	const results = [];
	for (let i = 0; i < Math.min(10, total); i++) {
		results.push(Math.random() > 0.5 ? "W" : "L");
	}
	return results;
}

// Helper function to extract TFT set number from gameVariation or other data
function getTFTSetNumber(liveGameData) {
	// First try from gameVariation
	if (liveGameData.gameVariation) {
		// Common patterns are: "TFT11", "TFTSet11", "Set11", etc.
		const setMatch = liveGameData.gameVariation.match(/(?:TFT)?(?:Set)?(\d+)/i);
		if (setMatch && setMatch[1]) {
			return `Set ${setMatch[1]}`;
		}
	}

	// Try from other data like tftGameType or champion data
	if (liveGameData.tftGameType) {
		const setMatch = liveGameData.tftGameType.match(/TFT(\d+)/i);
		if (setMatch && setMatch[1]) {
			return `Set ${setMatch[1]}`;
		}
	}

	// If we can't determine, check current date - this is a fallback
	// TFT sets typically last ~3 months
	// As of April 15, 2025, TFT would be around Set 13-15
	// This is an approximation that will need to be updated periodically
	return "Set 14";
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

	// Enhanced card-based rendering
	const renderEnhancedCard = (p) => {
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

	return (
		<div className="bg-[#13151b] text-white rounded-md shadow-lg w-full max-w-7xl mx-auto mt-4">
			{/* Enhanced Header with Mode, Time, and View Toggle */}
			<div className="py-3 px-4 text-sm font-bold bg-gray-900 rounded-t-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
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
					<div className="hidden md:flex items-center ml-4 text-xs bg-black/30 rounded px-2 py-0.5">
						<FaTrophy className="text-[--tft-secondary] mr-1" />
						<span>{liveGameData.participants.length} Players</span>
					</div>
				</div>

				<div className="flex items-center gap-4">
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
						className={`ml-2 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:ring-offset-1 focus:ring-offset-black ${
							liveGameData?.observers?.encryptionKey
								? "bg-gradient-to-br from-amber-400/20 to-black/70 text-white hover:from-amber-400/25 hover:to-black/75 border border-amber-400/20"
								: "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
						}`}
					>
						<FaDesktop className="w-4 h-4" />
						Spectate
					</button>
				</div>
			</div>

			{/* Content based on view mode */}
			<div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{sortedParticipants.map((participant, index) => (
					<div key={participant.puuid || participant.summonerId || index}>
						{renderEnhancedCard(participant)}
					</div>
				))}
			</div>

			{/* Footer with game details */}
			<div className="py-2 px-4 text-[11px] text-[--text-secondary] border-t border-gray-700/30 flex justify-between">
				<div>
					Game started{" "}
					{new Date(liveGameData.gameStartTime).toLocaleTimeString()}
				</div>
				<div>TFT Set: {getTFTSetNumber(liveGameData)}</div>
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
