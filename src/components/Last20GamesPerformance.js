import React, { useMemo } from "react";
import Image from "next/image";

const Last20GamesPerformance = ({ matchDetails, selectedSummonerPUUID }) => {
	// Filter to get the last 20 matches of the selected player
	const last20Matches = useMemo(() => {
		return matchDetails
			.filter((match) =>
				match.info.participants.some(
					(participant) => participant.puuid === selectedSummonerPUUID
				)
			)
			.slice(0, 20);
	}, [matchDetails, selectedSummonerPUUID]);

	// Calculate performance stats for the last 20 games
	const performanceStats = useMemo(() => {
		let totalWins = 0;
		let totalKills = 0;
		let totalDeaths = 0;
		let totalAssists = 0;

		const championPerformance = {};

		last20Matches.forEach((match) => {
			const currentPlayer = match.info.participants.find(
				(participant) => participant.puuid === selectedSummonerPUUID
			);

			// Win/Loss
			if (currentPlayer.win) {
				totalWins++;
			}

			// Kills, Deaths, Assists
			totalKills += currentPlayer.kills;
			totalDeaths += currentPlayer.deaths;
			totalAssists += currentPlayer.assists;

			// Champion Performance
			const championId = currentPlayer.championId;
			if (!championPerformance[championId]) {
				championPerformance[championId] = {
					wins: 0,
					losses: 0,
					kills: 0,
					deaths: 0,
					assists: 0,
					games: 0,
					kda: 0,
				};
			}

			championPerformance[championId].games++;
			championPerformance[championId].kills += currentPlayer.kills;
			championPerformance[championId].deaths += currentPlayer.deaths;
			championPerformance[championId].assists += currentPlayer.assists;
			championPerformance[championId].kda =
				(championPerformance[championId].kills +
					championPerformance[championId].assists) /
				Math.max(1, championPerformance[championId].deaths);

			if (currentPlayer.win) {
				championPerformance[championId].wins++;
			} else {
				championPerformance[championId].losses++;
			}
		});

		const winRate = ((totalWins / last20Matches.length) * 100).toFixed(1);
		const avgKills = (totalKills / last20Matches.length).toFixed(1);
		const avgDeaths = (totalDeaths / last20Matches.length).toFixed(1);
		const avgAssists = (totalAssists / last20Matches.length).toFixed(1);
		const avgKDA = (
			(totalKills + totalAssists) /
			Math.max(1, totalDeaths)
		).toFixed(1);

		return {
			winRate,
			avgKills,
			avgDeaths,
			avgAssists,
			avgKDA,
			totalWins,
			totalLosses: last20Matches.length - totalWins,
			championPerformance,
		};
	}, [last20Matches, selectedSummonerPUUID]);

	// Sort champions by best winrate (top 3)
	const topChampions = Object.keys(performanceStats.championPerformance)
		.sort((a, b) => {
			const winRateA =
				(performanceStats.championPerformance[a].wins /
					performanceStats.championPerformance[a].games) *
				100;
			const winRateB =
				(performanceStats.championPerformance[b].wins /
					performanceStats.championPerformance[b].games) *
				100;
			return winRateB - winRateA;
		})
		.slice(0, 3);

	return (
		<div
			className="
        relative
        w-full
        max-w-screen-xl
        mx-auto
        p-4 sm:p-6
        rounded-lg
        border border-[#2f2f46]
        bg-gradient-to-br from-[#232337] to-[#1b1b2d]
        shadow-[0_4px_15px_rgba(0,0,0,0.6)]
        flex 
        flex-col 
        space-y-6
        items-center
        sm:flex-row 
        sm:justify-between 
        sm:space-y-0
        sm:space-x-8
        text-sm sm:text-base
      "
		>
			{/* Winrate Section */}
			<div className="flex items-center sm:items-start sm:flex-col space-x-4 sm:space-x-0 sm:space-y-2">
				{/* Winrate Circle */}
				<div className="w-20 h-20 relative">
					<svg className="w-full h-full transform -rotate-90">
						<circle
							className="text-gray-700"
							strokeWidth="6"
							stroke="currentColor"
							fill="transparent"
							r="30"
							cx="50%"
							cy="50%"
						/>
						<circle
							className="text-blue-400"
							strokeWidth="6"
							strokeDasharray={`${performanceStats.winRate * 1.88} 188`}
							stroke="currentColor"
							fill="transparent"
							r="30"
							cx="50%"
							cy="50%"
						/>
					</svg>
					<div className="absolute inset-0 flex items-center justify-center">
						<p className="text-blue-400 font-bold text-sm sm:text-base">
							{performanceStats.winRate}%
						</p>
					</div>
				</div>

				<div className="sm:mt-2 text-center sm:text-left">
					<p className="text-white font-bold">
						{performanceStats.totalWins}W - {performanceStats.totalLosses}L
					</p>
					<p className="text-gray-400 text-xs sm:text-sm">Winrate</p>
				</div>
			</div>

			{/* KDA Section */}
			<div className="flex flex-col items-center text-center">
				<p className="text-purple-400 font-bold text-xl sm:text-2xl">
					{performanceStats.avgKDA} KDA
				</p>
				<p className="text-gray-400">
					{performanceStats.avgKills}/{performanceStats.avgDeaths}/
					{performanceStats.avgAssists}
				</p>
			</div>

			{/* Top Champion Performances */}
			<div className="text-center">
				<p className="text-gray-400 mb-2">Top Champions</p>
				<div className="flex justify-center gap-4">
					{topChampions.map((champId) => {
						const champStats =
							performanceStats.championPerformance[champId] || {};
						const champWinRate = (
							(champStats.wins / champStats.games) *
							100
						).toFixed(1);

						return (
							<div
								key={champId}
								className="flex flex-col items-center justify-center text-center space-y-1"
							>
								<Image
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champId}.png`}
									alt={`Champion Icon`}
									width={48}
									height={48}
									className="rounded-full"
								/>
								<p className="text-white font-bold text-sm">{champWinRate}%</p>
								<p className="text-gray-400 text-xs">
									{champStats.wins}W - {champStats.losses}L
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default Last20GamesPerformance;
