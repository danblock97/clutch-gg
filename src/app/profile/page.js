"use client";

import React, { useState, useEffect, useCallback } from "react";
import Profile from "@/components/Profile";
import RankedInfo from "@/components/RankedInfo";
import ChampionMastery from "@/components/ChampionMastery";
import MatchHistory from "@/components/MatchHistory";
import Last10GamesPerformance from "@/components/Last10GamesPerformance";
import Loading from "@/components/Loading";
import LiveGame from "@/components/LiveGame"; // Import LiveGame component

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
	const [isLiveGameOpen, setIsLiveGameOpen] = useState(false); // For expandable live game
	const [isUpdating, setIsUpdating] = useState(false); // For update button state

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
			setLiveGameData(data.livegamedata); // Ensure liveGameData is set correctly
		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	}, [gameName, tagLine]);

	useEffect(() => {
		fetchProfileData();
	}, [fetchProfileData]);

	// Toggle Live Game Expansion
	const toggleLiveGame = () => {
		setIsLiveGameOpen((prev) => !prev);
	};

	// Function to trigger profile update
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
			await fetchProfileData(); // Fetch new data after update, including liveGameData
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
			{/* Profile Section */}
			<div
				className={`w-full bg-black rounded-b-3xl ${
					liveGameData
						? "shadow-[0px_15px_10px_-5px_rgba(0,153,255,0.8)] animate-pulse"
						: "shadow-[0px_15px_10px_-5px_rgba(255,255,255,0.5)]"
				}`}
			>
				{profileData && accountData ? (
					<Profile
						accountData={accountData}
						profileData={profileData}
						rankedData={rankedData}
						liveGameData={liveGameData}
						toggleLiveGame={toggleLiveGame}
						isLiveGameOpen={isLiveGameOpen}
						triggerUpdate={triggerUpdate} // Pass the triggerUpdate function to Profile
						isUpdating={isUpdating} // Pass the updating state
					/>
				) : (
					<p className="text-white">No profile data found.</p>
				)}
			</div>

			{/* Live Game Details (Expandable) */}
			{liveGameData && isLiveGameOpen && (
				<div className="max-w-screen-xl mx-auto mt-4">
					<LiveGame liveGameData={liveGameData} />
				</div>
			)}

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
						{/* Last 10 Games Performance */}
						{matchDetails && profileData && (
							<Last10GamesPerformance
								matchDetails={matchDetails}
								selectedSummonerPUUID={profileData.puuid}
							/>
						)}

						{/* Match History */}
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
		</div>
	);
};

export default ProfilePage;
