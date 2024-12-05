import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

const RecentlyPlayedWith = ({
	matchDetails,
	selectedSummonerPUUID,
	region,
}) => {
	const teammatesData = useMemo(() => {
		const teammateStats = {};

		matchDetails.forEach((match) => {
			const currentPlayer = match.info.participants.find(
				(participant) => participant.puuid === selectedSummonerPUUID
			);

			if (!currentPlayer) return; // Skip if currentPlayer not found

			const teammates = match.info.participants.filter(
				(participant) =>
					participant.puuid !== selectedSummonerPUUID &&
					participant.teamId === currentPlayer.teamId
			);

			teammates.forEach((teammate) => {
				const key = `${teammate.riotIdGameName}#${teammate.riotIdTagline}`;
				if (!teammateStats[key]) {
					teammateStats[key] = {
						riotIdGameName: teammate.riotIdGameName,
						riotIdTagline: teammate.riotIdTagline,
						gamesPlayed: 0,
						wins: 0,
						losses: 0,
						summonerLevel: teammate.summonerLevel,
						championId: teammate.championId,
						// Removed platformId
					};
				}

				teammateStats[key].gamesPlayed += 1;
				if (teammate.win) {
					teammateStats[key].wins += 1;
				} else {
					teammateStats[key].losses += 1;
				}
			});
		});

		// Filter teammates with more than 1 game
		return Object.values(teammateStats).filter(
			(teammate) => teammate.gamesPlayed > 1
		);
	}, [matchDetails, selectedSummonerPUUID]);

	// Return null if there's no data
	if (teammatesData.length === 0) {
		return null; // Component renders nothing
	}

	return (
		<div className="bg-[#1e1e2f] p-4 rounded-md shadow-lg relative border border-gray-800">
			<h3 className="text-white text-sm mb-4">
				Recently Played With (Recent 20 Games)
			</h3>
			{teammatesData.map((teammate, index) => {
				const winRate = ((teammate.wins / teammate.gamesPlayed) * 100).toFixed(
					0
				);
				const { riotIdGameName, riotIdTagline } = teammate;

				return (
					<Link
						key={index}
						href={`/profile?gameName=${encodeURIComponent(
							riotIdGameName
						)}&tagLine=${encodeURIComponent(
							riotIdTagline
						)}&region=${encodeURIComponent(region)}`}
					>
						<div className="flex items-center justify-between mb-2 p-1 bg-[#2c2c3d] rounded-md border border-gray-600 cursor-pointer">
							{/* Left section with Champion Icon and Player Info */}
							<div className="flex items-center w-2/5">
								<Image
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${teammate.championId}.png`}
									alt="Champion Icon"
									width={28}
									height={28}
									className="rounded-full border-2 border-gray-500"
								/>
								<div className="ml-2">
									<p className="text-white text-xs font-semibold leading-tight">
										{riotIdGameName}
										<span className="text-gray-400 text-xs">
											#{riotIdTagline}
										</span>
									</p>
									<p className="text-gray-400 text-xs">
										Level {teammate.summonerLevel}
									</p>
								</div>
							</div>

							{/* Middle section with Wins/Losses and Games Played */}
							<div className="flex flex-col items-center w-2/5">
								<p className="text-white text-xs leading-tight">
									{teammate.wins}W / {teammate.losses}L
								</p>
								<p className="text-gray-400 text-xs">
									{teammate.gamesPlayed} Played
								</p>
							</div>

							{/* Right section with Win Rate */}
							<div className="flex flex-col items-end w-1/5">
								<p className="text-white text-xs">{winRate}%</p>
							</div>
						</div>
					</Link>
				);
			})}
		</div>
	);
};

export default RecentlyPlayedWith;
