import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import NextImage from "next/image";
import Loading from "../Loading";
import Link from "next/link";
import { buildProfileUrl } from "@/lib/utils/urlHelpers";
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

const cleanBotName = (name, gameMode) => {
	if (gameMode === "RUBY" && name && name.startsWith("Ruby_")) {
		return name.substring(5); // Remove "Ruby_" prefix
	}
	return name;
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

	const TeamBlock = ({ teamArr, teamName, isWin, teamColor }) => {
		const isArena = match.info.queueId === 1700 || match.info.queueId === 1710;

		return (
			<div className="mb-4">
				<div
					className={`px-2 py-1 text-sm font-semibold flex items-center gap-2 border border-[--card-border] rounded-t-lg ${
						isArena ? "bg-gray-800" : "bg-[--card-bg-secondary]"
					}`}
				>
					<span className={isWin ? "text-green-400" : "text-red-400"}>
						{teamName}
					</span>
				</div>

				<div className="overflow-x-auto">
					<div className="overflow-x-auto">
						<table className="min-w-full text-xs">
							<thead className="bg-[--card-bg]">
								<tr>
									<th className="p-2 text-left">Player</th>
									<th className="p-2 text-center">C-Score</th>
									<th className="p-2 text-center">KDA</th>
									<th className="p-2 text-left">Damage</th>
									<th className="p-2 text-center">CS</th>
									<th className="p-2 text-center">Wards</th>
									<th className="p-2 text-right">Items</th>
								</tr>
							</thead>
							<tbody>
								{teamArr.map((p) => (
									<StatsRow
										key={p.participantId}
										p={p}
										maxDamage={maxDamage}
										selected={p.puuid === selectedSummonerPUUID}
										isArena={isArena}
										getAugmentIcon={getAugmentIcon}
									/>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	};

	const StatsRow = ({ p, maxDamage, selected, isArena, getAugmentIcon }) => {
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
			<tr
				className={`border-b border-[--card-border] ${
					selected ? "bg-[--primary]/5" : ""
				}`}
			>
				<td className="p-2 whitespace-nowrap">
					<div className="flex items-center gap-2">
						<NextImage
							src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
							alt="champ"
							width={24}
							height={24}
							className="rounded-md"
						/>
						<Link
							href={buildProfileUrl("league", region, p.riotIdGameName, p.riotIdTagline) || 
								`/league/profile?gameName=${p.riotIdGameName}&tagLine=${p.riotIdTagline}&region=${region}`}
							className="truncate hover:underline"
						>
							{cleanBotName(p.riotIdGameName, match.info.gameMode)}
							<span className="text-[--text-secondary]">
								#{p.riotIdTagline}
							</span>
						</Link>
					</div>
				</td>
				<td className="p-2 text-center">
					<div
						className={`inline-block ${scoreColor} text-white font-semibold px-1 rounded`}
					>
						{p.clutchScore}
					</div>
				</td>
				<td className="p-2 text-center">
					{p.kills}/{p.deaths}/{p.assists}
					<span className="block text-[--text-secondary]">{kda}</span>
				</td>
				<td className="p-2">
					<div className="flex items-center">
						<span className="mr-1 w-12 text-right">
							{p.totalDamageDealtToChampions.toLocaleString()}
						</span>
						<div className="relative w-20 h-2 bg-gray-700 rounded">
							<div
								className="absolute left-0 top-0 h-2 bg-pink-500 rounded"
								style={{ width: `${barPct}%` }}
							></div>
						</div>
					</div>
				</td>
				<td className="p-2 text-center">
					{cs}
					<span className="block text-[--text-secondary]">({csPer}/m)</span>
				</td>
				<td className="p-2 text-center">{wardString}</td>
				<td className="p-2 text-right">
					<div className="flex gap-0.5 justify-end">
						{isArena
							? [
									p.playerAugment1,
									p.playerAugment2,
									p.playerAugment3,
									p.playerAugment4,
							  ].map((augmentId, idx) =>
									augmentId ? (
										<div
											key={idx}
											className="w-5 h-5 bg-[--card-bg] rounded overflow-hidden"
										>
											<NextImage
												src={getAugmentIcon(augmentId)}
												alt="augment"
												width={20}
												height={20}
											/>
										</div>
									) : null
							  )
							: [0, 1, 2, 3, 4, 5, 6].map((idx) => {
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
				</td>
			</tr>
		);
	};

	const isArena = match.info.queueId === 1700 || match.info.queueId === 1710;

	if (isArena) {
		const teams = {};
		match.info.participants.forEach((p) => {
			const teamId = p.playerSubteamId || p.teamId;
			if (!teams[teamId]) {
				teams[teamId] = [];
			}
			teams[teamId].push(p);
		});

		return (
			<div>
				{Object.entries(teams).map(([teamId, teamArr]) => (
					<TeamBlock
						key={teamId}
						teamArr={teamArr}
						teamName={`Team ${teamId}`}
						isWin={teamArr.some((p) => p.win)}
					/>
				))}
			</div>
		);
	}

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
			href={buildProfileUrl("league", r, p.riotIdGameName, p.riotIdTagline) || 
				`/league/profile?gameName=${p.riotIdGameName}&tagLine=${p.riotIdTagline}&region=${r}`}
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
							{cleanBotName(p.riotIdGameName, match.info.gameMode)}
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
						<div className="text-xs text-[--text-secondary] mr-2">
							Augments:
						</div>
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
