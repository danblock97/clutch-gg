"use client";

import React, { useState, useEffect, useCallback } from "react";
import Profile from "@/components/Profile";
import RankedInfo from "@/components/RankedInfo";
import ChampionMastery from "@/components/ChampionMastery";
import MatchHistory from "@/components/MatchHistory";
import LiveGameBanner from "@/components/LiveGameBanner";
import Loading from "@/components/Loading";

const ProfilePage = ({ searchParams }) => {
	const { gameName, tagLine } = searchParams;
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
				`/api/league/profile?gameName=${gameName}&tagLine=${tagLine}`
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
	}, [gameName, tagLine]);

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
				body: JSON.stringify({ gameName, tagLine }),
			});
			const result = await response.json();
			await fetchProfileData(); // Fetch new data after update
		} catch (error) {
			console.error("Error triggering update:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	if (isLoading) {
		return (
			<div className="bg-[#0e1015] min-h-screen flex items-center justify-center">
				<Loading />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-[#0e1015] flex items-center justify-center">
				<p className="text-red-500">{error}</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0e1015] relative">
			{/* Profile Section taking full width */}
			<div className="w-full bg-black rounded-b-3xl shadow-[0px_10px_20px_rgba(255,255,255,0.1)]">
				{profileData && accountData ? (
					<Profile
						accountData={accountData}
						profileData={profileData}
						rankedData={rankedData}
					/>
				) : (
					<p className="text-white">No profile data found.</p>
				)}
			</div>

			{/* Other Components - Centered */}
			<div className="max-w-screen-xl mx-auto flex flex-col items-center gap-8 mt-8">
				<div className="w-full flex flex-col md:flex-row gap-4">
					<div className="md:w-1/3 flex flex-col gap-4">
						{rankedData && <RankedInfo rankedData={rankedData} />}
						{championMasteryData && (
							<ChampionMastery championMasteryData={championMasteryData} />
						)}
					</div>
					<div className="md:w-2/3 flex flex-col gap-4">
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
								selectedSummonerPUUID={profileData?.puuid || null}
								gameName={accountData?.gameName}
								tagLine={accountData?.tagLine}
							/>
						)}
					</div>
				</div>
			</div>

			{/* Update Button */}
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
