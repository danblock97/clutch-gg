import Image from "next/image";

const Profile = ({ accountData, profileData }) => {
	const profileIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileData.profileIconId}.jpg`;

	return (
		<div className="bg-[#13151b] rounded-lg overflow-hidden shadow-[0_0_20px_rgba(255,215,0,0.8)] p-6 border-4 border-[#13151b]">
			<div className="flex items-center relative">
				{profileData?.profileIconId ? (
					<div className="relative">
						{/* Profile Icon with gold glow effect */}
						<div className="rounded-lg overflow-hidden w-20 h-20 border-4 border-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 p-1 shadow-[0_0_15px_rgba(255,215,0,0.6)]">
							<div className="rounded-lg overflow-hidden w-full h-full">
								<Image
									src={profileIcon}
									alt="Player Icon"
									layout="fill"
									objectFit="cover"
									className="rounded-lg"
								/>
							</div>
						</div>

						{/* Smaller, neat Level Badge with gold glow */}
						<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#ffd700] text-white text-xs font-medium py-0.5 px-2 rounded-full shadow-[0_0_10px_rgba(255,215,0,0.8)]">
							{profileData?.summonerLevel}
						</div>
					</div>
				) : (
					<div className="bg-gray-600 rounded-lg w-20 h-20"></div>
				)}
				<div className="ml-6 w-full">
					<h1 className="text-[#979aa0] text-lg sm:text-2xl font-semibold break-words sm:break-all">
						{`${accountData.gameName}#${accountData.tagLine}`}
					</h1>
				</div>
			</div>
		</div>
	);
};

export default Profile;
