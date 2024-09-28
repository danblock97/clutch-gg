import Image from "next/image";

const Profile = ({ accountData, profileData }) => {
	const profileIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileData.profileIconId}.jpg`;

	return (
		<div className="bg-[#1e1e2f] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-transparent hover:border-[#ffd700]">
			<div className="flex items-center p-6">
				{profileData?.profileIconId ? (
					<div className="relative">
						<div className="rounded-full overflow-hidden w-24 h-24 border-4 border-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 p-1 animate-pulse">
							<div className="rounded-full overflow-hidden w-full h-full">
								<Image
									src={profileIcon}
									alt="Player Icon"
									layout="responsive"
									width={96}
									height={96}
									className="rounded-full object-cover"
								/>
							</div>
						</div>

						{/* Level Badge */}
						<div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-sm font-bold py-1 px-3 rounded-full shadow-lg">
							{profileData?.summonerLevel}
						</div>
					</div>
				) : (
					<div className="bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center">
						<span className="text-white text-xl">N/A</span>
					</div>
				)}
				<div className="ml-6 flex-1">
					<h1 className="text-[#ffffff] text-2xl font-bold truncate">
						{`${accountData.gameName}#${accountData.tagLine}`}
					</h1>
				</div>
			</div>
		</div>
	);
};

export default Profile;
