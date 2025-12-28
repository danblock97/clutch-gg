"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { FaFistRaised, FaCrown, FaShieldAlt } from "react-icons/fa";

const cleanBotName = (name, gameMode) => {
	if (gameMode === "RUBY" && name && name.startsWith("Ruby_")) {
		return name.substring(5);
	}
	return name;
};

export default function MatchDetailsTab({
	matchDetails,
	matchId,
	selectedSummonerPUUID,
	region,
}) {
	const [selectedChampions, setSelectedChampions] = useState({
		team100: null,
		team200: null,
	});
	const [timeline, setTimeline] = useState(null);
	const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
	const [championAbilities, setChampionAbilities] = useState(null);
	const [ddragonVersion, setDdragonVersion] = useState("15.8.1");

	const match = matchDetails?.find((m) => m.metadata.matchId === matchId);
	if (!match) {
		return (
			<div className="card-highlight p-6 text-center">
				<p className="text-[--text-secondary]">Match data not found.</p>
			</div>
		);
	}

	// Use preloaded timeline from match data, or fallback to fetching
	useEffect(() => {
		if (match.timeline) {
			setTimeline(match.timeline);
		} else if (matchId && !timeline && !isLoadingTimeline) {
			// Fallback: fetch timeline if not preloaded
			setIsLoadingTimeline(true);
			fetch(`/api/league/timeline?matchId=${matchId}`)
				.then((res) => res.json())
				.then((data) => {
					setTimeline(data);
					setIsLoadingTimeline(false);
				})
				.catch(() => {
					setIsLoadingTimeline(false);
				});
		}
	}, [match.timeline, matchId, timeline, isLoadingTimeline]);

	const participants = match.info.participants;
	const team100 = participants.filter((p) => p.teamId === 100);
	const team200 = participants.filter((p) => p.teamId === 200);
	const currentPlayer = participants.find(
		(p) => p.puuid === selectedSummonerPUUID
	);

	// Initialize selected champions with current player and their lane opponent
	useEffect(() => {
		if (currentPlayer && !selectedChampions.team100 && !selectedChampions.team200) {
			const currentTeam = currentPlayer.teamId === 100 ? team100 : team200;
			const enemyTeam = currentPlayer.teamId === 100 ? team200 : team100;
			
			// Find lane opponent (same position)
			const laneOpponent = enemyTeam.find(
				(p) => p.teamPosition === currentPlayer.teamPosition
			);

			setSelectedChampions({
				team100: currentPlayer.teamId === 100 ? currentPlayer.participantId : (laneOpponent?.participantId || null),
				team200: currentPlayer.teamId === 200 ? currentPlayer.participantId : (laneOpponent?.participantId || null),
			});
		}
	}, [currentPlayer, team100, team200]);

	const selectedPlayer100 = participants.find(
		(p) => p.participantId === selectedChampions.team100
	);
	const selectedPlayer200 = participants.find(
		(p) => p.participantId === selectedChampions.team200
	);

	// Fetch champion ability data for spell icons
	useEffect(() => {
		if (!selectedPlayer100?.championId) return;

		const fetchChampionAbilities = async () => {
			try {
				// Get latest version
				const versionsRes = await fetch(
					"https://ddragon.leagueoflegends.com/api/versions.json"
				);
				const versions = await versionsRes.json();
				const latestVersion = versions[0] || "15.8.1";
				setDdragonVersion(latestVersion);

				// Get champion data from Community Dragon to get alias
				const championRes = await fetch(
					`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/${selectedPlayer100.championId}.json`
				);
				if (!championRes.ok) return;
				const champion = await championRes.json();

				// Get Data Dragon champion data for abilities
				const ddRes = await fetch(
					`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion/${champion.alias}.json`
				);
				if (!ddRes.ok) return;
				const ddData = await ddRes.json();
				const championDdragon = ddData.data[champion.alias];

				if (championDdragon && championDdragon.spells) {
					setChampionAbilities({
						spell1: championDdragon.spells[0], // Q
						spell2: championDdragon.spells[1], // W
						spell3: championDdragon.spells[2], // E
						spell4: championDdragon.spells[3], // R
					});
				}
			} catch (error) {
				console.error("Error fetching champion abilities:", error);
			}
		};

		fetchChampionAbilities();
	}, [selectedPlayer100?.championId]);

	// Calculate laning phase stats at 15 minutes
	const laningStats = useMemo(() => {
		if (!timeline || !timeline.info || !timeline.info.frames || !selectedPlayer100 || !selectedPlayer200) {
			return null;
		}

		// Find frame closest to 15 minutes (15 * 60 * 1000 = 900000 ms)
		const targetTime = 15 * 60 * 1000;
		let frame15 = null;
		let frame15Index = 15; // Default to index 15

		// Try to find frame at exactly 15 minutes, or closest
		for (let i = 0; i < timeline.info.frames.length; i++) {
			const frame = timeline.info.frames[i];
			if (frame && frame.timestamp >= targetTime) {
				frame15 = frame;
				frame15Index = i;
				break;
			}
		}

		// Fallback to frame at index 15 if available
		if (!frame15 && timeline.info.frames[15]) {
			frame15 = timeline.info.frames[15];
			frame15Index = 15;
		}

		if (!frame15 || !frame15.participantFrames) return null;

		const p100Frame = frame15.participantFrames[selectedPlayer100.participantId];
		const p200Frame = frame15.participantFrames[selectedPlayer200.participantId];

		if (!p100Frame || !p200Frame) return null;

		// Calculate differences from team 100 player's perspective
		const csDiff = p100Frame.minionsKilled - p200Frame.minionsKilled;
		const goldDiff = p100Frame.totalGold - p200Frame.totalGold;
		const xpDiff = p100Frame.xp - p200Frame.xp;

		// Check who reached level 2 first
		let firstLevel2Player = null;
		for (let i = 0; i <= frame15Index && i < timeline.info.frames.length; i++) {
			const frame = timeline.info.frames[i];
			if (frame && frame.participantFrames) {
				const p100 = frame.participantFrames[selectedPlayer100.participantId];
				const p200 = frame.participantFrames[selectedPlayer200.participantId];
				if (p100 && p100.level >= 2 && (!p200 || p200.level < 2)) {
					firstLevel2Player = selectedPlayer100.participantId;
					break;
				}
				if (p200 && p200.level >= 2 && (!p100 || p100.level < 2)) {
					firstLevel2Player = selectedPlayer200.participantId;
					break;
				}
			}
		}

		return {
			csDiff: csDiff,
			goldDiff: goldDiff,
			xpDiff: xpDiff,
			firstLevel2: firstLevel2Player === selectedPlayer100.participantId,
		};
	}, [timeline, selectedPlayer100, selectedPlayer200]);

	// Build order from timeline events
	const buildOrder = useMemo(() => {
		if (!timeline || !timeline.info || !timeline.info.frames || !selectedPlayer100) {
			return [];
		}

		const purchases = [];
		timeline.info.frames.forEach((frame) => {
			if (frame.events) {
				frame.events.forEach((event) => {
					if (
						event.type === "ITEM_PURCHASED" &&
						event.participantId === selectedPlayer100.participantId
					) {
						purchases.push({
							itemId: event.itemId,
							timestamp: event.timestamp,
							time: Math.floor(event.timestamp / 60000), // Convert to minutes
						});
					}
				});
			}
		});

		return purchases;
	}, [timeline, selectedPlayer100]);

	// Skill order from timeline events
	const skillOrder = useMemo(() => {
		if (!timeline || !timeline.info || !timeline.info.frames || !selectedPlayer100) {
			return [];
		}

		const skills = [];
		timeline.info.frames.forEach((frame) => {
			if (frame.events) {
				frame.events.forEach((event) => {
					if (
						event.type === "SKILL_LEVEL_UP" &&
						event.participantId === selectedPlayer100.participantId
					) {
						skills.push({
							skillSlot: event.skillSlot, // 1=Q, 2=W, 3=E, 4=R
							level: event.level,
							timestamp: event.timestamp,
						});
					}
				});
			}
		});

		// Sort by timestamp to show chronological order of upgrades
		skills.sort((a, b) => a.timestamp - b.timestamp);
		return skills;
	}, [timeline, selectedPlayer100]);

	// Spell casts and pings
	const spellCasts = selectedPlayer100
		? {
				Q: selectedPlayer100.spell1Casts || 0,
				W: selectedPlayer100.spell2Casts || 0,
				E: selectedPlayer100.spell3Casts || 0,
				R: selectedPlayer100.spell4Casts || 0,
				D: selectedPlayer100.summoner1Casts || 0,
				F: selectedPlayer100.summoner2Casts || 0,
			}
		: null;

	// Pings - only show pings that have images available
	const mainPings = selectedPlayer100
		? [
				{
					key: "onMyWay",
					name: "On My Way",
					count: selectedPlayer100.challenges?.onMyWayPings || selectedPlayer100.onMyWayPings || 0,
					icon: "/images/league/ping-icons/onMyWayPings.webp",
				},
				{
					key: "push",
					name: "Push",
					count: selectedPlayer100.challenges?.pushPings || selectedPlayer100.pushPings || 0,
					icon: "/images/league/ping-icons/pushPings.webp",
				},
				{
					key: "needVision",
					name: "Need Vision",
					count: selectedPlayer100.challenges?.needVisionPings || selectedPlayer100.needVisionPings || 0,
					icon: "/images/league/ping-icons/needVisionPings.webp",
				},
				{
					key: "enemyVision",
					name: "Vision Here",
					count: selectedPlayer100.challenges?.enemyVisionPings || selectedPlayer100.enemyVisionPings || 0,
					icon: "/images/league/ping-icons/enemyVisionPings.webp",
				},
				{
					key: "enemyMissing",
					name: "Missing",
					count: selectedPlayer100.challenges?.enemyMissingPings || selectedPlayer100.enemyMissingPings || 0,
					icon: "/images/league/ping-icons/enemyMissingPings.webp",
				},
				{
					key: "assistMe",
					name: "Assistance",
					count: selectedPlayer100.challenges?.assistMePings || selectedPlayer100.assistMePings || 0,
					icon: "/images/league/ping-icons/assistMePings.webp",
				},
			]
		: [];

	const gameDurationMinutes = match.info.gameDuration / 60;
	const globalStats = selectedPlayer100
		? {
				csPerMin: (
					(selectedPlayer100.totalMinionsKilled +
						selectedPlayer100.neutralMinionsKilled) /
					gameDurationMinutes
				).toFixed(1),
				vsPerMin: ((selectedPlayer100.visionScore || 0) / gameDurationMinutes).toFixed(1),
				dmgPerMin: (
					(selectedPlayer100.totalDamageDealtToChampions || 0) /
					gameDurationMinutes
				).toFixed(0),
				goldPerMin: ((selectedPlayer100.goldEarned || 0) / gameDurationMinutes).toFixed(0),
			}
		: null;

	return (
		<div className="p-4">
			{/* Team Composition */}
			<div className="mb-6">
				<div className="flex items-center justify-center gap-3">
					{/* Team 100 */}
					<div className="flex gap-1.5">
						{team100.map((p) => {
							const role = p.teamPosition || p.individualPosition;
							const hasRole = role && role !== "Invalid";
							
							return (
								<button
									key={p.participantId}
									onClick={() =>
										setSelectedChampions({
											...selectedChampions,
											team100: p.participantId,
										})
									}
									className={`relative flex flex-col items-center gap-1 transition-all ${
										selectedChampions.team100 === p.participantId
											? "scale-110"
											: "hover:scale-105"
									}`}
								>
									<div className={`relative w-14 h-14 rounded-md border-2 transition-all ${
										selectedChampions.team100 === p.participantId
											? "border-[--primary]"
											: "border-[--card-border] hover:border-gray-500"
									}`}>
										<Image
											src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
											alt={p.championName}
											fill
											className="object-cover rounded-md"
										/>
									</div>
									{hasRole && (
										<div className="w-5 h-5 flex items-center justify-center">
											<Image
												src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${role.toLowerCase()}.svg`}
												alt={role}
												width={20}
												height={20}
												className="opacity-70"
											/>
										</div>
									)}
								</button>
							);
						})}
					</div>

					<div className="text-xl font-bold text-white mx-2 flex items-center">
						<span className="relative">
							VS
							<span className="absolute -left-1 -top-1 text-white/20 text-xs">⚡</span>
							<span className="absolute -right-1 -bottom-1 text-white/20 text-xs">⚡</span>
						</span>
					</div>

					{/* Team 200 */}
					<div className="flex gap-1.5">
						{team200.map((p) => {
							const role = p.teamPosition || p.individualPosition;
							const hasRole = role && role !== "Invalid";
							
							return (
								<button
									key={p.participantId}
									onClick={() =>
										setSelectedChampions({
											...selectedChampions,
											team200: p.participantId,
										})
									}
									className={`relative flex flex-col items-center gap-1 transition-all ${
										selectedChampions.team200 === p.participantId
											? "scale-110"
											: "hover:scale-105"
									}`}
								>
									<div className={`relative w-14 h-14 rounded-md border-2 transition-all ${
										selectedChampions.team200 === p.participantId
											? "border-[--primary]"
											: "border-[--card-border] hover:border-gray-500"
									}`}>
										<Image
											src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
											alt={p.championName}
											fill
											className="object-cover rounded-md"
										/>
									</div>
									{hasRole && (
										<div className="w-5 h-5 flex items-center justify-center">
											<Image
												src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${role.toLowerCase()}.svg`}
												alt={role}
												width={20}
												height={20}
												className="opacity-70"
											/>
										</div>
									)}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{selectedPlayer100 && (
				<>
					{/* Stats in one line with borders */}
					<div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
						{/* Laning Phase Stats */}
						{laningStats && (
							<div className="border border-[--card-border] rounded p-3 bg-[--card-bg]">
								<h3 className="text-[10px] font-semibold mb-2.5 text-[--text-primary] uppercase flex items-center gap-1.5">
									<FaFistRaised className="text-green-500 w-3.5 h-3.5" />
									LANING PHASE (AT 15)
								</h3>
								<div className="space-y-1.5 text-xs">
									<div className="flex items-center justify-between">
										<span className="text-[--text-secondary] text-[11px] lowercase">cs diff</span>
										<span className="text-[--text-primary] font-semibold text-right text-xs">
											{laningStats.csDiff >= 0 ? "+" : ""}
											{laningStats.csDiff}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-[--text-secondary] text-[11px] lowercase">gold diff</span>
										<span className="text-[--text-primary] font-semibold text-right text-xs">
											{laningStats.goldDiff >= 0 ? "+" : ""}
											{laningStats.goldDiff}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-[--text-secondary] text-[11px] lowercase">xp diff</span>
										<span className="text-[--text-primary] font-semibold text-right text-xs">
											{laningStats.xpDiff >= 0 ? "+" : ""}
											{laningStats.xpDiff}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-[--text-secondary] text-[11px] lowercase">first lvl 2</span>
										<span className="text-[--text-primary] font-semibold text-right text-xs">
											{laningStats.firstLevel2 ? "Yes" : "No"}
										</span>
									</div>
								</div>
							</div>
						)}

						{/* Wards */}
						<div className="border border-[--card-border] rounded p-3 bg-[--card-bg]">
							<h3 className="text-[10px] font-semibold mb-2.5 text-[--text-primary] uppercase flex items-center gap-1.5">
								<FaCrown className="text-yellow-500 w-3.5 h-3.5" />
								WARDS
							</h3>
							<div className="space-y-1.5 text-xs">
								<div className="flex items-center justify-between">
									<span className="text-[--text-secondary] text-[11px] lowercase">placed</span>
									<span className="text-[--text-primary] font-semibold text-right text-xs">
										{selectedPlayer100.wardsPlaced || 0}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-[--text-secondary] text-[11px] lowercase">killed</span>
									<span className="text-[--text-primary] font-semibold text-right text-xs">
										{selectedPlayer100.wardsKilled || 0}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-[--text-secondary] text-[11px] lowercase">control</span>
									<span className="text-[--text-primary] font-semibold text-right text-xs">
										{selectedPlayer100.visionWardsBoughtInGame || 0}
									</span>
								</div>
							</div>
						</div>

						{/* Global Stats */}
						{globalStats && (
							<div className="border border-[--card-border] rounded p-3 bg-[--card-bg]">
								<h3 className="text-[10px] font-semibold mb-2.5 text-[--text-primary] uppercase flex items-center gap-1.5">
									<FaShieldAlt className="text-blue-400 w-3.5 h-3.5" />
									GLOBAL STATS
								</h3>
								<div className="space-y-1.5 text-xs">
									<div className="flex items-center justify-between">
										<span className="text-[--text-secondary] text-[11px] lowercase">CS/m</span>
										<span className="text-[--text-primary] font-semibold text-right text-xs">{globalStats.csPerMin}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-[--text-secondary] text-[11px] lowercase">VS/m</span>
										<span className="text-[--text-primary] font-semibold text-right text-xs">{globalStats.vsPerMin}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-[--text-secondary] text-[11px] lowercase">DMG/m</span>
										<span className="text-[--text-primary] font-semibold text-right text-xs">{globalStats.dmgPerMin}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-[--text-secondary] text-[11px] lowercase">Gold/m</span>
										<span className="text-[--text-primary] font-semibold text-right text-xs">{globalStats.goldPerMin}</span>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Build Order */}
					{buildOrder.length > 0 && (
						<div className="mb-6">
							<h3 className="text-sm font-semibold mb-3 text-[--text-primary]">
								BUILD ORDER
							</h3>
							<div className="flex flex-wrap items-end gap-2">
								{(() => {
									// Group items by purchase time
									const grouped = buildOrder.reduce((acc, purchase) => {
										const timeKey = purchase.time === 0 ? 'starter' : purchase.time;
										if (!acc[timeKey]) {
											acc[timeKey] = [];
										}
										acc[timeKey].push(purchase);
										return acc;
									}, {});

									// Get sorted time groups
									const timeGroups = Object.keys(grouped).sort((a, b) => {
										if (a === 'starter') return -1;
										if (b === 'starter') return 1;
										return parseInt(a) - parseInt(b);
									});

									let itemIndex = 0;
									return timeGroups.map((timeKey, groupIdx) => {
										const items = grouped[timeKey];
										const isStarter = timeKey === 'starter';
										const timeLabel = isStarter ? 'Starter' : `${timeKey}m`;
										
										return (
											<div key={timeKey} className="flex items-center gap-2">
												{/* Group of items at the same time */}
												<div className="flex flex-col items-center gap-1">
													<div className="flex items-center gap-1">
														{items.map((purchase) => (
															<div key={itemIndex++} className="relative w-12 h-12 rounded-md border border-[--card-border] bg-[--card-bg] overflow-hidden">
																<Image
																	src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/item/${purchase.itemId}.png`}
																	alt={`Item ${purchase.itemId}`}
																	fill
																	className="object-cover"
																/>
															</div>
														))}
													</div>
													<span className="text-[10px] text-[--text-secondary] font-medium">
														{timeLabel}
													</span>
												</div>
												{/* Arrow only between different time groups */}
												{groupIdx < timeGroups.length - 1 && (
													<span className="text-[--text-secondary] text-sm">{'>'}</span>
												)}
											</div>
										);
									});
								})()}
							</div>
						</div>
					)}

					{/* Skill Order */}
					<div className="mb-6">
						<h3 className="text-sm font-semibold mb-3 text-[--text-primary]">
							SKILL ORDER
						</h3>
						{!timeline ? (
							<div className="text-sm text-[--text-secondary]">
								Timeline data not available
							</div>
						) : skillOrder.length === 0 ? (
							<div className="text-sm text-[--text-secondary]">
								No skill order data available
							</div>
						) : (
							<div className="space-y-2.5">
								{["Q", "W", "E", "R"].map((skill, idx) => {
									const skillSlot = idx + 1;
									const abilityKey = `spell${skillSlot}`;
									const ability = championAbilities?.[abilityKey];
									
									// Get upgrades for this skill only, sorted by timestamp
									// The level field in SKILL_LEVEL_UP is the skill level (1-5 for Q/W/E, 1-3 for R)
									// We need to map upgrades to champion levels (1-18)
									// Since all upgrades happen sequentially (one per champion level), we can track the global order
									const allUpgradesSorted = [...skillOrder].sort((a, b) => a.timestamp - b.timestamp);
									const skillUpgradesMap = new Map();
									
									// Map each upgrade to its champion level based on global order
									allUpgradesSorted.forEach((upgrade, index) => {
										if (upgrade.skillSlot === skillSlot) {
											// Champion level is index + 1 (first upgrade at level 1, second at level 2, etc.)
											skillUpgradesMap.set(index + 1, upgrade);
										}
									});
									
									// Color mapping for each skill with inline styles for reliability
									const skillColorStyles = {
										1: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" }, // Q - blue
										2: { backgroundColor: "#f97316", borderColor: "#f97316" }, // W - orange
										3: { backgroundColor: "#a855f7", borderColor: "#a855f7" }, // E - purple
										4: { backgroundColor: "#ef4444", borderColor: "#ef4444" }, // R - red
									};
									
									const colorStyle = skillColorStyles[skillSlot] || {};
									
									return (
										<div key={skill} className="flex items-center gap-3">
											{/* Spell icon with letter */}
											<div className="flex flex-col items-center w-9 flex-shrink-0">
												{ability ? (
													<div className="relative w-7 h-7 rounded border border-[--card-border] overflow-hidden bg-[--card-bg]">
														<Image
															src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/${ability.image.group}/${ability.image.full}`}
															alt={ability.name}
															fill
															className="object-cover"
														/>
													</div>
												) : (
													<div className="w-7 h-7 bg-[--card-bg] rounded border border-[--card-border] flex items-center justify-center text-xs font-semibold">
														{skill}
													</div>
												)}
												<span className="text-[10px] font-semibold mt-0.5 text-[--text-primary] leading-tight">
													{skill}
												</span>
											</div>
											{/* Skill squares showing all 18 levels - span full width */}
											<div className="flex gap-0.5 flex-1 items-center justify-between">
												{Array.from({ length: 18 }, (_, i) => {
													const level = i + 1;
													const upgrade = skillUpgradesMap.get(level);
													const isUpgraded = !!upgrade;
													
													return (
														<div
															key={level}
															className={`w-6 h-6 border rounded flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${
																isUpgraded ? "text-white" : "text-transparent border-[--card-border] bg-[--card-bg] opacity-20"
															}`}
															style={isUpgraded ? colorStyle : {}}
															title={isUpgraded ? `${skill} Level ${level} at ${Math.floor(upgrade.timestamp / 60000)}m` : `${skill} Level ${level} (not upgraded)`}
														>
															{isUpgraded && level}
														</div>
													);
												})}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Spell Casted and Pings - Side by Side */}
					<div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Spell Casted */}
						{spellCasts && (
							<div className="border border-[--card-border] rounded-lg p-3 bg-[--card-bg]">
								<h3 className="text-sm font-semibold mb-3 text-[--text-primary]">
									SPELL CASTED
								</h3>
								<div className="flex gap-4 items-start justify-center overflow-x-auto">
									{Object.entries(spellCasts).map(([spell, count]) => {
										const spellKey = spell === "Q" ? "spell1" : spell === "W" ? "spell2" : spell === "E" ? "spell3" : spell === "R" ? "spell4" : null;
										const ability = spellKey ? championAbilities?.[spellKey] : null;
										
										return (
											<div key={spell} className="flex flex-col items-center gap-1 flex-shrink-0">
												<div className="relative w-10 h-10 rounded border border-[--card-border] overflow-hidden bg-[--card-bg] flex-shrink-0">
													{spell === "D" || spell === "F" ? (
														<>
															<Image
																src={`/images/league/summonerSpells/${
																	spell === "D"
																		? selectedPlayer100.summoner1Id
																		: selectedPlayer100.summoner2Id
																}.png`}
																alt={spell}
																fill
																className="object-cover"
															/>
															{/* Letter overlay */}
															<div className="absolute bottom-0 left-0 bg-black/70 text-white text-[10px] font-bold px-1 rounded-tr">
																{spell}
															</div>
														</>
													) : ability ? (
														<>
															<Image
																src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/${ability.image.group}/${ability.image.full}`}
																alt={ability.name}
																fill
																className="object-cover"
															/>
															{/* Letter overlay */}
															<div className="absolute bottom-0 left-0 bg-black/70 text-white text-[10px] font-bold px-1 rounded-tr">
																{spell}
															</div>
														</>
													) : (
														<div className="w-full h-full bg-[--card-bg] flex items-center justify-center text-xs font-semibold">
															{spell}
														</div>
													)}
												</div>
												<span className="text-[10px] text-[--text-primary] font-medium text-center leading-tight block w-full">
													<span className="block">{count}</span>
													<span className="block">times</span>
												</span>
											</div>
										);
									})}
								</div>
							</div>
						)}

						{/* Pings */}
						{selectedPlayer100 && (
							<div className="border border-[--card-border] rounded-lg p-3 bg-[--card-bg]">
								<h3 className="text-sm font-semibold mb-3 text-[--text-primary]">PINGS</h3>
								{mainPings.length > 0 ? (
									<div className="flex gap-4 items-start justify-center overflow-x-auto">
										{mainPings.map((ping) => (
											<div key={ping.key} className="flex flex-col items-center gap-1 flex-shrink-0">
												<div className="relative w-10 h-10 flex items-center justify-center overflow-hidden flex-shrink-0">
													<img
														src={ping.icon}
														alt={ping.name}
														className="w-full h-full object-contain"
														onError={(e) => {
															console.error(`Failed to load ping icon: ${ping.icon}`);
															e.currentTarget.style.display = "none";
														}}
													/>
												</div>
												<span className="text-[10px] text-[--text-primary] font-medium text-center leading-tight block w-full">
													{ping.count}
												</span>
											</div>
										))}
									</div>
								) : (
									<div className="text-sm text-[--text-secondary]">
										No ping data available
									</div>
								)}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}

