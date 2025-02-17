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

		// Filter teammates with more than 1 game
		const data = Object.values(teammateStats).filter(
			(teammate) => teammate.gamesPlayed > 1
		);
		// Limit to last 10 entries
		return data.slice(-10);
	}, [matchDetails, selectedSummonerPUUID]);

	const handleProfileClick = (e, link) => {
		e.preventDefault();
		setIsLoading(true);
		window.location.href = link; // Navigate after setting loading state
	};

	return (
		<div
			className="
        p-2
        rounded-md
        text-white
        border border-[#2f2f46]
        bg-gradient-to-br from-[#232337] to-[#1b1b2d]
        shadow-sm
        mt-4
      "
		>
			<h3 className="text-xs mb-2 font-semibold tracking-wide">
				Recently Played With (Last 10 Games)
			</h3>

			{teammatesData.length > 0 ? (
				teammatesData.map((teammate, index) => {
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

					return (
						<Link key={index} href={profileLink}>
							<div
								onClick={(e) => handleProfileClick(e, profileLink)}
								className="
                flex
                items-center
                justify-between
                mb-1
                p-1
                bg-[#2c2c3d]
                rounded-sm
                border
                border-[#3d3d57]
                cursor-pointer
                transition-shadow
                duration-200
                hover:shadow-md
              "
							>
								{/* Left: Champion Icon & Player Info */}
								<div className="flex items-center w-2/5">
									<Image
										src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${teammate.championId}.png`}
										alt="Champion Icon"
										width={24}
										height={24}
										className="rounded-full border border-gray-500"
									/>
									<div className="ml-1">
										<p className="text-[10px] font-semibold">
											{riotIdGameName}
											<span className="text-gray-400">#{riotIdTagline}</span>
										</p>
										<p className="text-[9px] text-gray-400">
											Level {teammate.summonerLevel}
										</p>
									</div>
								</div>

								{/* Middle: Wins/Losses and Games Played */}
								<div className="flex flex-col items-center w-2/5">
									<p className="text-[10px]">
										{teammate.wins}W / {teammate.losses}L
									</p>
									<p className="text-[9px] text-gray-400">
										{teammate.gamesPlayed} Played
									</p>
								</div>

								{/* Right: Win Rate */}
								<div className="flex flex-col items-end w-1/5">
									<p className="text-[10px]">{winRate}%</p>
								</div>
							</div>
						</Link>
					);
				})
			) : (
				<div className="text-[10px] text-gray-300">No teammates found.</div>
			)}
		</div>
	);
};

export default RecentlyPlayedWith;
