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
        p-6
        rounded-lg
        border border-[#2f2f46]
        bg-gradient-to-br from-[#232337] to-[#1b1b2d]
        shadow-[0_4px_15px_rgba(0,0,0,0.6)]
        flex
        justify-between
        items-center
      "
		>
			{/* Winrate Section */}
			<div className="flex items-center justify-center">
				<div className="w-24 h-24 relative">
					{/* Circular Progress (Winrate) */}
					<svg className="w-full h-full transform -rotate-90">
						<circle
							className="text-gray-700"
							strokeWidth="6"
							stroke="currentColor"
							fill="transparent"
							r="35"
							cx="50%"
							cy="50%"
						/>
						<circle
							className="text-blue-400"
							strokeWidth="6"
							strokeDasharray={`${performanceStats.winRate * 2.2} 220`}
							stroke="currentColor"
							fill="transparent"
							r="35"
							cx="50%"
							cy="50%"
						/>
					</svg>
					<div className="absolute inset-0 flex items-center justify-center">
						<p className="text-blue-400 text-lg font-bold">
							{performanceStats.winRate}%
						</p>
					</div>
				</div>
				<div className="ml-4">
					<p className="text-white text-lg font-bold">
						{performanceStats.totalWins}W - {performanceStats.totalLosses}L
					</p>
					<p className="text-gray-400 text-sm">Winrate</p>
				</div>
			</div>

			{/* KDA Section */}
			<div className="text-center">
				<p className="text-purple-500 text-3xl font-bold">
					{performanceStats.avgKDA} KDA
				</p>
				<p className="text-gray-400 text-sm">
					{performanceStats.avgKills}/{performanceStats.avgDeaths}/
					{performanceStats.avgAssists}
				</p>
			</div>

			{/* Top Champion Performances */}
			<div>
				<p className="text-gray-400 text-sm mb-2">Top Champions</p>
				<div className="flex justify-center gap-4">
					{topChampions.map((champId) => {
						const champStats = performanceStats.championPerformance[champId];
						const winRate = (
							(champStats.wins / champStats.games) *
							100
						).toFixed(1);

						return (
							<div key={champId} className="flex flex-col items-center">
								<Image
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champId}.png`}
									alt={`Champion Icon`}
									width={48}
									height={48}
									className="rounded-full"
								/>
								<p className="text-white font-bold">{winRate}%</p>
								<p className="text-gray-400 text-xs">
									{champStats.games}W-{champStats.losses}L
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
