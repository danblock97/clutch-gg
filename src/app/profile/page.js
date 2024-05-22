"use client";

import React, { useEffect } from "react";
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
		fetchData, // Add fetchData to manually trigger re-fetch
	} = useProfileData();

	// Use useEffect to set up the interval for refreshing the data
	useEffect(() => {
		const intervalId = setInterval(() => {
			fetchData(); // Manually trigger re-fetching of data
		}, 180000); // 180000 ms = 3 minutes

		return () => clearInterval(intervalId); // Clear interval on component unmount
	}, [fetchData]);

	if (error) {
		return <p className="text-red-500">{error}</p>;
	}

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="min-h-screen bg-[#0e1015] flex flex-col items-center p-4">
			<div className="max-w-screen-xl flex flex-col sm:flex-row w-full">
				{/* Left Section - Profile, Ranked, Champion */}
				<div className="w-full md:w-1/3 sm:pr-4 flex flex-col gap-4">
					{profileData && accountData && (
						<Profile accountData={accountData} profileData={profileData} />
					)}
					{rankedData && <RankedInfo rankedData={rankedData} />}
					{championMasteryData && (
						<ChampionMastery championMasteryData={championMasteryData} />
					)}
				</div>
				{/* Right Section - Match History */}
				<div className="w-full md:w-2/3 sm:pl-4">
					{matchDetails && (
						<MatchHistory
							matchDetails={matchDetails}
							selectedSummonerPUUID={profileData ? profileData.puuid : null}
							gameName={accountData ? accountData.gameName : null}
							tagLine={accountData ? accountData.tagLine : null}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
