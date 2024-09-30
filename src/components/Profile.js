import Image from "next/image";

const Profile = ({ accountData, profileData, rankedData }) => {
	const soloRankedData = rankedData.find(
		(item) => item.queueType === "RANKED_SOLO_5x5"
	);

	// Get the ranked icon based on the summoner's tier
	const rankedIcon = soloRankedData
		? `/images/rankedEmblems/${soloRankedData.tier.toLowerCase()}.webp`
		: null;

	return (
		<div className="relative w-full py-10 shadow-md overflow-hidden">
			{/* Full-width container with glow and rounded bottom corners */}
			<div className="relative w-full max-w-screen-xl mx-auto p-6 flex items-center justify-between">
				{/* Profile Icon */}
				<div className="relative">
					<div className="rounded-full overflow-hidden w-24 h-24 border-4 border-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
						<Image
							src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileData.profileIconId}.jpg`}
							alt="Player Icon"
							layout="responsive"
							width={96}
							height={96}
							className="rounded-full object-cover"
						/>
					</div>

					{/* Region Badge */}
					<div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded-full shadow-lg">
						{profileData.summonerLevel}
					</div>
				</div>

				{/* Name, Tag, Rank */}
				<div className="ml-6 flex-1">
					<h1 className="text-3xl font-bold text-white">
						{`${accountData.gameName}#${accountData.tagLine}`}
					</h1>
					{soloRankedData && (
						<div className="mt-2 flex items-center">
							{/* Ranked Icon */}
							{rankedIcon && (
								<Image
									src={rankedIcon}
									alt={`${soloRankedData.tier} Emblem`}
									width={40}
									height={40}
									className="rounded-full mr-4"
								/>
							)}
							<div>
								<p className="text-blue-400 font-semibold">
									{soloRankedData.tier} {soloRankedData.rank}{" "}
									{soloRankedData.leaguePoints} LP
								</p>
								<p className="text-gray-400 text-sm">
									{soloRankedData.wins}W - {soloRankedData.losses}L (
									{(
										(soloRankedData.wins /
											(soloRankedData.wins + soloRankedData.losses)) *
										100
									).toFixed(1)}
									% WR)
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Profile;
