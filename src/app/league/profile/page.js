"use client";

import React, { useState, useEffect, useCallback } from "react";
import Profile from "@/components/league/Profile";
import RankedInfo from "@/components/league/RankedInfo";
import ChampionMastery from "@/components/league/ChampionMastery";
import MatchHistory from "@/components/league/MatchHistory";
import LiveGameBanner from "@/components/league/LiveGameBanner";
import Loading from "@/components/Loading";

const ProfilePage = ({ searchParams }) => {
	const { gameName, tagLine, region } = searchParams;
	const [profileData, setProfileData] = useState(null);
	const [accountData, setAccountData] = useState(null);
	const [rankedData, setRankedData] = useState(null);
	const [championMasteryData, setChampionMasteryData] = useState(null);
	const [matchDetails, setMatchDetails] = useState(null);
	const [liveGameData, setLiveGameData] = useState(null);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);

	const fetchProfileData = useCallback(async () => {
		try {
			const response = await fetch(
				`/api/league/profile?gameName=${encodeURIComponent(
					gameName
				)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`
			);
			if (!response.ok) {
				throw new Error("Failed to fetch profile");
			}
			const data = await response.json();
			setProfileData(data.profiledata);
			setAccountData(data.accountdata);
			setRankedData(data.rankeddata);
			setChampionMasteryData(data.championmasterydata);
			setMatchDetails(data.matchdetails);
			setLiveGameData(data.livegamedata);
		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	}, [gameName, tagLine, region]);

	useEffect(() => {
		fetchProfileData();
	}, [fetchProfileData]);

	const triggerUpdate = async () => {
		setIsUpdating(true);
		try {
			const response = await fetch("/api/league/profile", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": process.env.NEXT_PUBLIC_UPDATE_API_KEY,
				},
				body: JSON.stringify({ gameName, tagLine, region }),
			});
			await fetchProfileData();
		} catch (error) {
			console.error("Error triggering update:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	if (isLoading) {
		return (
			<div className="bg-[#0e1015]">
				<Loading />
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-screen min-h-screen bg-[#0e1015] items-center p-4">
				<p className="text-red-500 text-center">{error}</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0e1015] flex flex-col items-center p-4">
			<div className="max-w-screen-xl flex w-full gap-4">
				{" "}
				{/* Removed flex-direction from sm */}
				{/* Left Section - Profile, Ranked, Champion */}
				<div className="w-full md:w-1/3 flex flex-col gap-4">
					{profileData && accountData ? (
						<Profile accountData={accountData} profileData={profileData} />
					) : (
						<p className="text-white">No profile data found.</p>
					)}
					{rankedData && <RankedInfo rankedData={rankedData} />}
					{championMasteryData && (
						<ChampionMastery championMasteryData={championMasteryData} />
					)}
				</div>
				{/* Right Section - Match History */}
				<div className="w-full md:w-2/3 flex flex-col gap-4 justify-start">
					{" "}
					{/* Added justify-start to align */}
					{liveGameData && (
						<LiveGameBanner
							liveGameData={liveGameData}
							gameName={accountData?.gameName}
							tagLine={accountData?.tagLine}
						/>
					)}
					{matchDetails && (
						<MatchHistory
							matchDetails={matchDetails}
							selectedSummonerPUUID={profileData ? profileData.puuid : null}
							gameName={accountData?.gameName}
							tagLine={accountData?.tagLine}
							region={region}
						/>
					)}
				</div>
			</div>
			<div className="fixed top-28 right-4">
				<button
					onClick={triggerUpdate}
					className={`px-4 py-2 bg-[#13151b] text-white rounded ${
						isUpdating ? "opacity-50 cursor-not-allowed" : ""
					}`}
					disabled={isUpdating}
				>
					{isUpdating ? "Updating..." : "Update Profile"}
				</button>
			</div>
		</div>
	);
};

export default ProfilePage;
