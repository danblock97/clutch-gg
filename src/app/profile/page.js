"use client";

import React from "react";
import Profile from "@/components/Profile";
import RankedInfo from "@/components/RankedInfo";
import ChampionMastery from "@/components/ChampionMastery";
import MatchHistory from "@/components/MatchHistory";
import Loading from "@/components/Loading";
import useProfileData from "../hooks/useProfileData";

const ProfilePage = () => {
	const {
		profileData,
		accountData,
		rankedData,
		championMasteryData,
		matchDetails,
		error,
		isLoading,
	} = useProfileData();

	const selectedSummonerPUUID = profileData ? profileData.puuid : null;

	if (error) {
		return <p className="text-red-500">{error}</p>;
	}

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="min-h-screen bg-[#0e1015] flex justify-center items-start p-4">
			<div className="max-w-screen-xl flex flex-col sm:flex-row w-full">
				{/* Left Section - Profile, Ranked, Champion */}
				<div className="w-full md:w-1/3 pr-4">
					<div className="pb-4">
						{profileData && accountData ? (
							<Profile accountData={accountData} profileData={profileData} />
						) : null}
					</div>
					<div className="pb-4">
						{rankedData ? <RankedInfo rankedData={rankedData} /> : null}
					</div>
					<div>
						{championMasteryData ? (
							<ChampionMastery championMasteryData={championMasteryData} />
						) : null}
					</div>
				</div>
				{/* Right Section - Match History */}
				<div className="w-full  md:w-2/3  pl-4">
					{matchDetails ? (
						<MatchHistory
							matchDetails={matchDetails}
							selectedSummonerPUUID={selectedSummonerPUUID}
						/>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
