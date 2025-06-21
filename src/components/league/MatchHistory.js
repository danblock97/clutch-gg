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
		case 480:
			return "Swiftplay";
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
	{ id: 480, name: "Swiftplay" },
	{ id: 400, name: "Normal (Draft)" },
	{ id: 900, name: "ARURF" },
	{ id: 1700, name: "Arena" },
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

// Updated getGradientBackground to use predefined utility classes for a cleaner look
const getGradientBackground = (match, currentPlayer, isRemake, isMVP) => {
	// Keep colourful arena placement styling
	if (match.info.queueId === 1700 || match.info.queueId === 1710) {
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
		let sortedParticipants = [...match.info.participants].map((p) => ({
			...p,
			playerScore0: p.missions?.playerScore0 || 0,
		}));
		sortedParticipants.sort((a, b) => a.playerScore0 - b.playerScore0);
		const currentIndex = sortedParticipants.findIndex(
			(p) => p.puuid === currentPlayer.puuid
		);
		const placement = Math.floor(currentIndex / 2) + 1;
		return placementGradientClasses[placement] || "match-remake";
	}

	if (isRemake) return "match-remake";

	// Highlight MVP games subtly using the same win/loss background but with an outline
	if (isMVP) {
		return currentPlayer.win
			? "match-win border-yellow-400"
			: "match-loss border-yellow-400";
	}

	return currentPlayer.win ? "match-win" : "match-loss";
};

// Helper to normalize team position values
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
	}, [selectedLane, selectedQueue, selectedChampionId]);

	const getAugmentIcon = (id) => {
		const augment = augments.find((aug) => aug.id === id);
		return augment && augment.iconSmall
			? `https://raw.communitydragon.org/latest/game/${augment.iconSmall}`
			: "/images/placeholder.png";
	};

	// Helper function to calculate kill participation for a player
	const calculateKillParticipation = (player, team) => {
		const teamKills = team.reduce((sum, p) => sum + p.kills, 0);
		return teamKills > 0 ? (player.kills + player.assists) / teamKills : 0;
	};

	if (!matchDetails || matchDetails.length === 0) {
		return (
			<div className="bg-gray-800 text-gray-400 p-4 rounded-lg shadow-lg">
				No match history available
			</div>
		);
	}

	const filteredMatches = matchDetails
		.filter(
			(match) =>
				match &&
				match.info &&
				Array.isArray(match.info.participants) &&
				match.info.participants.length > 0 &&
				match.info.participants.some((p) => typeof p.championId === "number")
		)
		.filter((match) => {
			if (!selectedLane) return true;
			const currentPlayer = match.info.participants.find(
				(p) => p.puuid === selectedSummonerPUUID
			);

			return (
				currentPlayer &&
				currentPlayer.teamPosition &&
				normaliseTeamPosition(currentPlayer.teamPosition) === selectedLane
			);
		})
		.filter((match) => {
			if (selectedQueue === null) return true;
			return match.info.queueId === selectedQueue;
		})
		.filter((match) => {
			if (!selectedChampionId) return true;
			const currentPlayer = match.info.participants.find(
				(p) => p.puuid === selectedSummonerPUUID
			);
			return currentPlayer && currentPlayer.championId === selectedChampionId;
		});

	// Group matches by day
	const groupedMatches = filteredMatches.reduce((acc, match) => {
		const gameCreationRaw =
			match.info.gameCreation ?? match.info.game_datetime ?? 0;
		const gameDate = new Date(gameCreationRaw);
		const dateOptions = { year: "numeric", month: "long", day: "numeric" };
		const dateString = gameDate.toLocaleDateString(undefined, dateOptions);

		if (!acc[dateString]) {
			acc[dateString] = [];
		}
		acc[dateString].push(match);
		return acc;
	}, {});

	const totalPages = Math.ceil(
		Object.values(groupedMatches).flat().length / matchesPerPage
	);
	const startIndex = (currentPage - 1) * matchesPerPage;
	const endIndex = startIndex + matchesPerPage;

	// Get current page's matches from the grouped data
	const paginatedGroupedMatches = {};
	let matchesCount = 0;
	for (const day in groupedMatches) {
		if (groupedMatches.hasOwnProperty(day)) {
			const matchesForDay = groupedMatches[day];
			const matchesToAdd = [];
			for (const match of matchesForDay) {
				if (matchesCount >= startIndex && matchesCount < endIndex) {
					matchesToAdd.push(match);
				}
				matchesCount++;
			}
			if (matchesToAdd.length > 0) {
				paginatedGroupedMatches[day] = matchesToAdd;
			}
		}
	}

	const handleLaneSelect = (lane) => {
		setSelectedLane(lane === selectedLane ? null : lane);
	};

	const handleQueueSelect = (e) => {
		const value = e.target.value;
		setSelectedQueue(value === "" ? null : Number(value));
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
		<div className="text-gray-400 w-full max-w-screen-xl mx-auto px-4">
			{/* Filters */}
			<div className="flex flex-col md:flex-row justify-between items-center mt-2 space-y-4 md:space-y-0">
				{/* Lane Filter */}
				<div className="flex items-center space-x-2">
					{lanes.map((lane) => (
						<button
							key={lane.id}
							onClick={() => handleLaneSelect(lane.id)}
							className={`p-2 rounded-lg ${
								selectedLane === lane.id ? "bg-blue-500" : "bg-gray-800"
							} hover:bg-blue-600 transition-colors duration-200`}
							title={lane.id}
						>
							<Image src={lane.icon} alt={lane.id} width={24} height={24} />
						</button>
					))}
				</div>
				<div className="flex items-center space-x-2">
					<select
						id="queue-filter"
						className="p-2 bg-gray-800 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
						value={selectedQueue || ""}
						onChange={handleQueueSelect}
					>
						<option value="">All</option>
						{queues.map((queue) => (
							<option key={queue.id} value={queue.id}>
								{queue.name}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className="mt-2">
				{Object.entries(paginatedGroupedMatches).map(([day, matches]) => (
					<div key={day} className="mb-2">
						<h2 className="text-xl font-semibold text-gray-200 my-4">{day}</h2>
						{matches.map((match, index) => {
							const participants = match.info.participants;
							let maxCsPerMin = 0;
							let maxCsPerMinParticipant = null;
							participants.forEach((participant) => {
								const csPerMin =
									((participant.totalMinionsKilled ?? 0) +
										(participant.neutralMinionsKilled ?? 0)) /
									((match.info.gameDuration ?? 1) / 60);
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
							if ((currentPlayer.tripleKills ?? 0) > 0) {
								tags.push(
									<Tag
										key="triple-kill"
										text="Triple Kill"
										hoverText={`You got ${
											currentPlayer.tripleKills ?? 0
										} Triple Kills!`}
										color="bg-yellow-500 text-white"
										icon={<FaBolt />}
									/>
								);
							}
							if ((currentPlayer.deaths ?? 0) === 0) {
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
									(currentPlayer.challenges?.damagePerMinute ?? 0) >
									damageThreshold
								) {
									tags.push(
										<Tag
											key="good-damage"
											text="Good Damage"
											hoverText={`Nice Damage Dealt: ${(
												currentPlayer.totalDamageDealtToChampions ?? 0
											).toLocaleString()}`}
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
											hoverText={`Most CS/min in the game: ${(
												currentPlayer.csPerMin ?? 0
											).toFixed(1)}`}
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
							// Defensive date handling
							const gameCreationRaw =
								match.info.gameCreation ?? match.info.game_datetime ?? 0;
							const gameCreation = new Date(gameCreationRaw);
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
							const timeAgo = isNaN(gameCreation.getTime())
								? "Unknown"
								: daysDifference > 0
								? `${daysDifference}d ago`
								: hoursDifference > 0
								? `${hoursDifference}h ago`
								: `${minutesDifference}m ago`;

							const kda = (
								((currentPlayer.kills ?? 0) + (currentPlayer.assists ?? 0)) /
								Math.max(1, currentPlayer.deaths ?? 0)
							).toFixed(1);

							const csPerMinCalc = (
								(currentPlayer.totalMinionsKilled ?? 0) /
								((match.info.gameDuration ?? 1) / 60)
							).toFixed(1);

							const cs =
								(currentPlayer.neutralMinionsKilled ?? 0) +
								(currentPlayer.totalMinionsKilled ?? 0);
							const dpm = (
								(currentPlayer.totalDamageDealtToChampions ?? 0) /
								((match.info.gameDuration ?? 1) / 60)
							).toFixed(1);

							const goldEarned = (
								currentPlayer.goldEarned ?? 0
							).toLocaleString();

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
										className={`rounded-lg shadow-lg p-2 ${
											breakpoint !== "mobile" ? "cursor-pointer" : ""
										} relative flex items-center mb-2 min-w-[768px] text-xs sm:text-sm ${getGradientBackground(
											match,
											currentPlayer,
											isRemake,
											isMVP
										)}`}
									>
										<div className="flex items-start gap-4 w-full">
											{/* Summary column */}
											<div className="flex flex-col items-start w-28">
												<p
													className={`font-semibold text-xl ${getOutcomeClass(
														currentPlayer.win,
														isRemake,
														isMVP
													)}`}
												>
													{isRemake
														? "Remake"
														: currentPlayer.win
														? "Victory"
														: "Defeat"}
												</p>
												<span className="text-md text-gray-300">{timeAgo}</span>
												<span className="text-md text-gray-300">{`${Math.floor(
													match.info.gameDuration / 60
												)}:${String(match.info.gameDuration % 60).padStart(
													2,
													"0"
												)}`}</span>
											</div>

											{/* Champion + spells + stats + items */}
											<div className="flex flex-col gap-1">
												<div className="flex items-center gap-2">
													{/* Champion with role overlay */}
													<div
														className={`relative w-14 h-14 border-2 rounded-md ${getOutcomeClass(
															currentPlayer.win,
															isRemake,
															isMVP
														)}`}
													>
														<Image
															src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${currentPlayer.championId}.png`}
															alt="Champion Icon"
															fill
															className="object-cover"
														/>
														{currentPlayer.teamPosition && (
															<Image
																src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${currentPlayer.teamPosition.toLowerCase()}.svg`}
																alt="Role Icon"
																width={18}
																height={18}
																className="absolute -bottom-1 -right-1 bg-[--card-bg] rounded-sm p-0.5"
															/>
														)}
													</div>

													{/* Summoner spells */}
													<div className="flex flex-col gap-1">
														{[
															currentPlayer.summoner1Id,
															currentPlayer.summoner2Id,
														].map((spellId, idx) => (
															<Image
																key={idx}
																src={`/images/league/summonerSpells/${spellId}.png`}
																alt={`Spell ${idx + 1}`}
																width={24}
																height={24}
																className="rounded-md border border-gray-700"
															/>
														))}
													</div>

													{/* KDA stats */}
													<div className="flex flex-col">
														<p className="text-base font-semibold">
															{currentPlayer.kills}/{currentPlayer.deaths}/
															{currentPlayer.assists}
														</p>
														<p className="text-sm">{kda} KDA</p>
													</div>
												</div>

												{/* Items row */}
												<div className="flex items-center gap-1 pt-1">
													{items.slice(0, 6).map((itemId, idx) => (
														<Image
															key={idx}
															src={
																itemId > 0
																	? `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${itemId}.png`
																	: "/images/placeholder.png"
															}
															alt="Item"
															width={24}
															height={24}
															className="rounded-md border border-gray-700"
														/>
													))}
													{/* Ward */}
													<Image
														src={
															items[6] > 0
																? `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${items[6]}.png`
																: "/images/placeholder.png"
														}
														alt="Ward"
														width={24}
														height={24}
														className="rounded-md border border-gray-700"
													/>
												</div>
											</div>

											{/* Score box with label above */}
											<div className="flex flex-col items-center justify-center ml-6 self-center">
												<p className="text-md text-gray-300 mb-1">
													Clutch Score
												</p>
												<DonutGraph
													score={calculateClutchScore(match, currentPlayer)}
													result={currentPlayer.win ? "win" : "loss"}
													height={36}
													width={40}
												/>
											</div>

											{/* Participants scoreboard handled below in two-column layout */}
										</div>
										{/* Display tags for all match types EXCEPT Arena mode and remakes */}
										{match.info.queueId !== 1700 &&
											match.info.queueId !== 1710 &&
											!isRemake && (
												<div className="absolute bottom-1 left-2 flex items-center">
													{tags.length > 0 && tags[0]}
												</div>
											)}
										{match.info.queueId === 1700 ||
										match.info.queueId === 1710 ? (
											<div className="absolute top-6 right-16 flex">
												<div className="grid grid-cols-2 gap-2">
													{augmentsSelected
														.filter(Boolean)
														.map((augmentId, idx) => (
															<div key={idx} className="flex items-center">
																<Image
																	src={getAugmentIcon(augmentId)}
																	alt={`Augment ${idx + 1}`}
																	className="w-12 h-12 rounded-md border border-gray-700"
																	width={48}
																	height={48}
																/>
															</div>
														))}
												</div>
											</div>
										) : (
											<div className="flex ml-auto">
												<div className="flex flex-col items-start mr-4">
													{winningTeam.map((participant, idx) => (
														<div key={idx} className="flex items-center">
															<div
																className={`sm:w-5 sm:h-5 w-5 h-5 rounded-md border border-gray-700 mr-1 overflow-hidden`}
															>
																<Image
																	src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
																	alt="Participant Champion"
																	width={20}
																	height={20}
																	className="object-cover transform scale-110"
																/>
															</div>
															<p
																className="text-xs truncate"
																style={{ width: "90px" }}
															>
																<span
																	className={`${
																		participant.puuid === selectedSummonerPUUID
																			? "font-semibold text-gray-100"
																			: ""
																	}`}
																>
																	{truncateName(participant.riotIdGameName, 7)}
																</span>
															</p>
														</div>
													))}
												</div>
												<div className="flex flex-col items-start">
													{losingTeam.map((participant, idx) => (
														<div key={idx} className="flex items-center">
															<div
																className={`sm:w-5 sm:h-5 w-5 h-5 rounded-md border border-gray-700 mr-1 overflow-hidden`}
															>
																<Image
																	src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
																	alt="Participant Champion"
																	width={20}
																	height={20}
																	className="object-cover transform scale-110"
																/>
															</div>
															<p
																className="text-xs truncate"
																style={{ width: "90px" }}
															>
																<span
																	className={`${
																		participant.puuid === selectedSummonerPUUID
																			? "font-semibold text-gray-100"
																			: ""
																	}`}
																>
																	{truncateName(participant.riotIdGameName, 7)}
																</span>
															</p>
														</div>
													))}
												</div>
											</div>
										)}
										{/* Only show the expand/collapse arrow on non-mobile devices */}
										{breakpoint !== "mobile" && (
											<div className="absolute bottom-2 right-2">
												{expandedMatchId === match.metadata.matchId ? (
													<FaChevronUp className="text-gray-200" />
												) : (
													<FaChevronDown className="text-gray-200" />
												)}
											</div>
										)}
									</div>
									{expandedMatchId === match.metadata.matchId && (
										<div>
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
				{totalPages > 1 && (
					<div className="flex justify-center items-center mt-6 space-x-1 text-sm">
						<button
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className={`px-3 py-1 rounded ${
								currentPage === 1
									? "bg-gray-700 cursor-not-allowed text-gray-500"
									: "bg-gray-800 hover:bg-gray-700 text-gray-200"
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
										? "bg-gray-700 text-white"
										: "bg-gray-800 hover:bg-gray-700 text-gray-200"
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
									? "bg-gray-700 cursor-not-allowed text-gray-500"
									: "bg-gray-800 hover:bg-gray-700 text-gray-200"
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
