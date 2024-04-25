"use client";

import React from "react";
import Profile from "@/components/Profile";
import RankedInfo from "@/components/RankedInfo";
import ChampionMastery from "@/components/ChampionMastery";
import MatchHistory from "@/components/MatchHistory";
import useProfileData from "../hooks/useProfileData";

const ProfilePage = () => {
	const {
		profileData,
		accountData,
		rankedData,
		championMasteryData,
		matchDetails, // Add matchDetails from useProfileData hook
		error,
	} = useProfileData();

	const selectedSummonerPUUID = profileData ? profileData.puuid : null;

	return (
		<div className="min-h-screen bg-gray-700 flex justify-center items-start p-4">
			<div className="max-w-screen-xl flex flex-col sm:flex-row w-full">
				{/* Left Section - Profile, Ranked, Champion */}
				<div className="w-full md:w-1/3 pr-4">
					<div className="pb-4">
						{profileData && accountData ? (
							<Profile accountData={accountData} profileData={profileData} />
						) : (
							<p className="text-red-500">{error ? error : "Loading..."}</p>
						)}
					</div>
					<div className="pb-4">
						{rankedData ? (
							<RankedInfo rankedData={rankedData} />
						) : (
							<p>Loading...</p>
						)}
					</div>
					<div>
						{championMasteryData ? (
							<ChampionMastery championMasteryData={championMasteryData} />
						) : (
							<p>Loading...</p>
						)}
					</div>
				</div>
				{/* Right Section - Match History */}
				<div className="w-full  md:w-2/3  pl-4">
					{matchDetails ? (
						<MatchHistory
							matchDetails={matchDetails}
							selectedSummonerPUUID={selectedSummonerPUUID}
						/>
					) : (
						<p>Loading...</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
