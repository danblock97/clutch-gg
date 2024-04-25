// Profile component
import Image from "next/image";

const Profile = ({ accountData, profileData }) => {
	const profileIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileData.profileIconId}.jpg`;

	return (
		<div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg p-6">
			<div className="flex items-center">
				{profileData?.profileIconId ? (
					<div className="relative">
						<Image
							src={profileIcon}
							alt="Player Icon"
							width={80}
							height={80}
							className="rounded-full border-4 border-white"
						/>
						<div className="absolute bottom-0 left-5 rounded-full bg-gray-800 text-white text-xs font-semibold py-1 px-2">
							{profileData?.summonerLevel}
						</div>
					</div>
				) : (
					<div className="bg-gray-600 rounded-full w-20 h-20"></div>
				)}
				<div className="ml-6">
					<h1 className="text-white text-3xl font-semibold">
						{accountData.gameName}#{accountData.tagLine}
					</h1>
				</div>
			</div>
		</div>
	);
};

export default Profile;
