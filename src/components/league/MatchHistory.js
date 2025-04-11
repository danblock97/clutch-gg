import React, { useEffect, useState } from "react";
import Image from "next/image";
import Tag from "@/components/league/Tag";
import DonutGraph from "@/components/league/DonutGraph";
import MatchDetails from "@/components/league/MatchDetails";
import {
	FaSkullCrossbones,
	FaBolt,
	FaShieldAlt,
	FaFire,
	FaStar,
	FaClock,
	FaTrophy,
	FaMedal,
	FaChevronDown,
	FaChevronUp,
	FaAngleRight,
	FaCalendarAlt,
} from "react-icons/fa";

function useBreakpoint() {
	const [breakpoint, setBreakpoint] = useState("mobile");

	useEffect(() => {
		function handleResize() {
			const width = window.innerWidth;
			if (width < 768) {
				setBreakpoint("mobile");
			} else if (width < 1024) {
				setBreakpoint("md");
			} else {
				setBreakpoint("lg");
			}
		}

		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return breakpoint;
}

const calculateClutchScore = (match, currentPlayer) => {
	const kda =
		(currentPlayer.kills + currentPlayer.assists) /
		Math.max(1, currentPlayer.deaths);
	const kdaScore = Math.min(20, (kda / 5) * 20);

	const teamPlayers = match.info.participants.filter(
		(p) => p.teamId === currentPlayer.teamId
	);
	const teamKills = teamPlayers.reduce((sum, p) => sum + p.kills, 0);
	const killParticipation =
		teamKills > 0
			? (currentPlayer.kills + currentPlayer.assists) / teamKills
			: 0;
	const kpScore = Math.min(20, killParticipation * 20);

	const visionScore = currentPlayer.visionScore || 0;
	const visionScoreNorm = Math.min(20, (visionScore / 40) * 20);

	const damage = currentPlayer.totalDamageDealtToChampions || 0;
	const damageScore = Math.min(20, (damage / 20000) * 20);

	const turretDamage = currentPlayer.damageDealtToTurrets || 0;
	const turretScore = Math.min(20, (turretDamage / 3000) * 20);

	return Math.round(
		kdaScore + kpScore + visionScoreNorm + damageScore + turretScore
	);
};

const fetchArenaAugments = async () => {
	const response = await fetch(
		"https://raw.communitydragon.org/latest/cdragon/arena/en_us.json"
	);
	const { augments } = await response.json();
	return augments;
};

const getQueueName = (queueId) => {
	switch (queueId) {
		case 420:
			return "Ranked Solo/Duo";
		case 430:
			return "Normal (Blind)";
		case 400:
			return "Normal (Draft)";
		case 440:
			return "Ranked Flex";
		case 450:
			return "ARAM";
		case 490:
			return "Normal (Quickplay)";
		case 720:
			return "ARAM (Clash)";
		case 830:
			return "Co-op vs. AI Intro";
		case 840:
			return "Co-op vs. AI Beginner";
		case 850:
			return "Co-op vs. AI Intermediate";
		case 900:
			return "ARURF";
		case 1700:
		case 1710:
			return "Arena";
		default:
			return "Unknown Queue";
	}
};

const lanes = [
	{
		id: "TOP",
		icon: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-top.svg",
	},
	{
		id: "JUNGLE",
		icon: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-jungle.svg",
	},
	{
		id: "MID",
		icon: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-middle.svg",
	},
	{
		id: "BOTTOM",
		icon: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-bottom.svg",
	},
	{
		id: "SUPPORT",
		icon: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-utility.svg",
	},
];

const queues = [
	{ id: 420, name: "Ranked Solo/Duo" },
	{ id: 440, name: "Ranked Flex" },
	{ id: 450, name: "ARAM" },
	{ id: 490, name: "Normal (Quickplay)" },
	{ id: 400, name: "Normal (Draft)" },
	{ id: 900, name: "ARURF" },
	{ id: 1700, name: "Arena" },
	{ id: 1710, name: "Arena" },
];

const getPerformanceTags = (match, currentPlayer) => {
	const tags = [];
	const winningTeam = match.info.participants.filter((p) => p.win);
	const losingTeam = match.info.participants.filter((p) => !p.win);
	const currentTeam = currentPlayer.win ? winningTeam : losingTeam;

	const playerKDA =
		(currentPlayer.kills + currentPlayer.assists) /
		Math.max(1, currentPlayer.deaths);
	const damageScore = currentPlayer.totalDamageDealtToChampions;
	const visionScore = currentPlayer.visionScore || 0;
	const killParticipation =
		currentTeam.reduce((sum, p) => sum + p.kills, 0) > 0
			? (currentPlayer.kills + currentPlayer.assists) /
			  currentTeam.reduce((sum, p) => sum + p.kills, 0)
			: 0;

	const teamAvgKDA =
		currentTeam.reduce(
			(sum, p) => sum + (p.kills + p.assists) / Math.max(1, p.deaths),
			0
		) / currentTeam.length;
	const teamAvgDamage =
		currentTeam.reduce((sum, p) => sum + p.totalDamageDealtToChampions, 0) /
		currentTeam.length;
	const teamAvgVision =
		currentTeam.reduce((sum, p) => sum + (p.visionScore || 0), 0) /
		currentTeam.length;

	const mvpScore =
		(playerKDA / teamAvgKDA) * 0.35 +
		(damageScore / teamAvgDamage) * 0.25 +
		(visionScore / Math.max(1, teamAvgVision)) * 0.15 +
		killParticipation * 0.25;

	const teamMVPScores = currentTeam.map((p) => {
		const pKDA = (p.kills + p.assists) / Math.max(1, p.deaths);
		const pDamage = p.totalDamageDealtToChampions;
		const pVision = p.visionScore || 0;
		const pKP =
			currentTeam.reduce((sum, teammate) => sum + teammate.kills, 0) > 0
				? (p.kills + p.assists) /
				  currentTeam.reduce((sum, teammate) => sum + teammate.kills, 0)
				: 0;
		return {
			puuid: p.puuid,
			score:
				(pKDA / teamAvgKDA) * 0.35 +
				(pDamage / teamAvgDamage) * 0.25 +
				(pVision / Math.max(1, teamAvgVision)) * 0.15 +
				pKP * 0.25,
		};
	});

	teamMVPScores.sort((a, b) => b.score - a.score);

	if (
		currentPlayer.win &&
		teamMVPScores[0]?.puuid === currentPlayer.puuid &&
		mvpScore > 1.2
	) {
		tags.push(
			<Tag
				key="mvp"
				text="MVP"
				hoverText="Outstanding KDA, damage, vision and KP!"
				color="bg-yellow-500 text-white"
				icon={<FaTrophy />}
			/>
		);
	}

	if (
		!currentPlayer.win &&
		teamMVPScores[0]?.puuid === currentPlayer.puuid &&
		mvpScore > 1.3
	) {
		tags.push(
			<Tag
				key="ace"
				text="Team Ace"
				hoverText="Best performer on your team despite the loss!"
				color="bg-purple-500 text-white"
				icon={<FaStar />}
			/>
		);
	}

	return tags;
};

const getAdditionalTags = (match, currentPlayer) => {
	const tags = [];
	tags.push(...getPerformanceTags(match, currentPlayer));

	if (match.info.gameDuration < 1200 && currentPlayer.win) {
		tags.push(
			<Tag
				key="fast-win"
				text="Fast Win"
				hoverText="You won in less than 20 minutes!"
				color="bg-green-500 text-white"
				icon={<FaClock />}
			/>
		);
	}

	if (currentPlayer.kills >= 10) {
		tags.push(
			<Tag
				key="killing-spree"
				text="Killing Spree"
				hoverText={`You got ${currentPlayer.kills} kills!`}
				color="bg-red-500 text-white"
				icon={<FaSkullCrossbones />}
			/>
		);
	}

	const highestObjectiveDamage = match.info.participants.reduce(
		(max, participant) =>
			participant.damageDealtToObjectives > max
				? participant.damageDealtToObjectives
				: max,
		0
	);
	if (currentPlayer.damageDealtToObjectives === highestObjectiveDamage) {
		tags.push(
			<Tag
				key="objective-master"
				text="Objective Master"
				hoverText="You dealt the most damage to objectives!"
				color="bg-blue-500 text-white"
				icon={<FaMedal />}
			/>
		);
	}

	const highestGold = match.info.participants.reduce(
		(max, participant) =>
			participant.goldEarned > max ? participant.goldEarned : max,
		0
	);
	if (currentPlayer.goldEarned === highestGold) {
		tags.push(
			<Tag
				key="gold-leader"
				text="Gold Leader"
				hoverText="You earned the most gold in the game!"
				color="bg-yellow-400 text-black"
				icon={<FaStar />}
			/>
		);
	}

	return tags;
};

// Updated getGradientBackground with consistent styling using CSS variables
const getGradientBackground = (match, currentPlayer, isRemake, isMVP) => {
	if (match.info.queueId === 1700 || match.info.queueId === 1710) {
		// Mapping for arena placements to gradient classes
		const placementGradientClasses = {
			1: "bg-gradient-to-r from-[--card-bg] via-yellow-500/20 to-[--card-bg] border border-[--card-border]",
			2: "bg-gradient-to-r from-[--card-bg] via-pink-500/20 to-[--card-bg] border border-[--card-border]",
			3: "bg-gradient-to-r from-[--card-bg] via-orange-500/20 to-[--card-bg] border border-[--card-border]",
			4: "bg-gradient-to-r from-[--card-bg] via-blue-500/20 to-[--card-bg] border border-[--card-border]",
			5: "bg-gradient-to-r from-[--card-bg] via-red-500/20 to-[--card-bg] border border-[--card-border]",
			6: "bg-gradient-to-r from-[--card-bg] via-green-500/20 to-[--card-bg] border border-[--card-border]",
			7: "bg-gradient-to-r from-[--card-bg] via-purple-500/20 to-[--card-bg] border border-[--card-border]",
			8: "bg-gradient-to-r from-[--card-bg] via-indigo-500/20 to-[--card-bg] border border-[--card-border]",
		};
		// Sort participants based on missions.playerScore0
		let sortedParticipants = [...match.info.participants].map((p) => ({
			...p,
			playerScore0: p.missions?.playerScore0 || 0,
		}));
		sortedParticipants.sort((a, b) => a.playerScore0 - b.playerScore0);
		const currentIndex = sortedParticipants.findIndex(
			(p) => p.puuid === currentPlayer.puuid
		);
		const placement = Math.floor(currentIndex / 2) + 1;
		return (
			placementGradientClasses[placement] ||
			"bg-gradient-to-r from-[--card-bg] via-white/20 to-[--card-bg] border border-[--card-border]"
		);
	}
	if (isMVP)
		return "bg-gradient-to-r from-[--card-bg] via-yellow-600/20 to-[--card-bg] border border-[--card-border]";
	if (isRemake)
		return "bg-gradient-to-r from-[--card-bg] via-yellow-600/20 to-[--card-bg] border border-[--card-border]";
	return currentPlayer.win
		? "bg-gradient-to-r from-[--card-bg] via-green-900/20 to-[--card-bg] border border-[--card-border]"
		: "bg-gradient-to-r from-[--card-bg] via-red-900/20 to-[--card-bg] border border-[--card-border]";
};

const normaliseTeamPosition = (position) => {
	if (!position) return "";
	switch (position.toUpperCase()) {
		case "TOP":
			return "TOP";
		case "JUNGLE":
			return "JUNGLE";
		case "MIDDLE":
		case "MID":
			return "MID";
		case "BOTTOM":
		case "ADC":
			return "BOTTOM";
		case "UTILITY":
		case "SUPPORT":
			return "SUPPORT";
		default:
			return position.toUpperCase();
	}
};

const MatchHistory = ({
	matchDetails,
	selectedSummonerPUUID,
	gameName,
	tagLine,
	region,
	selectedChampionId,
}) => {
	const [augments, setAugments] = useState([]);
	const [expandedMatchId, setExpandedMatchId] = useState(null);
	const [selectedLane, setSelectedLane] = useState(null);
	const [selectedQueue, setSelectedQueue] = useState(null);

	const [currentPage, setCurrentPage] = useState(1);
	const matchesPerPage = 10;

	const breakpoint = useBreakpoint();
	let maxTagsToShow = breakpoint === "mobile" ? 1 : breakpoint === "md" ? 2 : 3;

	useEffect(() => {
		const getAugments = async () => {
			const data = await fetchArenaAugments();
			setAugments(data);
		};
		getAugments();
	}, []);

	useEffect(() => {
		setCurrentPage(1);
	}, [selectedLane, selectedQueue]);

	const getAugmentIcon = (id) => {
		const augment = augments.find((aug) => aug.id === id);
		return augment && augment.iconSmall
			? `https://raw.communitydragon.org/latest/game/${augment.iconSmall}`
			: "/images/placeholder.png";
	};

	if (!matchDetails || matchDetails.length === 0) {
		return (
			<div className="bg-gray-800 text-gray-400 p-4 rounded-lg shadow-lg">
				No match history available
			</div>
		);
	}

	const filteredMatches = matchDetails.filter((match) => {
		if (!match || !match.info || !match.info.participants) return false;
		const participants = match.info.participants;
		const currentPlayer = participants.find(
			(participant) => participant.puuid === selectedSummonerPUUID
		);
		if (!currentPlayer) return false;
		if (
			selectedChampionId &&
			currentPlayer.championId !== Number(selectedChampionId)
		) {
			return false;
		}
		const playerLane = normaliseTeamPosition(currentPlayer.teamPosition);
		if (selectedLane && playerLane !== selectedLane) {
			return false;
		}
		if (selectedQueue && match.info.queueId !== selectedQueue) {
			return false;
		}
		return true;
	});

	const totalMatches = filteredMatches.length;
	const totalPages = Math.ceil(totalMatches / matchesPerPage);
	const indexOfLastMatch = currentPage * matchesPerPage;
	const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
	const currentMatches = filteredMatches.slice(
		indexOfFirstMatch,
		indexOfLastMatch
	);

	const matchesByDay = currentMatches.reduce((acc, match) => {
		const matchDate = new Date(match.info.gameCreation);
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

	const handleLaneSelect = (lane) => {
		setSelectedLane(lane === selectedLane ? null : lane);
	};

	const handleQueueSelect = (e) => {
		setSelectedQueue(Number(e.target.value));
	};

	const handlePageChange = (pageNumber) => {
		if (pageNumber < 1 || pageNumber > totalPages) return;
		setCurrentPage(pageNumber);
	};

	const getOutcomeClass = (win, isRemake, isMVP) => {
		if (isMVP) return "text-yellow-500 border-yellow-500";
		if (isRemake) return "text-yellow-400 border-yellow-400";
		return win
			? "text-green-400 border-green-400"
			: "text-red-400 border-red-400";
	};

	const truncateName = (name, maxLength) => {
		return name.length > maxLength
			? name.substring(0, maxLength) + "..."
			: name;
	};

	return (
		<div className="text-gray-400 w-full max-w-screen-xl mx-auto">
			{/* Filters */}
			<div className="flex flex-col md:flex-row justify-between items-center mt-2 space-y-4 md:space-y-0 bg-[--card-bg] rounded-lg p-3 shadow-md mb-4">
				{/* Lane Filter */}
				<div className="flex items-center space-x-2">
					{lanes.map((lane) => (
						<button
							key={lane.id}
							onClick={() => handleLaneSelect(lane.id)}
							className={`p-2 rounded-lg transition-colors duration-200 ${
								selectedLane === lane.id
									? "bg-blue-600 text-white"
									: "bg-[--card-bg-secondary] hover:bg-blue-600/30 text-gray-300"
							}`}
							title={lane.id}
						>
							<Image src={lane.icon} alt={lane.id} width={22} height={22} />
						</button>
					))}
				</div>
				<div className="flex items-center space-x-2">
					<select
						id="queue-filter"
						className="p-2 bg-[--card-bg-secondary] text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
						value={selectedQueue || ""}
						onChange={handleQueueSelect}
					>
						<option value="">All Queues</option>
						{queues.map((queue) => (
							<option key={queue.id} value={queue.id}>
								{queue.name}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="mt-2">
				{Object.entries(matchesByDay).map(([day, matches]) => (
					<div key={day} className="mb-6">
						<h2 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
							<FaCalendarAlt className="mr-2 text-gray-500" />
							{day}
						</h2>
						{matches.map((match, index) => {
							const participants = match.info.participants;
							let maxCsPerMin = 0;
							let maxCsPerMinParticipant = null;
							participants.forEach((participant) => {
								const csPerMin =
									(participant.totalMinionsKilled +
										participant.neutralMinionsKilled) /
									(match.info.gameDuration / 60);
								participant.csPerMin = csPerMin;
								if (csPerMin > maxCsPerMin) {
									maxCsPerMin = csPerMin;
									maxCsPerMinParticipant = participant.puuid;
								}
							});
							const currentPlayer = participants.find(
								(p) => p.puuid === selectedSummonerPUUID
							);
							const tags = [...getAdditionalTags(match, currentPlayer)];

							if (currentPlayer.firstBloodKill) {
								tags.push(
									<Tag
										key="first-blood"
										text="First Blood"
										hoverText="Congrats on First Blood!"
										color="bg-green-500 text-white"
										icon={<FaSkullCrossbones />}
									/>
								);
							}
							if (currentPlayer.tripleKills > 0) {
								tags.push(
									<Tag
										key="triple-kill"
										text="Triple Kill"
										hoverText={`You got ${currentPlayer.tripleKills} Triple Kills!`}
										color="bg-yellow-500 text-white"
										icon={<FaBolt />}
									/>
								);
							}
							if (currentPlayer.deaths === 0) {
								tags.push(
									<Tag
										key="unkillable"
										text="Unkillable"
										hoverText={`A Whole 0 Deaths! Grats on not inting!`}
										color="bg-yellow-500 text-white"
										icon={<FaShieldAlt />}
									/>
								);
							}

							const damageThreshold =
								match.info.queueId === 450 || match.info.queueId === 1710
									? 1700
									: 900;
							if (match.info.gameMode !== "URF") {
								if (
									currentPlayer.challenges.damagePerMinute > damageThreshold
								) {
									tags.push(
										<Tag
											key="good-damage"
											text="Good Damage"
											hoverText={`Nice Damage Dealt: ${currentPlayer.totalDamageDealtToChampions.toLocaleString()}`}
											color="bg-yellow-500 text-white"
											icon={<FaFire />}
										/>
									);
								}
								if (currentPlayer.puuid === maxCsPerMinParticipant) {
									tags.push(
										<Tag
											key="cs-star"
											text="CS Star"
											hoverText={`Most CS/min in the game: ${currentPlayer.csPerMin.toFixed(
												1
											)}`}
											color="bg-blue-500 text-white"
											icon={<FaStar />}
										/>
									);
								}
							}

							const items = Array.from(
								{ length: 7 },
								(_, i) => currentPlayer[`item${i}`]
							);
							const gameCreation = new Date(match.info.gameCreation);
							const now = new Date();
							const timeDifference = Math.abs(now - gameCreation);
							const daysDifference = Math.floor(
								timeDifference / (1000 * 60 * 60 * 24)
							);
							const hoursDifference = Math.floor(
								timeDifference / (1000 * 60 * 60)
							);
							const minutesDifference = Math.floor(
								timeDifference / (1000 * 60)
							);
							const timeAgo =
								daysDifference > 0
									? `${daysDifference} days ago`
									: hoursDifference > 0
									? `${hoursDifference} hours ago`
									: `${minutesDifference} minutes ago`;

							const kda = (
								(currentPlayer.kills + currentPlayer.assists) /
								Math.max(1, currentPlayer.deaths)
							).toFixed(1);

							const csPerMinCalc = (
								currentPlayer.totalMinionsKilled /
								(match.info.gameDuration / 60)
							).toFixed(1);

							const cs =
								currentPlayer.neutralMinionsKilled +
								currentPlayer.totalMinionsKilled;
							const dpm = (
								currentPlayer.totalDamageDealtToChampions /
								(match.info.gameDuration / 60)
							).toFixed(1);

							const goldEarned = currentPlayer.goldEarned.toLocaleString();

							const winningTeam = match.info.participants.filter((p) => p.win);
							const losingTeam = match.info.participants.filter((p) => !p.win);

							const isRemake = match.info.gameDuration < 300;
							const isMVP = tags.some((tag) => tag.key === "mvp");

							const augmentsSelected = [
								currentPlayer.playerAugment1,
								currentPlayer.playerAugment2,
								currentPlayer.playerAugment3,
								currentPlayer.playerAugment4,
							];

							return (
								<div key={index} className="overflow-x-auto">
									<div
										onClick={
											breakpoint !== "mobile"
												? () =>
														setExpandedMatchId(
															expandedMatchId === match.metadata.matchId
																? null
																: match.metadata.matchId
														)
												: undefined
										}
										className={`rounded-md shadow-md mb-2 min-w-[768px] ${
											breakpoint !== "mobile" ? "cursor-pointer" : ""
										} ${getGradientBackground(
											match,
											currentPlayer,
											isRemake,
											isMVP
										)}`}
									>
										<div className="flex p-0 relative overflow-hidden">
											{/* Win/Loss Indicator */}
											<div
												className={`w-1 h-full absolute left-0 top-0 ${
													match.info.queueId === 1700 ||
													match.info.queueId === 1710
														? "bg-blue-500" // Arena
														: isRemake
														? "bg-yellow-500" // Remake
														: currentPlayer.win
														? "bg-blue-500" // Win
														: "bg-red-500" // Loss
												}`}
											/>

											{/* Champion & Spells */}
											<div className="py-3 px-3 flex items-center w-24">
												<div className="flex flex-col items-center">
													<div
														className={`relative w-14 h-14 rounded-full overflow-hidden border-2 ${
															match.info.queueId === 1700 ||
															match.info.queueId === 1710
																? "" // Arena
																: isRemake
																? "border-yellow-500" // Remake
																: currentPlayer.win
																? "border-blue-500" // Win
																: "border-red-500" // Loss
														}`}
													>
														<Image
															src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${currentPlayer.championId}.png`}
															alt="Champion Icon"
															width={56}
															height={56}
															className="object-cover"
														/>
														<div className="absolute bottom-0 right-0 bg-black/60 text-xs px-1 text-white rounded-tl-md">
															{currentPlayer.champLevel}
														</div>
													</div>
													<div className="mt-1 flex flex-col space-y-1">
														{[
															currentPlayer.summoner1Id,
															currentPlayer.summoner2Id,
														].map((spellId, idx) => (
															<div
																key={idx}
																className="w-6 h-6 rounded bg-[--card-bg-secondary] overflow-hidden"
															>
																<Image
																	src={`/images/league/summonerSpells/${spellId}.png`}
																	alt={`Spell ${spellId}`}
																	width={24}
																	height={24}
																	className="w-full h-full"
																/>
															</div>
														))}
													</div>
												</div>
											</div>

											{/* Game Info */}
											<div className="py-3 px-1 flex flex-col justify-between w-32">
												<div>
													{(() => {
														let outcomeText = "";
														let outcomeColorClass = "";

														if (
															match.info.queueId === 1700 ||
															match.info.queueId === 1710
														) {
															// Arena logic
															let sortedParticipants = [
																...match.info.participants,
															].map((p) => ({
																...p,
																playerScore0: p.missions?.playerScore0 || 0,
															}));
															sortedParticipants.sort(
																(a, b) => a.playerScore0 - b.playerScore0
															);
															const currentIndex = sortedParticipants.findIndex(
																(p) => p.puuid === currentPlayer.puuid
															);
															const placement =
																Math.floor(currentIndex / 2) + 1;

															const getOrdinal = (n) => {
																const s = ["th", "st", "nd", "rd"];
																const v = n % 100;
																return n + (s[(v - 20) % 10] || s[v] || s[0]);
															};

															outcomeText = `${getOrdinal(placement)} Place`;

															const getPlacementColor = (plc) => {
																switch (plc) {
																	case 1:
																		return "text-yellow-500";
																	case 2:
																		return "text-pink-500";
																	case 3:
																		return "text-orange-500";
																	case 4:
																		return "text-blue-500";
																	default:
																		return "text-gray-400";
																}
															};

															outcomeColorClass = getPlacementColor(placement);
														} else {
															outcomeText = isRemake
																? "Remake"
																: currentPlayer.win
																? "Victory"
																: "Defeat";

															outcomeColorClass = isRemake
																? "text-yellow-500"
																: currentPlayer.win
																? "text-blue-500"
																: "text-red-500";
														}

														return (
															<p
																className={`font-semibold text-sm ${outcomeColorClass}`}
															>
																{outcomeText}
															</p>
														);
													})()}
													<p className="text-xs text-gray-500 mt-1">
														{getQueueName(match.info.queueId)}
													</p>
												</div>
												<div className="text-xs text-gray-500">{timeAgo}</div>
											</div>

											{/* KDA & Stats */}
											<div className="py-3 px-3 flex flex-col justify-between flex-grow">
												<div className="flex items-center justify-between">
													<div>
														<div className="flex items-center">
															<p className="font-medium text-base">
																{kda} <span className="text-gray-500">KDA</span>
															</p>
															{match.info.queueId !== 1700 &&
																match.info.queueId !== 1710 && (
																	<span className="text-xs ml-2 px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">
																		{killParticipation
																			? `${Math.round(
																					killParticipation * 100
																			  )}% P/Kill`
																			: ""}
																	</span>
																)}
														</div>
														<p className="text-sm mt-0.5">
															<span
																className={
																	currentPlayer.kills > 3 ? "text-red-400" : ""
																}
															>
																{currentPlayer.kills}
															</span>{" "}
															/
															<span
																className={
																	currentPlayer.deaths > 7 ? "text-red-400" : ""
																}
															>
																{currentPlayer.deaths}
															</span>{" "}
															/{currentPlayer.assists}
														</p>
													</div>

													<div className="flex flex-col items-end">
														<div className="flex items-center">
															<p className="text-sm">
																CS {cs}{" "}
																<span className="text-gray-500">
																	({csPerMinCalc})
																</span>
															</p>
														</div>
														<div className="text-sm mt-0.5">
															<span className="text-gray-500">LVL</span>{" "}
															{currentPlayer.champLevel}
														</div>
													</div>
												</div>

												{/* Tags */}
												{match.info.queueId !== 1700 &&
													match.info.queueId !== 1710 && (
														<div className="flex flex-wrap mt-2 gap-1.5">
															{tags.slice(0, maxTagsToShow).map((tag) => (
																<div key={tag.key} className="inline-block">
																	{tag}
																</div>
															))}
														</div>
													)}
											</div>

											{/* Items */}
											<div className="py-3 px-3 w-56 flex items-center justify-center">
												<div className="grid grid-cols-4 gap-1">
													{/* First row: 0-2 */}
													<div className="col-span-3 grid grid-cols-3 gap-1">
														{items.slice(0, 3).map((itemId, idx) => (
															<div
																key={idx}
																className="w-8 h-8 bg-[--card-bg-secondary] rounded overflow-hidden"
															>
																{itemId > 0 ? (
																	<Image
																		src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${itemId}.png`}
																		alt={`Item ${itemId}`}
																		width={32}
																		height={32}
																		className="w-full h-full"
																	/>
																) : null}
															</div>
														))}
													</div>

													{/* Trinket */}
													<div className="col-span-1">
														<div className="w-8 h-8 bg-[--card-bg-secondary] rounded overflow-hidden">
															{items[6] > 0 ? (
																<Image
																	src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${items[6]}.png`}
																	alt={`Trinket`}
																	width={32}
																	height={32}
																	className="w-full h-full"
																/>
															) : null}
														</div>
													</div>

													{/* Second row: 3-5 */}
													<div className="col-span-3 grid grid-cols-3 gap-1">
														{items.slice(3, 6).map((itemId, idx) => (
															<div
																key={idx}
																className="w-8 h-8 bg-[--card-bg-secondary] rounded overflow-hidden"
															>
																{itemId > 0 ? (
																	<Image
																		src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${itemId}.png`}
																		alt={`Item ${itemId}`}
																		width={32}
																		height={32}
																		className="w-full h-full"
																	/>
																) : null}
															</div>
														))}
													</div>

													{/* Empty cell for balance */}
													<div className="col-span-1"></div>
												</div>
											</div>

											{/* Players */}
											<div className="py-3 pr-3 pl-1 md:block hidden">
												<div className="flex text-xs">
													<div className="mr-1">
														<div className="grid grid-rows-5 gap-0.5">
															{match.info.participants
																.filter((p) => p.teamId === 100)
																.map((participant, idx) => (
																	<div
																		key={idx}
																		className="flex items-center h-4 overflow-hidden"
																	>
																		<div className="w-3 h-3 mr-1">
																			<Image
																				src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
																				alt="Champion"
																				width={12}
																				height={12}
																				className="rounded-full"
																			/>
																		</div>
																		<span
																			className={`truncate max-w-[50px] ${
																				participant.puuid ===
																				selectedSummonerPUUID
																					? "text-blue-400 font-medium"
																					: "text-gray-500"
																			}`}
																		>
																			{truncateName(
																				participant.riotIdGameName,
																				6
																			)}
																		</span>
																	</div>
																))}
														</div>
													</div>
													<div>
														<div className="grid grid-rows-5 gap-0.5">
															{match.info.participants
																.filter((p) => p.teamId === 200)
																.map((participant, idx) => (
																	<div
																		key={idx}
																		className="flex items-center h-4 overflow-hidden"
																	>
																		<div className="w-3 h-3 mr-1">
																			<Image
																				src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
																				alt="Champion"
																				width={12}
																				height={12}
																				className="rounded-full"
																			/>
																		</div>
																		<span
																			className={`truncate max-w-[50px] ${
																				participant.puuid ===
																				selectedSummonerPUUID
																					? "text-blue-400 font-medium"
																					: "text-gray-500"
																			}`}
																		>
																			{truncateName(
																				participant.riotIdGameName,
																				6
																			)}
																		</span>
																	</div>
																))}
														</div>
													</div>
												</div>
											</div>

											{/* Expand Arrow */}
											{breakpoint !== "mobile" && (
												<div className="py-3 px-3 flex items-center text-gray-400">
													{expandedMatchId === match.metadata.matchId ? (
														<FaChevronUp className="w-4 h-4" />
													) : (
														<FaChevronDown className="w-4 h-4" />
													)}
												</div>
											)}
										</div>

										{/* Arena Augments */}
										{(match.info.queueId === 1700 ||
											match.info.queueId === 1710) && (
											<div className="flex px-4 py-2 bg-[--card-bg-secondary]/30 border-t border-[--card-border]/30">
												<div className="grid grid-cols-4 gap-2">
													{augmentsSelected
														.filter(Boolean)
														.map((augmentId, idx) => (
															<div key={idx} className="flex items-center">
																<Image
																	src={getAugmentIcon(augmentId)}
																	alt={`Augment ${idx + 1}`}
																	className="w-8 h-8 rounded overflow-hidden border border-[--card-border]"
																	width={32}
																	height={32}
																/>
															</div>
														))}
												</div>
											</div>
										)}
									</div>

									{/* Expanded Match Details */}
									{expandedMatchId === match.metadata.matchId && (
										<div className="mb-4 animate-fadeIn">
											<MatchDetails
												matchDetails={matchDetails}
												matchId={match.metadata.matchId}
												selectedSummonerPUUID={selectedSummonerPUUID}
												region={region}
											/>
										</div>
									)}
								</div>
							);
						})}
					</div>
				))}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex justify-center items-center mt-6 space-x-1">
						<button
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className={`px-3 py-1 rounded ${
								currentPage === 1
									? "bg-[--card-bg-secondary] cursor-not-allowed text-gray-600"
									: "bg-[--card-bg-secondary] hover:bg-blue-600/30 text-gray-300"
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
										? "bg-blue-600 text-white"
										: "bg-[--card-bg-secondary] hover:bg-blue-600/30 text-gray-300"
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
									? "bg-[--card-bg-secondary] cursor-not-allowed text-gray-600"
									: "bg-[--card-bg-secondary] hover:bg-blue-600/30 text-gray-300"
							}`}
						>
							Next
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default MatchHistory;
