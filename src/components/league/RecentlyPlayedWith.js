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
		<div className="card-highlight border border-[--card-border] rounded-lg overflow-hidden">
			<div
				className="flex items-center justify-between p-3 cursor-pointer"
				onClick={toggleExpand}
			>
				<div className="flex items-center">
					<div className="p-2 rounded-full bg-[--card-bg] mr-3 flex items-center justify-center">
						<FaUsers className="text-[--primary] text-lg" />
					</div>
					<h3 className="text-base font-semibold">
						Recently Played
						<span className="ml-2 text-xs text-[--text-secondary] font-normal">
							From Last 20 Games
						</span>
					</h3>
				</div>
				<button className="text-[--text-secondary] transition-colors duration-200 hover:text-[--text-primary]">
					{isExpanded ? <FaChevronUp /> : <FaChevronDown />}
				</button>
			</div>

			{isExpanded && (
				<>
					<hr className="border-t border-[--card-border] mx-4" />
					<div className="px-4 pb-2 pt-2">
						{teammatesData.length > 0 ? (
							<div>
								{teammatesData.map((teammate, index) => {
									const winRate = (
										(teammate.wins / teammate.gamesPlayed) *
										100
									).toFixed(0);
									const { riotIdGameName, riotIdTagline } = teammate;
									const profileLink = `/league/profile?gameName=${encodeURIComponent(
										riotIdGameName
									)}&tagLine=${encodeURIComponent(
										riotIdTagline
									)}&region=${encodeURIComponent(region)}`;

									const winRateColor =
										winRate >= 60
											? "text-green-500"
											: winRate >= 50
											? "text-blue-500"
											: winRate >= 40
											? "text-yellow-500"
											: "text-red-500";

									return (
										<Link key={index} href={profileLink} legacyBehavior>
											<a
												onClick={(e) => handleProfileClick(e, profileLink)}
												className="flex items-center justify-between py-1.5 border-b border-[--card-border] last:border-b-0 hover:bg-[--card-bg] cursor-pointer transition-colors duration-150 px-1"
											>
												<div className="flex items-center min-w-0 gap-2">
													<div className="relative flex-shrink-0 w-6 h-6">
														<Image
															src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${teammate.championId}.png`}
															alt="Champion Icon"
															width={24}
															height={24}
															className="rounded-full border border-[--card-border]"
														/>
													</div>
													<div className="min-w-0">
														<p className="text-sm font-medium truncate">
															{riotIdGameName}
															<span className="text-[--text-secondary] ml-1 text-xs font-normal">
																#{riotIdTagline}
															</span>
														</p>
													</div>
												</div>

												<div className="flex items-center gap-3 flex-shrink-0 text-xs">
													<div className="text-center w-8">
														<p className="text-[--text-secondary] text-[10px]">
															Games
														</p>
														<p className="font-medium">
															{teammate.gamesPlayed}
														</p>
													</div>
													<div className="text-center w-12">
														<p className="text-[--text-secondary] text-[10px]">
															W/L
														</p>
														<p className="font-medium">
															<span className="text-[--success]">
																{teammate.wins}
															</span>
															<span className="text-[--text-secondary] mx-0.5">
																/
															</span>
															<span className="text-[--error]">
																{teammate.losses}
															</span>
														</p>
													</div>
													<div className="text-center w-8">
														<p className="text-[--text-secondary] text-[10px]">
															WR
														</p>
														<p className={`font-bold ${winRateColor}`}>
															{winRate}%
														</p>
													</div>
												</div>
											</a>
										</Link>
									);
								})}
							</div>
						) : (
							<div className="bg-[--card-bg] rounded-lg p-4 text-center">
								<p className="text-[--text-secondary]">
									No recurring teammates found.
								</p>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default RecentlyPlayedWith;
