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

					<div className="p-2 grid gap-2 grid-cols-1 md:grid-cols-2">
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
			<div className="p-4">
				<div className="max-w-6xl mx-auto">{comps}</div>
			</div>
		);
	}

	// ----------------- Standard Summoner's Rift (and others) --------------------
	const calcTeamStats = (ps) => {
		return ps.reduce(
			(a, c) => {
				a.kills += c.kills;
				a.deaths += c.deaths;
				a.assists += c.assists;
				a.gold += c.goldEarned;
				a.damage += c.totalDamageDealtToChampions;
				return a;
			},
			{ kills: 0, deaths: 0, assists: 0, gold: 0, damage: 0 }
		);
	};

	const t1 = parts.filter((p) => p.teamId === 100);
	const t2 = parts.filter((p) => p.teamId === 200);
	const t1Stats = calcTeamStats(t1);
	const t2Stats = calcTeamStats(t2);
	const bans = {
		team1: match.info.teams.find((t) => t.teamId === 100)?.bans || [],
		team2: match.info.teams.find((t) => t.teamId === 200)?.bans || [],
	};

	const isWinner = (teamId) => {
		return match.info.teams.find((t) => t.teamId === teamId)?.win;
	};

	const t1Winner = isWinner(100);
	const t2Winner = isWinner(200);

	return (
		<div className="p-4">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Team 1 (Blue) */}
				<div
					className={`card ${
						t1Winner
							? "border-l-4 border-green-500"
							: "border-l-4 border-red-500"
					}`}
				>
					<div className="flex justify-between items-center p-4 border-b border-[--card-border]">
						<div className="flex items-center">
							<FaFistRaised className="text-blue-500 mr-2" />
							<span className="text-base font-semibold text-blue-500">
								Blue Team
							</span>
							<span className="ml-2 text-xs bg-[--card-bg] px-2 py-0.5 rounded text-[--text-secondary]">
								{t1Winner ? "Victory" : "Defeat"}
							</span>
						</div>
						<div className="flex items-center space-x-4">
							<div className="text-sm">
								<span className="text-[--text-secondary]">Team KDA:</span>{" "}
								{t1Stats.kills}/{t1Stats.deaths}/{t1Stats.assists}
							</div>
							<div className="text-sm hidden md:block">
								<span className="text-[--text-secondary]">Gold:</span>{" "}
								{(t1Stats.gold / 1000).toFixed(1)}k
							</div>

							{/* Bans */}
							{bans.team1.length > 0 && (
								<div className="flex items-center text-sm">
									<span className="text-[--text-secondary] mr-2">Bans:</span>
									<div className="flex">
										{bans.team1.map((ban, idx) => (
											<div
												key={idx}
												className="w-6 h-6 mx-0.5 rounded-full overflow-hidden border border-[--card-border] opacity-70"
											>
												{ban.championId > 0 && (
													<NextImage
														src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ban.championId}.png`}
														alt="Champion Ban"
														width={24}
														height={24}
														className="w-full h-full"
													/>
												)}
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="divide-y divide-[--card-border]/30">
						{t1.map((p, i) => (
							<Participant
								key={i}
								p={p}
								puuid={selectedSummonerPUUID}
								r={region}
								getA={getAugmentIcon}
								getPerk={getPerkById}
							/>
						))}
					</div>
				</div>

				{/* Team 2 (Red) */}
				<div
					className={`card ${
						t2Winner
							? "border-l-4 border-green-500"
							: "border-l-4 border-red-500"
					}`}
				>
					<div className="flex justify-between items-center p-4 border-b border-[--card-border]">
						<div className="flex items-center">
							<FaShieldAlt className="text-red-500 mr-2" />
							<span className="text-base font-semibold text-red-500">
								Red Team
							</span>
							<span className="ml-2 text-xs bg-[--card-bg] px-2 py-0.5 rounded text-[--text-secondary]">
								{t2Winner ? "Victory" : "Defeat"}
							</span>
						</div>
						<div className="flex items-center space-x-4">
							<div className="text-sm">
								<span className="text-[--text-secondary]">Team KDA:</span>{" "}
								{t2Stats.kills}/{t2Stats.deaths}/{t2Stats.assists}
							</div>
							<div className="text-sm hidden md:block">
								<span className="text-[--text-secondary]">Gold:</span>{" "}
								{(t2Stats.gold / 1000).toFixed(1)}k
							</div>

							{/* Bans */}
							{bans.team2.length > 0 && (
								<div className="flex items-center text-sm">
									<span className="text-[--text-secondary] mr-2">Bans:</span>
									<div className="flex">
										{bans.team2.map((ban, idx) => (
											<div
												key={idx}
												className="w-6 h-6 mx-0.5 rounded-full overflow-hidden border border-[--card-border] opacity-70"
											>
												{ban.championId > 0 && (
													<NextImage
														src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ban.championId}.png`}
														alt="Champion Ban"
														width={24}
														height={24}
														className="w-full h-full"
													/>
												)}
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="divide-y divide-[--card-border]/30">
						{t2.map((p, i) => (
							<Participant
								key={i}
								p={p}
								puuid={selectedSummonerPUUID}
								r={region}
								getA={getAugmentIcon}
								getPerk={getPerkById}
							/>
						))}
					</div>
				</div>
			</div>
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
						</div>
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

						{/* Rank information if available */}
						{p.rank && (
							<div className="text-xs flex items-center mt-1">
								{p.rank.toLowerCase() !== "unranked" && (
									<div className="relative w-4 h-4 mr-1 flex-shrink-0">
										<NextImage
											src={`/images/league/rankedEmblems/${p.rank.split(" ")[0].toLowerCase()}.webp`}
											alt=""
											fill
											className="object-contain"
										/>
									</div>
								)}
								<span className={`${p.rank.toLowerCase() !== "unranked" ? "text-[--primary]" : "text-[--text-secondary]"}`}>
 									{p.rank} {p.rank.toLowerCase() !== "unranked" && p.lp && `${p.lp} LP`}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Spells & Runes */}
				<div className="hidden md:flex items-center space-x-1 md:w-1/6">
					<div className="flex space-x-1">
						{/* Summoner Spells */}
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

					{/* Runes */}
					<div className="flex space-x-1">
						{/* Keystone */}
						{keyPerk && keyPerk.iconPath && (
							<div className="w-6 h-6 rounded-full overflow-hidden bg-[--card-bg]">
								<NextImage
									src={mapCDragonAssetPath(keyPerk.iconPath)}
									alt={keyPerk.name}
									width={24}
									height={24}
									className="w-full h-full"
								/>
							</div>
						)}

						{/* Secondary Tree */}
						{subStyle && subStyle.iconPath && (
							<div className="w-6 h-6 rounded-full overflow-hidden bg-[--card-bg]">
								<NextImage
									src={mapCDragonAssetPath(subStyle.iconPath)}
									alt={subStyle.name}
									width={24}
									height={24}
									className="w-full h-full opacity-80"
								/>
							</div>
						)}
					</div>
				</div>

				{/* Items */}
				<div className="hidden md:flex md:w-1/4 justify-center">
					<div className="grid grid-cols-4 gap-1">
						{/* First row of items (0-3) */}
						<div className="col-span-3 flex space-x-1">
							{[0, 1, 2].map((idx) => {
								const itemId = p[`item${idx}`];
								return (
									<div
										key={idx}
										className="w-6 h-6 bg-[--card-bg] rounded overflow-hidden"
									>
										{itemId > 0 ? (
											<NextImage
												src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${itemId}.png`}
												alt={`Item ${itemId}`}
												width={24}
												height={24}
												className="w-full h-full"
											/>
										) : null}
									</div>
								);
							})}
						</div>

						{/* Trinket */}
						<div className="col-span-1">
							<div className="w-6 h-6 bg-[--card-bg] rounded overflow-hidden">
								{p.item6 > 0 ? (
									<NextImage
										src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${p.item6}.png`}
										alt={`Item ${p.item6}`}
										width={24}
										height={24}
										className="w-full h-full"
									/>
								) : null}
							</div>
						</div>

						{/* Second row of items (3-6) */}
						<div className="col-span-3 flex space-x-1">
							{[3, 4, 5].map((idx) => {
								const itemId = p[`item${idx}`];
								return (
									<div
										key={idx}
										className="w-6 h-6 bg-[--card-bg] rounded overflow-hidden"
									>
										{itemId > 0 ? (
											<NextImage
												src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${itemId}.png`}
												alt={`Item ${itemId}`}
												width={24}
												height={24}
												className="w-full h-full"
											/>
										) : null}
									</div>
								);
							})}
						</div>

						{/* Empty cell to balance the grid */}
						<div className="col-span-1"></div>
					</div>
				</div>

				{/* Stats (KDA, CS, etc) */}
				<div className="ml-auto md:w-1/4 text-right">
					<div className="text-sm flex flex-col items-end">
						<div>
							<span className={getKdaClass(kda)}>{kda} KDA</span>
						</div>
						<div className="text-xs text-[--text-secondary]">
							{p.kills}/{p.deaths}/{p.assists}
						</div>
						<div className="flex items-center justify-end mt-1">
							<span className="text-xs">
								<span className="text-[--text-secondary] mr-1">CS:</span>
								{p.totalMinionsKilled + p.neutralMinionsKilled}
								<span className="text-[--text-secondary] ml-1">
									({p.csPerMin.toFixed(1)}/min)
								</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
