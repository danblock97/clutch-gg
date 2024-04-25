"use client";

import Profile from "@/components/Profile";
import RankedInfo from "@/components/RankedInfo";
import ChampionMastery from "@/components/ChampionMastery";
import useProfileData from "../hooks/useProfileData";

const ProfilePage = () => {
	const { profileData, accountData, rankedData, championMasteryData, error } =
		useProfileData();

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
			<div className="flex p-4">
				{championMasteryData ? (
					<ChampionMastery championMasteryData={championMasteryData} />
				) : (
					<p>Loading...</p>
				)}
			</div>
		</div>
	);
};

export default ProfilePage;
