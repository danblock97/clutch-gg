"use client";

import React, { useReducer, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Profile from "@/components/league/Profile";
import RankedInfo from "@/components/league/RankedInfo";
import ChampionMastery from "@/components/league/ChampionMastery";
import MatchHistory from "@/components/league/MatchHistory";
import Last20GamesPerformance from "@/components/league/Last20GamesPerformance";
import Loading from "@/components/Loading";
import LiveGame from "@/components/league/LiveGame";
import RecentlyPlayedWith from "@/components/league/RecentlyPlayedWith";
import DiscordBotBanner from "@/components/DiscordBotBanner";
import NoProfileFound from "@/components/league/NoProfileFound";

const initialState = {
	profileData: null,
	accountData: null,
	rankedData: null,
	championMasteryData: null,
	matchDetails: null,
	liveGameData: null,
	error: null,
	isLoading: true,
	isLiveGameOpen: false,
	isUpdating: false,
	selectedChampionId: null,
};

function reducer(state, action) {
	switch (action.type) {
		case "FETCH_START":
			return { ...state, isLoading: true, error: null };
		case "FETCH_SUCCESS":
			return {
				...state,
				profileData: action.payload.profiledata,
				accountData: action.payload.accountdata,
				rankedData: action.payload.rankeddata,
				championMasteryData: action.payload.championmasterydata,
				matchDetails: action.payload.matchdetails,
				liveGameData: action.payload.livegamedata,
				isLoading: false,
			};
		case "FETCH_FAILURE":
			return { ...state, error: action.payload, isLoading: false };
		case "TOGGLE_LIVE_GAME":
			return { ...state, isLiveGameOpen: !state.isLiveGameOpen };
		case "SET_SELECTED_CHAMPION":
			return {
				...state,
				selectedChampionId:
					state.selectedChampionId === action.payload ? null : action.payload,
			};
		case "UPDATE_START":
			return { ...state, isUpdating: true, error: null };
		case "UPDATE_END":
			return { ...state, isUpdating: false };
		default:
			return state;
	}
}

const ProfilePageContent = () => {
	const searchParams = useSearchParams();
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");
	const region = searchParams.get("region");

	const [state, dispatch] = useReducer(reducer, initialState);

	const fetchProfileData = useCallback(() => {
		// Create a new controller for each fetch
		const controller = new AbortController();
		const signal = controller.signal;

		(async () => {
			dispatch({ type: "FETCH_START" });
			try {
				const response = await fetch(
					`/api/league/profile?gameName=${gameName}&tagLine=${tagLine}&region=${region}`,
					{ signal }
				);
				if (!response.ok) {
					dispatch({
						type: "FETCH_FAILURE",
						payload: "Failed to fetch profile",
					});
					return;
				}
				const data = await response.json();
				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (error) {
				// Skip abort errors
				if (error.name !== "AbortError") {
					dispatch({ type: "FETCH_FAILURE", payload: error.message });
				}
			}
		})();

		return () => controller.abort();
	}, [gameName, tagLine, region]);

	useEffect(() => {
		const abortFetch = fetchProfileData();
		return () => {
			abortFetch && abortFetch();
		};
	}, [fetchProfileData]);

	const toggleLiveGame = () => dispatch({ type: "TOGGLE_LIVE_GAME" });

	const triggerUpdate = async () => {
		dispatch({ type: "UPDATE_START" });
		try {
			const response = await fetch("/api/league/profile", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": process.env.NEXT_PUBLIC_UPDATE_API_KEY,
				},
				body: JSON.stringify({ gameName, tagLine, region }),
			});
			if (!response.ok) {
				throw new Error("Failed to trigger update");
			}
			await response.json();
			fetchProfileData();
		} catch (error) {
			console.error("Error triggering update:", error);
			dispatch({ type: "FETCH_FAILURE", payload: error.message });
		} finally {
			dispatch({ type: "UPDATE_END" });
		}
	};

	const handleChampionClick = (championId) => {
		dispatch({ type: "SET_SELECTED_CHAMPION", payload: championId });
	};

	if (state.isLoading) {
		return (
			<div className="bg-[#0e1015] min-h-screen flex items-center justify-center">
				<Loading />
			</div>
		);
	}

	if (state.error) {
		return (
			<div className="min-h-screen bg-[#0e1015] flex items-center justify-center">
				<NoProfileFound />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0e1015] relative flex flex-col">
			{/* Top section: Profile and Live Game */}
			<div className="flex-1">
				<div
					className={`w-full bg-black rounded-b-3xl ${
						state.liveGameData
							? "shadow-[0px_15px_10px_-5px_rgba(0,153,255,0.8)]"
							: "shadow-[0px_15px_10px_-5px_rgba(255,255,255,0.5)]"
					}`}
				>
					{state.profileData && state.accountData ? (
						<Profile
							accountData={state.accountData}
							profileData={state.profileData}
							rankedData={state.rankedData}
							liveGameData={state.liveGameData}
							toggleLiveGame={toggleLiveGame}
							isLiveGameOpen={state.isLiveGameOpen}
							triggerUpdate={triggerUpdate}
							isUpdating={state.isUpdating}
						/>
					) : (
						<p className="text-white">No profile data found.</p>
					)}
				</div>
				{state.liveGameData && state.isLiveGameOpen && (
					<div className="max-w-screen-xl mx-auto mt-4">
						<LiveGame liveGameData={state.liveGameData} region={region} />
					</div>
				)}
			</div>

			{/* Bottom section: Main content */}
			<div className="w-full md:max-w-screen-xl mx-auto flex flex-col items-center gap-8 mt-8 flex-1">
				<div className="w-full flex flex-col md:flex-row gap-4">
					<div className="md:w-1/3 flex flex-col gap-4">
						{state.rankedData ? (
							<RankedInfo rankedData={state.rankedData} />
						) : (
							<Loading />
						)}
						{state.matchDetails && state.profileData ? (
							<RecentlyPlayedWith
								matchDetails={state.matchDetails}
								selectedSummonerPUUID={state.profileData.puuid}
								region={region}
							/>
						) : (
							<Loading />
						)}
						{state.championMasteryData ? (
							<ChampionMastery
								championMasteryData={state.championMasteryData}
							/>
						) : (
							<Loading />
						)}
					</div>
					<div className="md:w-2/3 flex flex-col md:flex-row gap-4">
						<div className="flex-1 flex flex-col gap-4">
							{state.matchDetails && state.profileData ? (
								<Last20GamesPerformance
									matchDetails={state.matchDetails}
									selectedSummonerPUUID={state.profileData.puuid}
									onChampionClick={handleChampionClick}
									selectedChampionId={state.selectedChampionId}
								/>
							) : (
								<Loading />
							)}
							{state.matchDetails ? (
								<MatchHistory
									matchDetails={state.matchDetails}
									selectedSummonerPUUID={state.profileData?.puuid || null}
									gameName={state.accountData?.gameName}
									tagLine={state.accountData?.tagLine}
									region={region}
									selectedChampionId={state.selectedChampionId}
								/>
							) : (
								<Loading />
							)}
						</div>
						{/* Show DiscordBotBanner only on medium and larger devices */}
						<div className="hidden md:flex justify-center md:w-auto">
							<DiscordBotBanner />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const ProfilePage = () => (
	<Suspense fallback={<Loading />}>
		<ProfilePageContent />
	</Suspense>
);

export default ProfilePage;
