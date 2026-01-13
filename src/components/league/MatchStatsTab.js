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
							`https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/${itemId}.png`
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
	const gameDurationMinutes = match.info.gameDuration / 60;
	const teamKills = match.info.participants.reduce((acc, p) => {
		acc[p.teamId] = (acc[p.teamId] || 0) + p.kills;
		return acc;
	}, {});
	const rankedByClutch = [...match.info.participants]
		.sort((a, b) => b.clutchScore - a.clutchScore)
		.map((p, idx) => ({ id: p.participantId, rank: idx + 1 }));
	const clutchRankMap = new Map(
		rankedByClutch.map((entry) => [entry.id, entry.rank])
	);
	const topWinner = [...match.info.participants]
		.filter((p) => p.win)
		.sort((a, b) => b.clutchScore - a.clutchScore)[0];
	const topLoser = [...match.info.participants]
		.filter((p) => !p.win)
		.sort((a, b) => b.clutchScore - a.clutchScore)[0];
	const getPlacementLabel = (p) => {
		if (topWinner?.participantId === p.participantId) return "MVP";
		if (topLoser?.participantId === p.participantId) return "ACE";
		const rank = clutchRankMap.get(p.participantId) || 0;
		const suffix =
			rank % 10 === 1 && rank % 100 !== 11
				? "st"
				: rank % 10 === 2 && rank % 100 !== 12
				? "nd"
				: rank % 10 === 3 && rank % 100 !== 13
				? "rd"
				: "th";
		return `${rank}${suffix}`;
	};

	const isWinner = (teamId) => {
		return match.info.teams.find((t) => t.teamId === teamId)?.win;
	};

	const getObjectiveCount = (team, keys) => {
		if (!team?.objectives) return 0;
		for (const key of keys) {
			const obj = team.objectives[key];
			if (obj && typeof obj.kills === "number") return obj.kills;
		}
		return 0;
	};

	const TeamBlock = ({ teamArr, teamName, isWin, teamId }) => {
		const isArena = match.info.queueId === 1700 || match.info.queueId === 1710;
		const teamData = match.info.teams.find((t) => t.teamId === teamId);
		const objectives = [
			{
				key: "grubs",
				count: getObjectiveCount(teamData, ["horde", "voidgrubs", "voidgrub", "grubs"]),
				icon: "/images/league/objectives/grub.png",
				label: "Void Grubs",
			},
			{
				key: "dragons",
				count: getObjectiveCount(teamData, ["dragon"]),
				icon: "/images/league/objectives/dragon.png",
				label: "Dragons",
			},
			{
				key: "baron",
				count: getObjectiveCount(teamData, ["baron"]),
				icon: "/images/league/objectives/baron.png",
				label: "Baron",
			},
			{
				key: "herald",
				count: getObjectiveCount(teamData, ["riftHerald", "herald"]),
				icon: "/images/league/objectives/herald.png",
				label: "Herald",
			},
			{
				key: "tower",
				count: getObjectiveCount(teamData, ["tower"]),
				icon: "/images/league/objectives/tower.png",
				label: "Towers",
			},
		];
		const headerGlow = isWin
			? "from-emerald-500/20 via-emerald-500/5 to-transparent"
			: "from-rose-500/20 via-rose-500/5 to-transparent";
		const headerText = isWin ? "text-emerald-300" : "text-rose-300";

		return (
			<div className="mb-5 rounded-xl border border-white/10 bg-[--card-bg] overflow-hidden">
				<div className={`px-4 py-2 text-sm font-semibold flex items-center justify-between bg-gradient-to-r ${headerGlow}`}>
					<div className="flex items-center gap-2">
						<span className={headerText}>{teamName}</span>
						{!isArena && (
							<div className="flex items-center gap-4 text-sm text-[--text-secondary]">
								{objectives.map((obj) => (
									<div key={obj.key} className="flex items-center gap-1" title={obj.label}>
										<NextImage
											src={obj.icon}
											alt={obj.label}
											width={44}
											height={36}
											className="opacity-80 w-11 h-9 object-contain"
										/>
										<span className="text-[--text-primary] text-xl leading-none font-semibold">
											{obj.count}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
					<span className="text-[10px] uppercase tracking-[0.2em] text-[--text-secondary]">
						{isArena ? "Arena" : "Summoner's Rift"}
					</span>
				</div>

				<div className="overflow-x-hidden">
					<div className="w-full">
						{teamArr.map((p) => (
							<StatsRow
								key={p.participantId}
								p={p}
								maxDamage={maxDamage}
								selected={p.puuid === selectedSummonerPUUID}
								isArena={isArena}
								getAugmentIcon={getAugmentIcon}
								killsTotal={teamKills[p.teamId] || 0}
								placementLabel={getPlacementLabel(p)}
							/>
						))}
					</div>
				</div>
			</div>
		);
	};

	const StatsRow = ({
		p,
		maxDamage,
		selected,
		isArena,
		getAugmentIcon,
		killsTotal,
		placementLabel,
	}) => {
		const kda =
			p.deaths === 0
				? (p.kills + p.assists).toFixed(1)
				: ((p.kills + p.assists) / p.deaths).toFixed(2);
		const cs = p.totalMinionsKilled + p.neutralMinionsKilled;
		const csPer = p.csPerMin.toFixed(1);
		const kp = killsTotal
			? Math.round(((p.kills + p.assists) / killsTotal) * 100)
			: 0;
		const dmgPerMin = Math.round(
			(p.totalDamageDealtToChampions || 0) / gameDurationMinutes
		);

		const barPct = Math.round(
			(p.totalDamageDealtToChampions / maxDamage) * 100
		);

		const scoreColor = p.win ? "bg-blue-600" : "bg-red-600";

		return (
			<div
				className={`flex items-center gap-2.5 px-4 py-2 text-xs border-b border-white/5 ${
					selected ? "bg-white/5" : "bg-transparent"
				}`}
			>
				<div className="w-12 flex justify-center">
					<div
						className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
							placementLabel === "MVP"
								? "bg-amber-500/20 text-amber-300"
								: placementLabel === "ACE"
								? "bg-cyan-500/20 text-cyan-300"
								: "bg-white/10 text-[--text-secondary]"
						}`}
					>
						{placementLabel}
					</div>
				</div>
				<div className="flex items-center gap-2 min-w-[170px]">
					<div className="relative">
						<NextImage
							src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
							alt="champ"
							width={36}
							height={36}
							className="rounded-md"
						/>
						<div className="absolute -bottom-1 -right-1 bg-[--card-bg] rounded-full text-[10px] w-5 h-5 flex items-center justify-center border border-white/10">
							{p.champLevel}
						</div>
					</div>
					<div className="min-w-0">
						<Link
							href={
								buildProfileUrl("league", region, p.riotIdGameName, p.riotIdTagline) ||
								`/league/profile?gameName=${p.riotIdGameName}&tagLine=${p.riotIdTagline}&region=${region}`
							}
							className="truncate hover:underline font-semibold"
						>
							{cleanBotName(p.riotIdGameName, match.info.gameMode)}
						</Link>
						<div className="text-[--text-secondary] text-[10px] truncate">
							#{p.riotIdTagline}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-1.5 -ml-3">
					<div className="flex flex-col gap-1">
						{[p.summoner1Id, p.summoner2Id].map((spellId, idx) => (
							<div
								key={`${spellId}-${idx}`}
								className="w-5 h-5 rounded overflow-hidden border border-white/10 bg-black/30"
							>
								<NextImage
									src={`/images/league/summonerSpells/${spellId}.png`}
									alt={`Spell ${spellId}`}
									width={20}
									height={20}
									className="w-full h-full"
								/>
							</div>
						))}
					</div>
					<div className="flex flex-col gap-1">
						{(() => {
							const styles = p.perks?.styles || [];
							const primary = styles.find((s) => s.description === "primaryStyle");
							const secondary = styles.find((s) => s.description === "subStyle");
							const primaryPerk = primary?.selections?.length
								? getPerkById(primary.selections[0].perk)
								: null;
							const keystoneIcon = primaryPerk?.iconPath
								? mapCDragonAssetPath(primaryPerk.iconPath)
								: null;

							return (
								<div className="w-5 h-5 rounded-full overflow-hidden border border-white/10 bg-black/30">
									{keystoneIcon && (
										<NextImage
											src={keystoneIcon}
											alt="Keystone"
											width={20}
											height={20}
											className="w-full h-full"
										/>
									)}
								</div>
							);
						})()}
					</div>
				</div>
				<div className="grid grid-cols-4 grid-rows-2 gap-1 w-[112px]">
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
										className="w-6 h-6 bg-[--card-bg] rounded-md overflow-hidden border border-white/10"
									>
										<NextImage
											src={getAugmentIcon(augmentId)}
											alt="augment"
											width={24}
											height={24}
										/>
									</div>
								) : null
						  )
						: [0, 1, 2, "ward", 3, 4, 5].map((slot, idx) => {
								if (slot === "ward") {
									const wardId = p.item6 > 0 ? p.item6 : 3340;
									return (
										<div
											key="ward"
											className="w-6 h-6 bg-[--card-bg] rounded-md overflow-hidden border border-white/10"
										>
											<NextImage
												src={`https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/${wardId}.png`}
												alt="ward"
												width={24}
												height={24}
											/>
										</div>
									);
								}
								const itemId = p[`item${slot}`];
								return (
									<div
										key={idx}
										className="w-6 h-6 bg-[--card-bg] rounded-md overflow-hidden border border-white/10"
									>
										{itemId > 0 && (
											<NextImage
												src={`https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/${itemId}.png`}
												alt="item"
												width={24}
												height={24}
											/>
										)}
									</div>
								);
						  })}
				</div>
				<div className="grid grid-cols-[76px_52px_52px_110px_54px] items-start gap-1.5 ml-2 flex-shrink-0">
					<div className="text-center">
						<div className="font-semibold text-sm">
							{p.kills} / <span className="text-rose-300">{p.deaths}</span> / {p.assists}
						</div>
						<div className="text-[10px] text-[--text-secondary]">{kda} KDA</div>
					</div>
					<div className="text-center">
						<div className="font-semibold">{kp}%</div>
						<div className="text-[10px] text-[--text-secondary]">KP</div>
					</div>
					<div className="text-center">
						<div className="font-semibold">{csPer}</div>
						<div className="text-[10px] text-[--text-secondary]">CS/min</div>
					</div>
					<div className="min-w-[120px]">
						<div className="relative w-full h-2 bg-white/10 rounded-full">
							<div
								className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500"
								style={{ width: `${barPct}%` }}
							></div>
						</div>
						<div className="text-[10px] text-[--text-secondary] mt-1">
							{p.totalDamageDealtToChampions.toLocaleString()}
							<span className="text-[--text-secondary]"> ({dmgPerMin}/m)</span>
						</div>
					</div>
					<div className="flex items-start justify-center h-full">
						<div className="text-base font-semibold text-sky-300 leading-none">
							{p.clutchScore}
						</div>
					</div>
				</div>
			</div>
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
				teamName={`${isWinner(100) ? "Victory" : "Defeat"} (Blue Side)`}
				isWin={isWinner(100)}
				teamId={100}
			/>
			<TeamBlock
				teamArr={red}
				teamName={`${isWinner(200) ? "Victory" : "Defeat"} (Red Side)`}
				isWin={isWinner(200)}
				teamId={200}
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
