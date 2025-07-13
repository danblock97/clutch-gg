import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import NextImage from "next/image";
import Loading from "../Loading";
import Link from "next/link";
import {
	FaFistRaised,
	FaShieldAlt,
	FaCrown,
	FaInfoCircle,
} from "react-icons/fa";

function mapCDragonAssetPath(jsonPath) {
	if (!jsonPath) return null;
	const lower = jsonPath.toLowerCase().replace("/lol-game-data/assets", "");
	return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${lower}`;
}

const fetchArenaAugments = async () => {
	const res = await fetch(
		"https://raw.communitydragon.org/latest/cdragon/arena/en_us.json"
	);
	return res.json();
};

const fetchPerks = async () => {
	const res = await fetch(
		"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perks.json"
	);
	return res.json();
};

export default function MatchStatsTab({
	matchDetails,
	matchId,
	selectedSummonerPUUID,
	region,
}) {
	const [augments, setAugments] = useState([]);
	const [perks, setPerks] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const [augmentsData, perksData] = await Promise.all([
					fetchArenaAugments(),
					fetchPerks(),
				]);
				setAugments(augmentsData);
				setPerks(perksData);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		if (!matchDetails || !augments.length) return;

		// Prefetch images for better UX
		const toPrefetch = [];
		matchDetails.forEach((m) => {
			m.info.participants.forEach((p) => {
				// Prefetch champion icons
				toPrefetch.push(
					`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`
				);
				// Prefetch summoner spells
				[p.summoner1Id, p.summoner2Id].forEach((spellId) => {
					toPrefetch.push(`/images/league/summonerSpells/${spellId}.png`);
				});
				// Prefetch items
				for (let i = 0; i < 7; i++) {
					const itemId = p[`item${i}`];
					if (itemId && itemId > 0) {
						toPrefetch.push(
							`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${itemId}.png`
						);
					}
				}
			});

			// Prefetch ARAM/Arena augments if any
			if (
				(m.info.queueId === 1700 || m.info.queueId === 1710) &&
				augments.length
			) {
				m.info.participants.forEach((p) => {
					p.missions?.playerAugments?.forEach((aId) => {
						const found = augments.find((a) => a.id === aId);
						if (found) {
							toPrefetch.push(
								`https://raw.communitydragon.org/latest/game/${found.iconSmall}`
							);
						}
					});
				});
			}

			// Prefetch bans
			m.info.teams.forEach((t) => {
				t.bans.forEach((b) => {
					toPrefetch.push(
						`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${b.championId}.png`
					);
				});
			});
		});

		// Trigger prefetch
		toPrefetch.forEach((src) => {
			const img = new Image();
			img.src = src;
		});
	}, [matchDetails, augments]);

	const match = matchDetails?.find((m) => m.metadata.matchId === matchId);

	if (isLoading) {
		return (
			<div className="text-center py-8">
				<Loading />
			</div>
		);
	}

	if (!matchDetails) {
		return (
			<div className="card-highlight p-6 text-center">
				<p className="text-[--text-secondary]">Match details not found.</p>
			</div>
		);
	}

	if (!match) {
		return (
			<div className="card-highlight p-6 text-center">
				<p className="text-[--text-secondary]">
					This specific match was not found.
				</p>
			</div>
		);
	}

	const getAugmentIcon = (id) => {
		const aug = augments.augments?.find((a) => a.id === id);
		return aug
			? `https://raw.communitydragon.org/latest/game/${aug.iconSmall}`
			: null;
	};

	const getPerkById = (id) => {
		if (!perks || !perks.length) return null;
		return perks.find((p) => p.id === id);
	};

	const parts = match.info.participants;

	// Add CS per minute calculation to each participant
	parts.forEach((p) => {
		p.csPerMin =
			(p.totalMinionsKilled + p.neutralMinionsKilled) /
			(match.info.gameDuration / 60);
	});

	// ----------------- Arena Check --------------------
	if (match.info.queueId === 1700 || match.info.queueId === 1710) {
		let grouped = {};
		let sorted = [...parts].map((p) => ({
			...p,
			playerScore0: p.missions?.playerScore0,
		}));
		sorted.sort((a, b) => a.playerScore0 - b.playerScore0);

		sorted.forEach((p, i) => {
			const tId = Math.floor(i / 2);
			if (!grouped[tId]) grouped[tId] = [];
			grouped[tId].push(p);
		});

		const getOrdinal = (n) => {
			const s = ["th", "st", "nd", "rd"];
			const v = n % 100;
			return n + (s[(v - 20) % 10] || s[v] || s[0]);
		};

		const getPlacementColor = (plc) => {
			switch (plc) {
				case 1:
					return "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30";
				case 2:
					return "from-gray-400/20 to-gray-400/5 border-gray-400/30";
				case 3:
					return "from-amber-700/20 to-amber-700/5 border-amber-700/30";
				case 4:
					return "from-blue-500/20 to-blue-500/5 border-blue-500/30";
				case 5:
					return "from-red-500/20 to-red-500/5 border-red-500/30";
				case 6:
					return "from-green-500/20 to-green-500/5 border-green-500/30";
				case 7:
					return "from-purple-500/20 to-purple-500/5 border-purple-500/30";
				case 8:
					return "from-indigo-500/20 to-indigo-500/5 border-indigo-500/30";
				default:
					return "from-gray-700/20 to-gray-700/5 border-gray-700/30";
			}
		};

		// Render Arena mode
		const comps = Object.entries(grouped).map(([teamIndex, teamArr]) => {
			const place = Number(teamIndex) + 1;
			const placementColorClass = getPlacementColor(place);

			return (
				<div
					key={teamIndex}
					className={`mb-4 rounded-lg overflow-hidden border bg-gradient-to-r ${placementColorClass}`}
				>
					<div className="px-4 py-2 border-b border-[--card-border] flex items-center justify-between">
						<div className="flex items-center">
							<FaCrown
								className={`mr-2 ${
									place === 1 ? "text-yellow-500" : "text-[--text-secondary]"
								}`}
							/>
							<h3 className="text-base font-semibold">
								{getOrdinal(place)} Place
							</h3>
						</div>
						<div className="text-xs text-[--text-secondary]">Arena Mode</div>
					</div>

					<div className="p-2 space-y-1">
						{teamArr.map((p) => (
							<Participant
								key={p.participantId}
								p={p}
								puuid={selectedSummonerPUUID}
								r={region}
								getA={getAugmentIcon}
								getPerk={getPerkById}
								arena
							/>
						))}
					</div>
				</div>
			);
		});

		return (
			<div className="p-4 overflow-hidden">
				<div className="max-w-6xl mx-auto space-y-4">{comps}</div>
			</div>
		);
	}

	// ----------------- Standard 5v5 / ARAM rendering --------------------

	// Calculate clutch scores and find max damage for damage bar scaling
	const calculateClutch = (m, currentP) => {
		// Core metrics
		const kda =
			(currentP.kills + currentP.assists) / Math.max(1, currentP.deaths);
		const kdaScore = Math.min(25, (kda / 5) * 25);

		const teamPlayers = m.info.participants.filter(
			(pp) => pp.teamId === currentP.teamId
		);
		const teamKills = teamPlayers.reduce((sum, pp) => sum + pp.kills, 0);
		const kp = teamKills ? (currentP.kills + currentP.assists) / teamKills : 0;
		const kpScore = Math.min(20, kp * 20);

		const damage = currentP.totalDamageDealtToChampions || 0;
		const damageScore = Math.min(25, (damage / 25000) * 25);

		const visionVal = currentP.visionScore || 0;
		const visionScore = Math.min(15, (visionVal / 40) * 15);

		const turretDamage = currentP.damageDealtToTurrets || 0;
		const turretScore = Math.min(15, (turretDamage / 3000) * 15);

		const isSupport =
			["UTILITY", "SUPPORT"].includes(currentP.teamPosition) ||
			currentP.role === "SUPPORT";
		let supportBonus = 0;
		if (isSupport) {
			const healing =
				(currentP.totalHealsOnTeammates || 0) +
				(currentP.totalDamageShieldedOnTeammates || 0);
			const healingScore = Math.min(15, (healing / 10000) * 15);

			const dmgMitigated =
				currentP.damageSelfMitigated || currentP.totalDamageTaken || 0;
			const mitigatedScore = Math.min(15, (dmgMitigated / 30000) * 15);

			supportBonus = healingScore + mitigatedScore;
		}

		const winBonus = currentP.win ? 10 : 0;
		return Math.round(
			kdaScore +
				damageScore +
				kpScore +
				visionScore +
				turretScore +
				supportBonus +
				winBonus
		);
	};

	match.info.participants.forEach((pp) => {
		pp.clutchScore = calculateClutch(match, pp);
	});

	const maxDamage = Math.max(
		...match.info.participants.map((pp) => pp.totalDamageDealtToChampions)
	);

	// Split teams
	const blue = match.info.participants.filter((pp) => pp.teamId === 100);
	const red = match.info.participants.filter((pp) => pp.teamId === 200);

	const isWinner = (teamId) => {
		return match.info.teams.find((t) => t.teamId === teamId)?.win;
	};

	const TeamBlock = ({ teamArr, teamName, isWin, teamColor }) => (
		<div className="mb-4">
			{/* Team header */}
			<div className="px-2 py-1 text-sm font-semibold flex items-center gap-2 border border-[--card-border] rounded-t-lg bg-[--card-bg-secondary]">
				<span className={isWin ? "text-green-400" : "text-red-400"}>
					{teamName}
				</span>
			</div>

			{/* Column headings */}
			<div className="grid grid-cols-[160px_60px_70px_180px_60px_60px_auto] px-2 py-1 text-[10px] uppercase text-[--text-secondary] border-x border-b border-[--card-border] bg-[--card-bg]">
				<div>Player</div>
				<div className="text-center">C-Score</div>
				<div className="text-center">KDA</div>
				<div>Damage</div>
				<div className="text-center">CS</div>
				<div className="text-center">Wards</div>
				<div className="text-center">Items</div>
			</div>

			{/* Participant rows */}
			{teamArr.map((pp, idx) => (
				<StatsRow
					key={pp.participantId}
					p={pp}
					maxDamage={maxDamage}
					selected={pp.puuid === selectedSummonerPUUID}
				/>
			))}
		</div>
	);

	const StatsRow = ({ p, maxDamage, selected }) => {
		const kda =
			p.deaths === 0
				? (p.kills + p.assists).toFixed(1)
				: ((p.kills + p.assists) / p.deaths).toFixed(2);
		const cs = p.totalMinionsKilled + p.neutralMinionsKilled;
		const csPer = p.csPerMin.toFixed(1);
		const wardString = `${p.wardsPlaced ?? 0} / ${p.wardsKilled ?? 0}`;

		const barPct = Math.round(
			(p.totalDamageDealtToChampions / maxDamage) * 100
		);

		const scoreColor = p.win ? "bg-blue-600" : "bg-red-600";

		return (
			<div
				className={`grid grid-cols-[160px_60px_70px_180px_60px_60px_auto] px-2 py-1 items-center border-x border-b border-[--card-border] ${
					selected ? "bg-[--primary]/5" : ""
				}`}
			>
				{/* Player column */}
				<div className="flex items-center gap-2 overflow-hidden">
					<NextImage
						src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
						alt="champ"
						width={24}
						height={24}
						className="rounded-md"
					/>
					<Link
						href={`/league/profile?gameName=${p.riotIdGameName}&tagLine=${p.riotIdTagline}&region=${region}`}
						className="truncate text-xs hover:underline"
					>
						{p.riotIdGameName}
						<span className="text-[--text-secondary]">#{p.riotIdTagline}</span>
					</Link>
				</div>

				{/* AI Score */}
				<div className="flex justify-center">
					<div
						className={`${scoreColor} text-white text-xs font-semibold px-1 rounded`}
					>
						{p.clutchScore}
					</div>
				</div>

				{/* KDA */}
				<div className="text-center text-xs">
					{p.kills}/{p.deaths}/{p.assists}
					<span className="block text-[--text-secondary]">{kda}</span>
				</div>

				{/* Damage */}
				<div className="flex items-center text-xs">
					<span className="mr-0.5 w-12 text-right">
						{p.totalDamageDealtToChampions.toLocaleString()}
					</span>
					<div className="relative w-20 h-2 bg-gray-700 rounded">
						<div
							className="absolute left-0 top-0 h-2 bg-pink-500 rounded"
							style={{ width: `${barPct}%` }}
						></div>
					</div>
				</div>

				{/* CS */}
				<div className="text-center text-xs">
					{cs}
					<span className="block text-[--text-secondary]">({csPer}/m)</span>
				</div>

				{/* Wards */}
				<div className="text-center text-xs">{wardString}</div>

				{/* Items */}
				<div className="flex gap-0.5 justify-end flex-nowrap min-w-[160px]">
					{[0, 1, 2, 3, 4, 5, 6].map((idx) => {
						const itemId = p[`item${idx}`];
						return (
							<div
								key={idx}
								className="w-5 h-5 bg-[--card-bg] rounded overflow-hidden"
							>
								{itemId > 0 && (
									<NextImage
										src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${itemId}.png`}
										alt="item"
										width={20}
										height={20}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<div>
			<TeamBlock
				teamArr={blue}
				teamName={`${isWinner(100) ? "Win" : "Lose"} (Blue Team)`}
				isWin={isWinner(100)}
			/>
			<TeamBlock
				teamArr={red}
				teamName={`${isWinner(200) ? "Win" : "Lose"} (Red Team)`}
				isWin={isWinner(200)}
			/>
		</div>
	);
}

function Participant({ p, puuid, r, getA, getPerk, arena = false }) {
	const kda =
		p.deaths === 0
			? (p.kills + p.assists).toFixed(1)
			: ((p.kills + p.assists) / p.deaths).toFixed(1);
	const { perks } = p || {};
	let keyPerk = null;
	let subStyle = null;

	if (perks?.styles) {
		const prim = perks.styles.find((s) => s.description === "primaryStyle");
		const sub = perks.styles.find((s) => s.description === "subStyle");
		if (prim?.selections?.length) {
			keyPerk = getPerk(prim.selections[0].perk);
		}
		if (sub?.style) {
			subStyle = getPerk(sub.style);
		}
	}

	// Get KDA class
	const getKdaClass = (kda) => {
		const kdaValue = parseFloat(kda);
		if (kdaValue >= 5) return "text-purple-500 font-bold";
		if (kdaValue >= 3) return "text-green-500";
		if (kdaValue >= 2) return "text-blue-500";
		return "text-[--text-secondary]";
	};

	const isCurrentPlayer = p.puuid === puuid;

	return (
		<Link
			href={`/league/profile?gameName=${p.riotIdGameName}&tagLine=${p.riotIdTagline}&region=${r}`}
		>
			<div
				className={`flex items-center p-3 hover:bg-[--card-bg-secondary] transition-colors duration-150 ${
					isCurrentPlayer ? "bg-[--primary]/5" : ""
				}`}
			>
				<div className="flex-1 md:w-1/3 flex items-center">
					{/* Champion Icon */}
					<div className="relative w-10 h-10 mr-3">
						<NextImage
							src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
							alt={`Champion ${p.championId}`}
							width={40}
							height={40}
							className="rounded-full border-2 border-[--card-border]"
						/>
						<div className="absolute -bottom-1 -right-1 bg-[--card-bg] rounded-full text-xs w-5 h-5 flex items-center justify-center border border-[--card-border]">
							{p.champLevel}
						</div>
					</div>

					{/* Summoner Name */}
					<div className="overflow-hidden">
						<div
							className={`font-medium truncate ${
								isCurrentPlayer ? "text-[--primary]" : ""
							}`}
						>
							{p.riotIdGameName}
							<span className="text-[--text-secondary] text-xs">
								#{p.riotIdTagline}
							</span>
						</div>{" "}
						<div className="text-xs text-[--text-secondary] flex items-center">
							{/* Position icon if available */}
							{p.individualPosition &&
								p.individualPosition !== "Invalid" &&
								!arena && (
									<NextImage
										src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${p.individualPosition.toLowerCase()}.svg`}
										alt={p.individualPosition}
										width={14}
										height={14}
										className="mr-1"
									/>
								)}
							<span>Level {p.summonerLevel}</span>
						</div>
					</div>
				</div>

				{/* Spells & Runes OR Arena Augments */}
				<div className="hidden md:flex items-center space-x-1 md:w-1/6">
					{arena && p.missions?.playerAugments ? (
						/* Arena Augments */
						<div className="flex flex-wrap gap-1 max-w-[80px]">
							{p.missions.playerAugments
								.filter(Boolean)
								.slice(0, 4)
								.map((augmentId, idx) => {
									const augmentIcon = getA(augmentId);
									return augmentIcon ? (
										<div key={idx} className="flex-shrink-0">
											<NextImage
												src={augmentIcon}
												alt={`Augment ${idx + 1}`}
												width={16}
												height={16}
												className="w-4 h-4 rounded border border-gray-600"
											/>
										</div>
									) : null;
								})}
						</div>
					) : (
						/* Regular Summoner Spells */
						<div className="flex space-x-1">
							{[p.summoner1Id, p.summoner2Id].map((spellId, idx) => (
								<div key={idx} className="w-6 h-6 rounded overflow-hidden">
									<NextImage
										src={`/images/league/summonerSpells/${spellId}.png`}
										alt={`Spell ${spellId}`}
										width={24}
										height={24}
										className="w-full h-full rounded"
									/>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Mobile Arena Augments */}
				{arena && p.missions?.playerAugments && (
					<div className="md:hidden flex items-center mt-2">
						<div className="text-xs text-[--text-secondary] mr-2">Augments:</div>
						<div className="flex gap-1">
							{p.missions.playerAugments
								.filter(Boolean)
								.slice(0, 4)
								.map((augmentId, idx) => {
									const augmentIcon = getA(augmentId);
									return augmentIcon ? (
										<div key={idx} className="flex-shrink-0">
											<NextImage
												src={augmentIcon}
												alt={`Augment ${idx + 1}`}
												width={20}
												height={20}
												className="w-5 h-5 rounded border border-gray-600"
											/>
										</div>
									) : null;
								})}
						</div>
					</div>
				)}
			</div>
		</Link>
	);
}
