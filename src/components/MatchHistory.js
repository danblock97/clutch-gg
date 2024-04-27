import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

const MatchHistory = ({ matchDetails, selectedSummonerPUUID }) => {
	const router = useRouter();
	if (!matchDetails || matchDetails.length === 0) {
		return (
			<div className="bg-[#18141c] text-[#979aa0] p-4 rounded-md">
				No match history available
			</div>
		);
	}

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
			default:
				return "Unknown Queue";
		}
	};

	const getLaneName = (individualPosition, queueId) => {
		// Check if the game is ARAM (queueId 450)
		if (queueId === 450) {
			return null;
		}

		// Handle lanes for non-ARAM games
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
		<div className=" text-[#979aa0] p-4">
			{filteredMatches.map((match, index) => {
				const currentPlayerParticipant = match.info.participants.find(
					(participant) => participant.puuid === selectedSummonerPUUID
				);

				const kda = (
					(currentPlayerParticipant.kills + currentPlayerParticipant.assists) /
					currentPlayerParticipant.deaths
				).toFixed(2);
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

				return (
					<div
						key={index}
						className="bg-[#13151b] rounded-md shadow-md p-4 mb-4 flex flex-wrap justify-between items-center px-6 py-4 w-full"
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
									currentPlayerParticipant.win
										? "text-green-500"
										: "text-red-500"
								}`}
							>
								{currentPlayerParticipant.win ? "Victory" : "Defeat"}
							</p>
						</div>
						<div className="flex flex-row items-end">
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

						<div className="flex flex-wrap w-full">
							<div className="flex-grow">
								<p className="text-xs  lg:text-md font-bold">{kda} KDA</p>
								<p className="text-xs md:text-sm lg:text-md font-semibold">
									{currentPlayerParticipant.kills}/
									{currentPlayerParticipant.deaths}/
									{currentPlayerParticipant.assists}
								</p>
							</div>
							<div className="flex-grow">
								<p className="text-xs md:text-sm lg:text-md font-bold">
									{visPerMin.toFixed(2)} Vis/Min
								</p>
								<p className="text-xs md:text-sm lg:text-md font-semibold">
									{(
										currentPlayerParticipant.challenges.killParticipation * 100
									).toFixed(0)}
									% KP
								</p>
							</div>
							<div className="flex-grow">
								<p className="text-xs md:text-sm lg:text-md font-bold">
									CS/Min: {csPerMin.toFixed(1)}
								</p>
								<p className="text-xs md:text-sm lg:text-md font-semibold">
									{totalCS} CS
								</p>
							</div>
							<div className="flex-grow">
								<p className="text-xs md:text-sm lg:text-md font-semibold">
									DMG/Min: {dmgPerMin.toFixed(0)}
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
