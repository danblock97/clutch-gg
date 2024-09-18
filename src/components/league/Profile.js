import Image from "next/image";

const Profile = ({ accountData, profileData }) => {
	const profileIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileData.profileIconId}.jpg`;

	return (
		<div className="bg-[#13151b] rounded-lg overflow-hidden shadow-lg p-6">
			<div className="flex items-center">
				{profileData?.profileIconId ? (
					<div className="relative">
						<div className="rounded-full border-4 border-[#979aa0] overflow-hidden w-20 h-20">
							<Image
								src={profileIcon}
								alt="Player Icon"
								layout="fill"
								objectFit="cover"
							/>
						</div>
						<div className="absolute bottom-0 left-5 bg-gray-800 text-[#979aa0] text-xs font-semibold py-1 px-2 rounded-full">
							{profileData?.summonerLevel}
						</div>
					</div>
				) : (
					<div className="bg-gray-600 rounded-full w-20 h-20"></div>
				)}
				<div className="ml-6 w-full">
					<h1 className="text-[#979aa0] text-lg sm:text-2xl font-semibold break-words sm:break-all w-full">
						{`${accountData.gameName}#${accountData.tagLine}`}
					</h1>
				</div>
			</div>
		</div>
	);
};

export default Profile;
