import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const RecentlyPlayedWith = ({
	matchDetails,
	selectedSummonerPUUID,
	region,
}) => {
	const [isLoading, setIsLoading] = useState(false);

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

	const handleProfileClick = (e, link) => {
		e.preventDefault();
		setIsLoading(true);
		window.location.href = link; // Navigate after setting loading state
	};

	return (
		<div
			className="
        p-4
        rounded-xl
        text-white
        border border-[#2f2f46]
        bg-gradient-to-br from-[#232337] to-[#1b1b2d]
        shadow-[0_4px_15px_rgba(0,0,0,0.6)]
        relative
      "
		>
			<h3 className="text-sm mb-4 font-semibold tracking-wide">
				Recently Played With (Recent 20 Games)
			</h3>

			{teammatesData.map((teammate, index) => {
				const winRate = ((teammate.wins / teammate.gamesPlayed) * 100).toFixed(
					0
				);

				const { riotIdGameName, riotIdTagline } = teammate;
				const profileLink = `/league/profile?gameName=${encodeURIComponent(
					riotIdGameName
				)}&tagLine=${encodeURIComponent(
					riotIdTagline
				)}&region=${encodeURIComponent(region)}`;

				return (
					<Link key={index} href={profileLink}>
						<div
							onClick={(e) => handleProfileClick(e, profileLink)}
							className="
                flex
                items-center
                justify-between
                mb-2
                p-2
                bg-[#2c2c3d]
                rounded-md
                border
                border-[#3d3d57]
                cursor-pointer
                transition-shadow
                duration-200
                hover:shadow-[0_4px_14px_rgba(0,0,0,0.6)]
              "
						>
							{/* Left: Champion Icon & Player Info */}
							<div className="flex items-center w-2/5">
								<Image
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${teammate.championId}.png`}
									alt="Champion Icon"
									width={28}
									height={28}
									className="rounded-full border-2 border-gray-500"
								/>
								<div className="ml-2">
									<p className="text-xs font-semibold leading-tight text-white">
										{riotIdGameName}
										<span className="text-gray-400">#{riotIdTagline}</span>
									</p>
									<p className="text-xs text-gray-400">
										Level {teammate.summonerLevel}
									</p>
								</div>
							</div>

							{/* Middle: Wins/Losses and Games Played */}
							<div className="flex flex-col items-center w-2/5">
								<p className="text-xs text-white leading-tight">
									{teammate.wins}W / {teammate.losses}L
								</p>
								<p className="text-xs text-gray-400">
									{teammate.gamesPlayed} Played
								</p>
							</div>

							{/* Right: Win Rate */}
							<div className="flex flex-col items-end w-1/5">
								<p className="text-xs text-white">{winRate}%</p>
							</div>
						</div>
					</Link>
				);
			})}
		</div>
	);
};

export default RecentlyPlayedWith;
