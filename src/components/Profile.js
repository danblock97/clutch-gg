import Image from "next/image";

const Profile = ({ accountData, profileData }) => {
	const profileIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileData.profileIconId}.jpg`;

	return (
		<div className="relative bg-opacity-50 bg-black flex items-end p-4 h-[100px] md:h-[100px] lg:h-[200px]">
			{profileData?.profileIconId ? (
				<Image
					src={profileIcon}
					alt="Player Icon"
					width={80}
					height={80}
					className="rounded-full"
				/>
			) : (
				<div className="bg-gray-400 rounded-full w-20 h-20"></div>
			)}
			<div className="text-white ml-4">
				<h1 className="text-3xl font-bold">
					{accountData.gameName}#{accountData.tagLine}
				</h1>
			</div>
		</div>
	);
};

export default Profile;
