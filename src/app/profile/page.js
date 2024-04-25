"use client";

import Profile from "@/components/Profile";
import useProfileData from "../hooks/useProfileData";
import RankedInfo from "@/components/RankedInfo";

const ProfilePage = () => {
	const { profileData, accountData, rankedData, error } = useProfileData();

	return (
		<div className="min-h-screen bg-gray-700 overflow-hidden">
			<div className="p-4">
				{profileData && accountData ? (
					<Profile accountData={accountData} profileData={profileData} />
				) : (
					<p className="text-red-500">{error ? error : "Loading..."}</p>
				)}
			</div>
			<div className="flex p-4">
				{rankedData ? (
					<RankedInfo rankedData={rankedData} />
				) : (
					<p>Loading...</p>
				)}
			</div>
		</div>
	);
};

export default ProfilePage;
