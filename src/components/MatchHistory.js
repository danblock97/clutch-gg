import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const fetchArenaAugments = async () => {
	const response = await fetch(
		"https://raw.communitydragon.org/latest/cdragon/arena/en_us.json"
	);
	const data = await response.json();
	return data.augments;
};

const MatchHistory = ({
	matchDetails,
	selectedSummonerPUUID,
	gameName,
	tagLine,
}) => {
	const [augments, setAugments] = useState([]);
	const router = useRouter();

	useEffect(() => {
		const getAugments = async () => {
			const data = await fetchArenaAugments();
			setAugments(data);
		};
		getAugments();
	}, []);

	const getAugmentIcon = (id) => {
		const augment = augments.find((aug) => aug.id === id);
		return augment
			? `https://raw.communitydragon.org/latest/game/${augment.iconSmall}`
			: null;
	};

	if (!matchDetails || matchDetails.length === 0) {
		return (
			<div className="bg-[#18141c] text-[#979aa0] p-4 rounded-md">
				No match history available
			</div>
		);
	}

	const getPlacementColor = (placement) => {
		switch (placement) {
			case 1:
				return "text-yellow-500";
			case 2:
				return "text-pink-500";
			case 3:
				return "text-orange-500";
			case 4:
				return "text-blue-500";
			case 5:
				return "text-red-500";
			case 6:
				return "text-green-500";
			case 7:
				return "text-purple-500";
			case 8:
				return "text-indigo-500";
			default:
				return "text-white";
		}
	};

	const getQueueName = (queueId) => {
		switch (queueId) {
			case 420:
				return "Ranked Solo/Duo";
			case 470:
				return "Ranked Flex";
			case 490:
				return "Normal (Quickplay)";
			case 430:
				return "Normal (Blind)";
			case 400:
				return "Normal (Draft)";
			case 450:
				return "ARAM";
			case 900:
				return "URF";
			case 1020:
				return "One for All";
			case 1300:
				return "Nexus Blitz";
			case 1700:
				return "Arena";
			default:
				return "Unknown Queue";
		}
	};

	const getLaneName = (individualPosition, queueId) => {
		if (queueId === 450 || individualPosition === "Invalid") {
			return null;
		}

		switch (individualPosition) {
			case "TOP":
				return "Top";
			case "JUNGLE":
				return "Jungle";
			case "MIDDLE":
				return "Mid";
			case "BOTTOM":
				return "Bottom";
			case "UTILITY":
				return "Support";
			default:
				return "Unknown Lane";
		}
	};

	const filteredMatches = matchDetails.filter((match) =>
		match.info.participants.some(
			(participant) => participant.puuid === selectedSummonerPUUID
		)
	);

	if (filteredMatches.length === 0) {
		return (
			<div className="bg-[#18141c] text-[#979aa0] p-4 rounded-md">
				No match history available for this summoner
			</div>
		);
	}

	return (
		<div className="text-[#979aa0] p-4 w-full">
			{filteredMatches.map((match, index) => {
				const currentPlayerParticipant = match.info.participants.find(
					(participant) => participant.puuid === selectedSummonerPUUID
				);
				const placement = currentPlayerParticipant.missions?.playerScore0;
				const isArena = match.info.queueId === 1700;
				const isRemake = match.info.gameDuration < 300; // 5 minutes

				const kda =
					currentPlayerParticipant.deaths === 0
						? (
								currentPlayerParticipant.kills +
								currentPlayerParticipant.assists
						  ).toFixed(1)
						: (
								(currentPlayerParticipant.kills +
									currentPlayerParticipant.assists) /
								currentPlayerParticipant.deaths
						  ).toFixed(1);

				const totalCS =
					currentPlayerParticipant.totalMinionsKilled +
					currentPlayerParticipant.totalAllyJungleMinionsKilled +
					currentPlayerParticipant.totalEnemyJungleMinionsKilled;
				const dmgPerMin =
					currentPlayerParticipant.totalDamageDealtToChampions /
					(match.info.gameDuration / 60);
				const visPerMin =
					currentPlayerParticipant.visionScore / (match.info.gameDuration / 60);
				const csPerMin = totalCS / (match.info.gameDuration / 60);

				const gameDurationMs =
					new Date().getTime() - new Date(match.info.gameCreation).getTime();
				const daysAgo = Math.floor(gameDurationMs / (1000 * 60 * 60 * 24));
				const hoursAgo = Math.floor(gameDurationMs / (1000 * 60 * 60));
				const minutesAgo = Math.floor(gameDurationMs / (1000 * 60));

				const handleClick = () => {
					if (window.innerWidth > 768) {
						router.push(
							`/match?gameName=${gameName}&tagLine=${tagLine}&matchId=${match.metadata.matchId}`
						);
					}
				};

				return (
					<div
						key={index}
						onClick={handleClick}
						className={`${
							window.innerWidth <= 768 ? "cursor-default" : "cursor-pointer"
						} bg-[#13151b] rounded-md shadow-md p-4 mb-4 flex flex-wrap justify-between items-center w-full`}
					>
						<div className="flex items-center mb-2">
							<Image
								src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${currentPlayerParticipant.championId}.png`}
								alt="Champion Icon"
								className="w-10 h-10 mr-2"
								width={40}
								height={40}
							/>
							<p
								className={`font-semibold ${
									isRemake
										? "text-gray-500"
										: isArena
										? getPlacementColor(placement)
										: currentPlayerParticipant.win
										? "text-green-500"
										: "text-red-500"
								}`}
							>
								{isRemake
									? "Remake"
									: isArena
									? `${placement}${
											placement.toString().endsWith("1")
												? "st"
												: placement.toString().endsWith("2")
												? "nd"
												: placement.toString().endsWith("3")
												? "rd"
												: "th"
									  } Place`
									: currentPlayerParticipant.win
									? "Victory"
									: "Defeat"}
							</p>
						</div>
						<div className="flex flex-row items-end mb-4">
							{getLaneName(
								currentPlayerParticipant.individualPosition,
								match.info.queueId
							) && (
								<div className="text-xs lg:text-md font-semibold mr-2 flex items-center">
									<Image
										src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${currentPlayerParticipant.individualPosition.toLowerCase()}.svg`}
										alt="Lane Icon"
										className="mr-2"
										width={16}
										height={16}
									/>
									{getLaneName(
										currentPlayerParticipant.individualPosition,
										match.info.queueId
									)}
								</div>
							)}
							<div className="flex flex-grow items-end">
								{" "}
								{/* Added a flex container */}
								<div className="text-xs lg:text-md font-semibold mr-2">
									{getQueueName(match.info.queueId)}
								</div>
								<div className="text-xs lg:text-md font-semibold mr-2">
									{daysAgo === 0 ? (
										<p className="text-xs lg:text-md font-semibold">
											{hoursAgo === 0
												? `${minutesAgo} minute${
														minutesAgo !== 1 ? "s" : ""
												  } ago`
												: `${hoursAgo} hour${hoursAgo !== 1 ? "s" : ""} ago`}
										</p>
									) : (
										<p className="text-xs lg:text-md font-semibold">
											{daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
										</p>
									)}
								</div>
							</div>
						</div>

						<div
							className={`${
								isArena ? "grid grid-cols-3 gap-4" : "flex flex-wrap"
							} w-full`}
						>
							<div
								className={`${
									isArena ? "flex flex-col items-start ml-2" : "flex-grow mb-2"
								}`}
							>
								<p className="text-xs lg:text-sm font-bold">{kda} KDA</p>
								<p className="text-xs md:text-sm lg:text-md font-semibold">
									{currentPlayerParticipant.kills}/
									{currentPlayerParticipant.deaths}/
									{currentPlayerParticipant.assists}
								</p>
							</div>
							{isArena ? (
								<div className="flex items-center justify-start">
									{[
										currentPlayerParticipant.playerAugment1,
										currentPlayerParticipant.playerAugment2,
										currentPlayerParticipant.playerAugment3,
										currentPlayerParticipant.playerAugment4,
									].map((augmentId, index) => {
										const augmentIcon = getAugmentIcon(augmentId);
										return augmentIcon ? (
											<Image
												key={index}
												src={augmentIcon}
												alt={`Augment ${index + 1}`}
												className="w-10 h-10 mr-1"
												width={32}
												height={32}
											/>
										) : null;
									})}
								</div>
							) : (
								<>
									<div className="flex-grow mb-2">
										<p className="text-xs lg:text-sm font-bold">
											{visPerMin.toFixed(2)} Vis/Min
										</p>
										<p className="text-xs md:text-sm lg:text-md font-semibold">
											{(
												currentPlayerParticipant.challenges.killParticipation *
												100
											).toFixed(0)}
											% KP
										</p>
									</div>
									<div className="flex-grow mb-2">
										<p className="text-xs lg:text-sm font-bold">
											{csPerMin.toFixed(1)} CS/Min
										</p>
										<p className="text-xs md:text-sm lg:text-md font-semibold">
											{totalCS} CS
										</p>
									</div>
								</>
							)}
							<div
								className={`${
									isArena ? "flex flex-col items-start ml-8" : "flex-grow mb-2"
								}`}
							>
								<p className="text-xs lg:text-sm font-bold">
									{dmgPerMin.toFixed(0)} DMG/Min
								</p>
								<p className="text-xs md:text-sm lg:text-md font-semibold">
									{currentPlayerParticipant.goldEarned
										.toFixed(0)
										.toLocaleString()}{" "}
									Gold
								</p>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default MatchHistory;
