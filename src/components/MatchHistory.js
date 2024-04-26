import Image from "next/image";
import React from "react";

// Function to get the KDA ratio
const calculateKDA = (kills, deaths, assists) => {
	const kda = (kills + assists) / deaths;
	return isNaN(kda) || !isFinite(kda) ? 0 : kda.toFixed(2);
};

const MatchHistory = ({ matchDetails, selectedSummonerPUUID }) => {
	if (!matchDetails || matchDetails.length === 0) {
		return (
			<div className="bg-gray-900 text-white p-4 rounded-md">
				No match history available
			</div>
		);
	}

	const filteredMatches = matchDetails.filter((match) =>
		match.info.participants.some(
			(participant) => participant.puuid === selectedSummonerPUUID
		)
	);

	if (filteredMatches.length === 0) {
		return (
			<div className="bg-gray-900 text-white p-4 rounded-md">
				No match history available for this summoner
			</div>
		);
	}

	return (
		<div className=" text-white p-4">
			{filteredMatches.map((match, index) => {
				const currentPlayerParticipant = match.info.participants.find(
					(participant) => participant.puuid === selectedSummonerPUUID
				);

				// Calculate KDA
				const kda = calculateKDA(
					currentPlayerParticipant.kills,
					currentPlayerParticipant.deaths,
					currentPlayerParticipant.assists
				);

				// Calculate total CS
				const totalCS =
					currentPlayerParticipant.totalMinionsKilled +
					currentPlayerParticipant.totalAllyJungleMinionsKilled +
					currentPlayerParticipant.totalEnemyJungleMinionsKilled;

				// Calculate DMG/Min
				const dmgPerMin =
					currentPlayerParticipant.totalDamageDealtToChampions /
					(match.info.gameDuration / 60);

				// Calculate Vis/Min
				const visPerMin =
					currentPlayerParticipant.visionScore / (match.info.gameDuration / 60);

				// Calculate CS/Min
				const csPerMin = totalCS / (match.info.gameDuration / 60);

				return (
					<div
						key={index}
						className="bg-gray-800 rounded-md shadow-md p-4 mb-4 flex flex-wrap justify-between items-center"
					>
						<div className="flex items-center mb-2">
							{/* Show champion icon */}
							<Image
								src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${currentPlayerParticipant.championId}.png`}
								alt="Champion Icon"
								className="w-10 h-10 mr-2"
								width={40}
								height={40}
							/>
							{/* Show champion name */}
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
						<div className="flex flex-wrap w-full">
							<div className="flex-grow">
								<p className="text-xs md:text-sm lg:text-lg">{kda} KDA</p>
								<p className="text-xs md:text-sm lg:text-lg">
									{currentPlayerParticipant.kills}/
									{currentPlayerParticipant.deaths}/
									{currentPlayerParticipant.assists}
								</p>
							</div>
							<div className="flex-grow">
								<p className="text-xs md:text-sm lg:text-lg">
									{visPerMin.toFixed(2)} Vis/Min
								</p>
								<p className="text-xs md:text-sm lg:text-lg">
									{(
										currentPlayerParticipant.challenges.killParticipation * 100
									).toFixed(0)}
									% KP
								</p>
							</div>
							<div className="flex-grow">
								<p className="text-xs md:text-sm lg:text-lg">
									CS/Min: {csPerMin.toFixed(1)}
								</p>
								<p className="text-xs md:text-sm lg:text-lg">{totalCS} CS</p>
							</div>
							<div className="flex-grow">
								<p className="text-xs md:text-sm lg:text-lg">
									DMG/Min: {dmgPerMin.toFixed(0)}
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
