import React, { useEffect, useState } from "react";
import Image from "next/image";
import Tag from "@/components/Tag";
import MatchDetails from "@/components/MatchDetails";
import {
	FaSkullCrossbones,
	FaBolt,
	FaShieldAlt,
	FaFire,
	FaStar,
	FaClock,
	FaTrophy,
	FaMedal,
} from "react-icons/fa";

// 1) Inline hook for detecting current breakpoint
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

		// Check breakpoint on mount
		handleResize();

		// Listen for resize events
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return breakpoint;
}

// 2) Fetch Arena Augments
const fetchArenaAugments = async () => {
	const response = await fetch(
		"https://raw.communitydragon.org/latest/cdragon/arena/en_us.json"
	);
	const { augments } = await response.json();
	return augments;
};

// 3) Queue name helper
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
			return "Arena";
		default:
			return "Unknown Queue";
	}
};

// 4) Lane icons for filter
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

// 5) Queue options for dropdown filter
const queues = [
	{ id: 420, name: "Ranked Solo/Duo" },
	{ id: 440, name: "Ranked Flex" },
	{ id: 450, name: "ARAM" },
	{ id: 490, name: "Normal (Quickplay)" },
	{ id: 400, name: "Normal (Draft)" },
	{ id: 1700, name: "Arena" },
];

// 6) Additional tags logic
const getAdditionalTags = (match, currentPlayer) => {
	const tags = [];

	// Fast Win
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

	// MVP (Highest KDA)
	const highestKDA = match.info.participants.reduce((max, participant) => {
		const kda =
			(participant.kills + participant.assists) /
			Math.max(1, participant.deaths);
		return kda > max ? kda : max;
	}, 0);

	const playerKDA =
		(currentPlayer.kills + currentPlayer.assists) /
		Math.max(1, currentPlayer.deaths);

	if (playerKDA === highestKDA) {
		tags.push(
			<Tag
				key="mvp"
				text="MVP"
				hoverText="You had the highest KDA in the game!"
				color="bg-yellow-500 text-white"
				icon={<FaTrophy />}
			/>
		);
	}

	// Killing Spree (>=10 kills)
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

	// Objective Master (most damage to objectives)
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

	// Gold Leader
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

// 7) Main component
const MatchHistory = ({
	matchDetails,
	selectedSummonerPUUID,
	gameName,
	tagLine,
	region,
}) => {
	const [augments, setAugments] = useState([]);
	const [expandedMatchId, setExpandedMatchId] = useState(null); // State for expanded match
	const [selectedLane, setSelectedLane] = useState(null); // Lane filter state
	const [selectedQueue, setSelectedQueue] = useState(null); // Queue filter state

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const matchesPerPage = 10;

	// 8) Use our custom breakpoint hook
	const breakpoint = useBreakpoint();

	// Decide how many tags to show based on current breakpoint
	let maxTagsToShow = 3; // default for large screens
	if (breakpoint === "mobile") {
		maxTagsToShow = 1;
	} else if (breakpoint === "md") {
		maxTagsToShow = 2;
	}
	// for "lg", we'll keep it at 3 (or you could do tags.length if you want *all* on large)

	useEffect(() => {
		const getAugments = async () => {
			const data = await fetchArenaAugments();
			setAugments(data);
		};
		getAugments();
	}, []);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedLane, selectedQueue]);

	const getAugmentIcon = (id) => {
		const augment = augments.find((aug) => aug.id === id);
		return augment && augment.iconSmall
			? `https://raw.communitydragon.org/latest/game/${augment.iconSmall}`
			: "/images/placeholder.png";
	};

	const normalizeTeamPosition = (position) => {
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

	if (!matchDetails || matchDetails.length === 0) {
		return (
			<div className="bg-gray-800 text-gray-400 p-4 rounded-lg shadow-lg">
				No match history available
			</div>
		);
	}

	// Filter matches by Lane / Queue
	const filteredMatches = matchDetails.filter((match) => {
		const participants = match.info && match.info.participants;
		if (!participants) return false;

		const currentPlayer = participants.find(
			(participant) => participant.puuid === selectedSummonerPUUID
		);
		if (!currentPlayer) return false;

		const playerLane = normalizeTeamPosition(currentPlayer.teamPosition);
		if (selectedLane && playerLane !== selectedLane) {
			return false;
		}
		if (selectedQueue && match.info.queueId !== selectedQueue) {
			return false;
		}
		return true;
	});

	// Pagination logic
	const totalMatches = filteredMatches.length;
	const totalPages = Math.ceil(totalMatches / matchesPerPage);
	const indexOfLastMatch = currentPage * matchesPerPage;
	const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
	const currentMatches = filteredMatches.slice(
		indexOfFirstMatch,
		indexOfLastMatch
	);

	// Group matches by day
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

	// Used for color-based outcomes
	const getOutcomeClass = (win, isRemake, isMVP) => {
		if (isMVP) {
			return "text-yellow-500 border-yellow-500";
		}
		if (isRemake) {
			return "text-yellow-400 border-yellow-400";
		}
		return win
			? "text-green-400 border-green-400"
			: "text-red-400 border-red-400";
	};

	// Background gradient
	const getGradientBackground = (win, isRemake, isMVP) => {
		if (isMVP) {
			return "bg-gradient-to-r from-gray-800 via-yellow-600/20 to-gray-800";
		}
		if (isRemake) {
			return "bg-gradient-to-r from-gray-800 via-yellow-600/20 to-gray-800";
		}
		return win
			? "bg-gradient-to-r from-gray-800 via-green-900/20 to-gray-800"
			: "bg-gradient-to-r from-gray-800 via-red-900/20 to-gray-800";
	};

	const truncateName = (name, maxLength) => {
		if (name.length > maxLength) {
			return name.substring(0, maxLength) + "...";
		}
		return name;
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

				{/* Queue Filter Dropdown */}
				<div className="flex items-center space-x-2">
					<select
						id="queue-filter"
						className="p-2 bg-gray-800 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

			{/* Match History by Day */}
			<div className="mt-2">
				{Object.entries(matchesByDay).map(([day, matches]) => (
					<div key={day} className="mb-2">
						<h2 className="text-xl font-semibold text-gray-200 my-4">{day}</h2>

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
							// Gather tags
							const tags = [...getAdditionalTags(match, currentPlayer)];

							// Additional mini-tags
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

							const damageThreshold = match.info.queueId === 450 ? 1700 : 900;
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
							const ward = items[6];

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

							const augmentsSelected = [
								currentPlayer.playerAugment1,
								currentPlayer.playerAugment2,
								currentPlayer.playerAugment3,
								currentPlayer.playerAugment4,
							];

							const goldEarned = currentPlayer.goldEarned.toLocaleString();

							const winningTeam = match.info.participants.filter((p) => p.win);
							const losingTeam = match.info.participants.filter((p) => !p.win);

							const isRemake = match.info.gameDuration < 300;
							// Check for MVP tag
							const isMVP = tags.some((tag) => tag.key === "mvp");

							return (
								<div key={index} className="overflow-x-auto">
									{/* Container with gradient based on outcome */}
									<div
										onClick={() =>
											setExpandedMatchId(
												expandedMatchId === match.metadata.matchId
													? null
													: match.metadata.matchId
											)
										}
										className={`rounded-lg shadow-lg p-6 cursor-pointer flex flex-col relative mb-2 min-w-[768px] text-xs sm:text-sm ${getGradientBackground(
											currentPlayer.win,
											isRemake,
											isMVP
										)}`}
									>
										{/* Left side: champion info & queue info */}
										<div className="absolute top-4 left-2 flex items-start">
											<div className="flex items-center mr-4">
												<Image
													src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${currentPlayer.championId}.png`}
													alt="Champion Icon"
													className={`sm:w-12 sm:h-12 w-16 h-16 rounded-full border-2 ${getOutcomeClass(
														currentPlayer.win,
														isRemake,
														isMVP
													)}`}
													width={64}
													height={64}
												/>
											</div>
											<div className="flex flex-col">
												<div className="flex items-center mb-2">
													<p
														className={`font-semibold mr-2 ${getOutcomeClass(
															currentPlayer.win,
															isRemake,
															isMVP
														)} sm:text-sm md:text-base lg:text-lg`}
													>
														{isRemake
															? "Remake"
															: currentPlayer.win
															? "Victory"
															: "Defeat"}
													</p>
													<p className="text-sm mr-2">
														• {getQueueName(match.info.queueId)}
													</p>
													<p className="text-sm mr-2">
														•{" "}
														{`${Math.floor(
															match.info.gameDuration / 60
														)}:${String(match.info.gameDuration % 60).padStart(
															2,
															"0"
														)}`}
													</p>
													<p className="text-sm flex items-center">
														• {timeAgo} •
														{match.info.queueId !== 1700 &&
															currentPlayer.teamPosition && (
																<Image
																	src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${currentPlayer.teamPosition.toLowerCase()}.svg`}
																	alt={`${currentPlayer.teamPosition} Position Icon`}
																	width={16}
																	height={16}
																	className="ml-1"
																/>
															)}
													</p>
												</div>
												<div className="flex">
													<div className="flex flex-col mr-8">
														<p className="sm:text-sm md:text-base lg:text-lg font-bold">
															{kda} KDA
														</p>
														<p className="text-md">
															{currentPlayer.kills}/{currentPlayer.deaths}/
															{currentPlayer.assists}
														</p>
													</div>
													{match.info.queueId === 1700 ? (
														<div className="flex flex-col">
															<p className="sm:text-sm md:text-base lg:text-lg font-bold">
																{dpm} DPM
															</p>
															<p className="text-md">{goldEarned} Gold</p>
														</div>
													) : (
														<div className="flex flex-col">
															<p className="sm:text-sm md:text-base lg:text-lg font-bold">
																{csPerMinCalc} CS/Min
															</p>
															<p className="text-md">{cs} CS</p>
														</div>
													)}
												</div>

												{/* The tags: limit based on breakpoint */}
												<div className="flex mt-2 flex-wrap justify-start space-x-2">
													{tags.slice(0, maxTagsToShow)}
												</div>
											</div>
										</div>
										<div className="h-24"></div>

										{/* Summoner Spells & Items */}
										<div className="absolute top-16 right-[270px] flex items-center justify-center">
											<div className="flex flex-col items-center mr-2 gap-2">
												{[
													currentPlayer.summoner1Id,
													currentPlayer.summoner2Id,
												].map((spellId, idx) => (
													<Image
														key={idx}
														src={`/images/summonerSpells/${spellId}.png`}
														alt={`Summoner Spell ${idx + 1}`}
														width={28}
														height={28}
														className="sm:w-6 sm:h-6 w-8 h-8 rounded-full border border-gray-700"
													/>
												))}
											</div>
											<div className="grid grid-cols-4 gap-2">
												{items.slice(0, 3).map((itemId, idx) => (
													<div key={idx} className="flex items-center">
														{itemId > 0 ? (
															<Image
																src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/item/${itemId}.png`}
																alt="Item"
																width={28}
																height={28}
																className="sm:w-6 sm:h-6 w-8 h-8 rounded-lg border border-gray-700"
															/>
														) : (
															<Image
																src="/images/placeholder.png"
																alt="No item"
																width={28}
																height={28}
																className="sm:w-6 sm:h-6 w-8 h-8 rounded-lg border border-gray-700"
															/>
														)}
													</div>
												))}
												{items[6] ? (
													<div className="flex items-center">
														<Image
															src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/item/${items[6]}.png`}
															alt="Ward"
															width={28}
															height={28}
															className="sm:w-6 sm:h-6 w-8 h-8 rounded-lg border border-gray-700"
														/>
													</div>
												) : (
													<Image
														src="/images/placeholder.png"
														alt="No ward"
														width={28}
														height={28}
														className="sm:w-6 sm:h-6 w-8 h-8 rounded-lg border border-gray-700"
													/>
												)}
												{items.slice(3, 6).map((itemId, idx) => (
													<div key={idx} className="flex items-center">
														{itemId > 0 ? (
															<Image
																src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/item/${itemId}.png`}
																alt="Item"
																width={28}
																height={28}
																className="sm:w-6 sm:h-6 w-8 h-8 rounded-lg border border-gray-700"
															/>
														) : (
															<Image
																src="/images/placeholder.png"
																alt="No item"
																width={28}
																height={28}
																className="sm:w-6 sm:h-6 w-8 h-8 rounded-lg border border-gray-700"
															/>
														)}
													</div>
												))}
											</div>
										</div>

										{/* Arena Augments or Summaries */}
										{match.info.queueId === 1700 ? (
											<div className="absolute top-6 right-16 flex">
												<div className="grid grid-cols-2 gap-2">
													{augmentsSelected.map((augmentId, idx) => (
														<div key={idx} className="flex items-center">
															<Image
																src={getAugmentIcon(augmentId)}
																alt={`Augment ${idx + 1}`}
																className="w-12 h-12 rounded-lg border border-gray-700"
																width={48}
																height={48}
															/>
														</div>
													))}
												</div>
											</div>
										) : (
											<div className="absolute top-4 right-0.5 flex">
												<div className="flex flex-col items-start">
													{winningTeam.map((participant, idx) => (
														<div key={idx} className="flex items-center">
															<Image
																src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
																alt="Participant Champion"
																width={24}
																height={24}
																className="sm:w-6 sm:h-6 w-6 h-6 rounded-full border border-gray-700 ml-1"
															/>
															<p
																className="text-sm truncate"
																style={{ width: "100px" }}
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
															<Image
																src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
																alt="Participant Champion"
																width={24}
																height={24}
																className="sm:w-6 sm:h-6 w-6 h-6 rounded-full border border-gray-700 mr-1"
															/>
															<p
																className="text-sm truncate"
																style={{ width: "100px" }}
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
									</div>

									{/* Conditionally render expanded match details */}
									{expandedMatchId === match.metadata.matchId && (
										<div className="p-4 bg-gray-900 rounded-lg shadow-lg mb-2">
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
