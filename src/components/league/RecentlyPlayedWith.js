import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUsers, FaChevronDown, FaChevronUp } from "react-icons/fa";

const RecentlyPlayedWith = ({
								matchDetails,
								selectedSummonerPUUID,
								region,
							}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [isExpanded, setIsExpanded] = useState(true);

	const teammatesData = useMemo(() => {
		const teammateStats = {};

		matchDetails.forEach((match) => {
			// Guard: ensure match, match.info, and match.info.participants exist
			if (!match || !match.info || !match.info.participants) return;

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

		// Filter teammates with more than 1 game and sort by games played
		const data = Object.values(teammateStats)
			.filter((teammate) => teammate.gamesPlayed > 1)
			.sort((a, b) => b.gamesPlayed - a.gamesPlayed);

		// Limit to last 10 entries
		return data.slice(0, 10);
	}, [matchDetails, selectedSummonerPUUID]);

	const handleProfileClick = (e, link) => {
		e.preventDefault();
		setIsLoading(true);
		window.location.href = link; // Navigate after setting loading state
	};

	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<div className="card-highlight">
			<div
				className="flex items-center justify-between p-4 cursor-pointer"
				onClick={toggleExpand}
			>
				<div className="flex items-center">
					<div className="p-2 rounded-full bg-[--card-bg] mr-3 flex items-center justify-center">
						<FaUsers className="text-[--primary] text-lg" />
					</div>
					<h3 className="text-base font-semibold">
						Teammates
						<span className="ml-2 text-xs text-[--text-secondary] font-normal">Last 10 Games</span>
					</h3>
				</div>
				<button className="text-[--text-secondary] transition-colors duration-200 hover:text-[--text-primary]">
					{isExpanded ? <FaChevronUp /> : <FaChevronDown />}
				</button>
			</div>

			{isExpanded && (
				<div className="px-4 pb-4">
					{teammatesData.length > 0 ? (
						<div className="space-y-2">
							{teammatesData.map((teammate, index) => {
								const winRate = ((teammate.wins / teammate.gamesPlayed) * 100).toFixed(0);
								const { riotIdGameName, riotIdTagline } = teammate;
								const profileLink = `/league/profile?gameName=${encodeURIComponent(
									riotIdGameName
								)}&tagLine=${encodeURIComponent(
									riotIdTagline
								)}&region=${encodeURIComponent(region)}`;

								// Determine win rate color
								const winRateColor =
									winRate >= 60 ? "text-green-500" :
										winRate >= 50 ? "text-blue-500" :
											winRate >= 40 ? "text-yellow-500" : "text-red-500";

								return (
									<Link key={index} href={profileLink}>
										<div
											onClick={(e) => handleProfileClick(e, profileLink)}
											className="glass p-2 mb-2 rounded-lg transition-all duration-200 hover:bg-[--primary]/10 hover:scale-[1.01] cursor-pointer"
										>
											<div className="flex items-center justify-between">
												{/* Left: Champion Icon & Player Info */}
												<div className="flex items-center">
													<div className="relative w-8 h-8 mr-2">
														<Image
															src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${teammate.championId}.png`}
															alt="Champion Icon"
															width={32}
															height={32}
															className="rounded-full border-2 border-[--card-border]"
														/>
														<div className="absolute -bottom-1 -right-1 bg-[--card-bg] text-[9px] px-1 rounded border border-[--card-border]">
															{teammate.summonerLevel}
														</div>
													</div>
													<div>
														<p className="text-sm font-semibold truncate max-w-[120px]">
															{riotIdGameName}
															<span className="text-[--text-secondary] ml-1 text-xs">
                                #{riotIdTagline}
                              </span>
														</p>
													</div>
												</div>

												{/* Right: Stats */}
												<div className="flex items-center space-x-4">
													<div className="flex flex-col items-center">
														<p className="text-xs text-[--text-secondary]">Games</p>
														<p className="text-sm font-medium">{teammate.gamesPlayed}</p>
													</div>
													<div className="flex flex-col items-center">
														<p className="text-xs text-[--text-secondary]">W/L</p>
														<p className="text-sm font-medium">
															<span className="text-[--success]">{teammate.wins}</span>
															<span className="text-[--text-secondary] mx-1">/</span>
															<span className="text-[--error]">{teammate.losses}</span>
														</p>
													</div>
													<div className="flex flex-col items-center">
														<p className="text-xs text-[--text-secondary]">Win %</p>
														<p className={`text-sm font-bold ${winRateColor}`}>{winRate}%</p>
													</div>
												</div>
											</div>
										</div>
									</Link>
								);
							})}
						</div>
					) : (
						<div className="bg-[--card-bg] rounded-lg p-4 text-center">
							<p className="text-[--text-secondary]">No recurring teammates found.</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default RecentlyPlayedWith;