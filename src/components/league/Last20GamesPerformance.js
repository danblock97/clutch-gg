import React, { useMemo } from "react";
import Image from "next/image";
import {
	FaArrowUp,
	FaArrowDown,
	FaSkull,
	FaShieldAlt,
	FaStar,
	FaChartLine,
} from "react-icons/fa";

const Last20GamesPerformance = ({
	matchDetails,
	selectedSummonerPUUID,
	onChampionClick,
	selectedChampionId,
}) => {
	// Filter to get the last 20 matches of the selected player
	const last20Matches = useMemo(() => {
		return matchDetails
			.filter(
				(match) =>
					match &&
					match.info &&
					match.info.participants &&
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
		let totalGold = 0;
		let totalDamageDealt = 0;
		let totalVisionScore = 0;
		let totalCS = 0;
		let totalGameDuration = 0;

		const championPerformance = {};

		last20Matches.forEach((match) => {
			// Safe guard in case match.info.participants is missing
			if (!match || !match.info || !match.info.participants) return;

			const currentPlayer = match.info.participants.find(
				(participant) => participant.puuid === selectedSummonerPUUID
			);

			if (!currentPlayer) return;

			// Game Duration (in minutes)
			const gameDurationMinutes = match.info.gameDuration / 60;
			totalGameDuration += gameDurationMinutes;

			// Win/Loss
			if (currentPlayer.win) totalWins++;

			// Basic Stats
			totalKills += currentPlayer.kills;
			totalDeaths += currentPlayer.deaths;
			totalAssists += currentPlayer.assists;
			totalGold += currentPlayer.goldEarned;
			totalDamageDealt += currentPlayer.totalDamageDealtToChampions;
			totalVisionScore += currentPlayer.visionScore || 0;
			totalCS +=
				currentPlayer.totalMinionsKilled + currentPlayer.neutralMinionsKilled;

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
					damageDealt: 0,
				};
			}

			championPerformance[championId].games++;
			championPerformance[championId].kills += currentPlayer.kills;
			championPerformance[championId].deaths += currentPlayer.deaths;
			championPerformance[championId].assists += currentPlayer.assists;
			championPerformance[championId].damageDealt +=
				currentPlayer.totalDamageDealtToChampions;

			if (currentPlayer.win) {
				championPerformance[championId].wins++;
			} else {
				championPerformance[championId].losses++;
			}

			// Calculate KDA for the champion
			championPerformance[championId].kda =
				(championPerformance[championId].kills +
					championPerformance[championId].assists) /
				Math.max(1, championPerformance[championId].deaths);
		});

		// Calculate averages and overall stats
		const winRate = ((totalWins / last20Matches.length) * 100).toFixed(1);
		const avgKills = (totalKills / last20Matches.length).toFixed(1);
		const avgDeaths = (totalDeaths / last20Matches.length).toFixed(1);
		const avgAssists = (totalAssists / last20Matches.length).toFixed(1);
		const avgKDA = (
			(totalKills + totalAssists) /
			Math.max(1, totalDeaths)
		).toFixed(1);
		const avgCS = (totalCS / last20Matches.length).toFixed(1);
		const avgCSPerMin = (totalCS / totalGameDuration).toFixed(1);
		const avgDamageDealt = (totalDamageDealt / last20Matches.length).toFixed(0);

		// Add comparison to indicate if stats are good or bad
		const kdaComparison =
			parseFloat(avgKDA) >= 3.0
				? "good"
				: parseFloat(avgKDA) >= 2.0
				? "average"
				: "bad";
		const winRateComparison =
			parseFloat(winRate) >= 55
				? "good"
				: parseFloat(winRate) >= 45
				? "average"
				: "bad";
		const csPerMinComparison =
			parseFloat(avgCSPerMin) >= 7.0
				? "good"
				: parseFloat(avgCSPerMin) >= 5.0
				? "average"
				: "bad";

		return {
			winRate,
			avgKills,
			avgDeaths,
			avgAssists,
			avgKDA,
			avgCS,
			avgCSPerMin,
			avgDamageDealt,
			totalWins,
			totalLosses: last20Matches.length - totalWins,
			championPerformance,
			comparisons: {
				kda: kdaComparison,
				winRate: winRateComparison,
				csPerMin: csPerMinComparison,
			},
		};
	}, [last20Matches, selectedSummonerPUUID]);

	// Sort champions by most played and best winrate (top 4)
	const topChampions = useMemo(() => {
		return Object.entries(performanceStats.championPerformance)
			.map(([championId, stats]) => ({
				championId: Number(championId),
				...stats,
				winRate: ((stats.wins / stats.games) * 100).toFixed(1),
			}))
			.sort((a, b) => b.games - a.games)
			.slice(0, 4);
	}, [performanceStats.championPerformance]);

	// Helper to get status indicator icon and color
	const getStatusIndicator = (status) => {
		switch (status) {
			case "good":
				return { icon: <FaArrowUp />, color: "text-green-500" };
			case "average":
				return { icon: <FaStar />, color: "text-yellow-500" };
			case "bad":
				return { icon: <FaArrowDown />, color: "text-red-500" };
			default:
				return { icon: null, color: "text-gray-500" };
		}
	};

	const kdaStatus = getStatusIndicator(performanceStats.comparisons.kda);
	const winRateStatus = getStatusIndicator(
		performanceStats.comparisons.winRate
	);
	const csStatus = getStatusIndicator(performanceStats.comparisons.csPerMin);

	return (
		<div className="card-highlight rounded-xl p-4">
			{" "}
			{/* Reduced padding */}
			<h2 className="text-lg font-bold mb-3 flex items-center">
				{" "}
				{/* Reduced margin */}
				<FaChartLine className="text-[--primary] mr-2" />
				Recent Performance
				<span className="text-[--text-secondary] text-sm font-normal ml-2">
					(Last 20 Games)
				</span>
			</h2>
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
				{" "}
				{/* Reduced gap */}
				{/* Left side: Performance Stats */}
				<div className="lg:col-span-4 space-y-3">
					{" "}
					{/* Reduced vertical space */}
					{/* Win Rate Circle - Fixed for mobile display */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="relative w-16 h-16 flex-shrink-0">
								<svg
									className="w-full h-full transform -rotate-90"
									viewBox="0 0 64 64"
								>
									<circle
										className="text-[--card-bg]"
										strokeWidth="5"
										stroke="currentColor"
										fill="transparent"
										r="25"
										cx="32"
										cy="32"
									/>
									<circle
										className={`${
											parseFloat(performanceStats.winRate) >= 55
												? "text-green-500"
												: parseFloat(performanceStats.winRate) >= 45
												? "text-blue-500"
												: "text-red-500"
										}`}
										strokeWidth="5"
										strokeDasharray={`${performanceStats.winRate * 1.57} 157`}
										stroke="currentColor"
										fill="transparent"
										r="25"
										cx="32"
										cy="32"
									/>
								</svg>
								<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
									<p className="font-bold text-xs">
										{performanceStats.winRate}%
									</p>
								</div>
							</div>

							<div>
								<p className="text-base font-semibold flex items-center">
									Win Rate
									<span className={`ml-2 ${winRateStatus.color}`}>
										{winRateStatus.icon}
									</span>
								</p>
								<p className="text-[--text-secondary] text-sm">
									<span className="text-green-500">
										{performanceStats.totalWins}W
									</span>{" "}
									-
									<span className="text-red-500 ml-1">
										{performanceStats.totalLosses}L
									</span>
								</p>
							</div>
						</div>

						{/* KDA Display */}
						<div className="text-center">
							<p className="text-base font-semibold flex items-center justify-end">
								KDA
								<span className={`ml-2 ${kdaStatus.color}`}>
									{kdaStatus.icon}
								</span>
							</p>
							<p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
								{performanceStats.avgKDA}
							</p>
							<p className="text-[--text-secondary] text-xs">
								{performanceStats.avgKills}/{performanceStats.avgDeaths}/
								{performanceStats.avgAssists}
							</p>
						</div>
					</div>
					{/* Additional Stats */}
					<div className="grid grid-cols-2 gap-2 mt-3">
						{" "}
						{/* Reduced gap and margin */}
						<div className="bg-[--card-bg] rounded-lg p-2 text-center">
							<p className="text-[--text-secondary] text-xs uppercase">
								CS per Min
							</p>
							<p className="text-base font-semibold flex items-center justify-center">
								{performanceStats.avgCSPerMin}
								<span className={`ml-1 ${csStatus.color}`}>
									{csStatus.icon}
								</span>
							</p>
						</div>
						<div className="bg-[--card-bg] rounded-lg p-2 text-center">
							<p className="text-[--text-secondary] text-xs uppercase">
								Avg Damage
							</p>
							<p className="text-base font-semibold">
								{Number(performanceStats.avgDamageDealt).toLocaleString()}
							</p>
						</div>
					</div>
				</div>
				{/* Right side: Top Champions */}
				<div className="lg:col-span-8">
					<p className="text-base font-semibold mb-2">Top Champions</p>{" "}
					{/* Reduced margin */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
						{" "}
						{/* Reduced gap */}
						{topChampions.map((champion) => {
							const winRateValue = parseFloat(champion.winRate);
							let winRateColorClass = "text-red-500";

							if (winRateValue >= 60) winRateColorClass = "text-green-500";
							else if (winRateValue >= 50) winRateColorClass = "text-blue-500";
							else if (winRateValue >= 40)
								winRateColorClass = "text-yellow-500";

							return (
								<div
									key={champion.championId}
									className={`bg-[--card-bg] rounded-lg p-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
										// Reduced padding
										selectedChampionId === champion.championId
											? "ring-2 ring-[--primary]"
											: "hover:bg-[--card-bg-secondary]"
									}`}
									onClick={() => onChampionClick(champion.championId)}
								>
									<div className="flex flex-col items-center">
										<div className="relative w-12 h-12 mb-1">
											{" "}
											{/* Reduced margin */}
											<Image
												src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champion.championId}.png`}
												alt="Champion Icon"
												fill
												className="rounded-full object-cover border-2 border-[--card-border]"
											/>
											<div className="absolute -bottom-1 -right-1 bg-[--card-bg] rounded-full w-5 h-5 flex items-center justify-center text-xs border border-[--card-border]">
												{champion.games}
											</div>
										</div>

										<div className="text-center">
											<p className={`text-sm font-bold ${winRateColorClass}`}>
												{champion.winRate}%
											</p>
											<p className="text-xs text-[--text-secondary]">
												<span className="text-green-500">{champion.wins}W</span>
												<span className="text-[--text-secondary] mx-1">/</span>
												<span className="text-red-500">{champion.losses}L</span>
											</p>
											<p className="text-xs mt-1">
												KDA:{" "}
												<span className="font-medium">
													{champion.kda.toFixed(1)}
												</span>
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Last20GamesPerformance;
