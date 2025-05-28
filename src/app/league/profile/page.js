"use client";

import React, { useReducer, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Profile from "@/components/league/Profile";
import RankedInfo from "@/components/league/RankedInfo";
import SeasonRanks from "@/components/league/SeasonRanks";
import ChampionMastery from "@/components/league/ChampionMastery";
import MatchHistory from "@/components/league/MatchHistory";
import Last20GamesPerformance from "@/components/league/Last20GamesPerformance";
import Loading from "@/components/Loading";
import LiveGame from "@/components/league/LiveGame";
import RecentlyPlayedWith from "@/components/league/RecentlyPlayedWith";
import NoProfileFound from "@/components/league/NoProfileFound";
import ErrorPage from "@/components/ErrorPage";
import { fetchWithErrorHandling, extractErrorMessage } from "@/lib/errorUtils";

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
		const controller = new AbortController();
		const signal = controller.signal;

		(async () => {
			dispatch({ type: "FETCH_START" });
			try {
				const url = `/api/league/profile?gameName=${gameName}&tagLine=${tagLine}&region=${region}`;
				const data = await fetchWithErrorHandling(url, { signal });
				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (error) {
				if (error.name !== "AbortError") {
					console.error("League Profile fetch error:", error);
					dispatch({ type: "FETCH_FAILURE", payload: error });
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
				const errorInfo = await extractErrorMessage(response);
				const error = new Error(errorInfo.message);

				// Attach additional error details
				error.status = errorInfo.status;
				error.statusText = errorInfo.statusText;
				if (errorInfo.code) error.code = errorInfo.code;
				if (errorInfo.details) error.details = errorInfo.details;
				if (errorInfo.hint) error.hint = errorInfo.hint;

				throw error;
			}

			fetchProfileData();
		} catch (error) {
			console.error("League Profile update error:", error);
			dispatch({ type: "FETCH_FAILURE", payload: error });
		} finally {
			dispatch({ type: "UPDATE_END" });
		}
	};

	const handleChampionClick = (championId) => {
		dispatch({ type: "SET_SELECTED_CHAMPION", payload: championId });
	};

	if (state.isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loading />
			</div>
		);
	}
	if (state.error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<ErrorPage
					error={state.error}
					retryCountdown={0}
					onRetry={() => window.location.reload()}
				/>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative flex flex-col pb-12">
			{/* Profile Header Section */}
			<div className="w-full">
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
						region={region}
					/>
				) : (
					<p className="text-white">No profile data found.</p>
				)}
			</div>

			{/* Live Game Section (Conditionally Rendered) */}
			{state.liveGameData && state.isLiveGameOpen && (
				<div className="max-w-screen-xl w-full mx-auto px-4 mt-4">
					<LiveGame liveGameData={state.liveGameData} region={region} />
				</div>
			)}

			{/* Main Content Section */}
			<div className="max-w-screen-xl w-full mx-auto px-4 mt-8 flex flex-col gap-8">
				{/* Performance Overview */}
				{state.matchDetails && state.profileData && (
					<div className="w-full">
						<Last20GamesPerformance
							matchDetails={state.matchDetails}
							selectedSummonerPUUID={state.profileData.puuid}
							onChampionClick={handleChampionClick}
							selectedChampionId={state.selectedChampionId}
						/>
					</div>
				)}

				{/* Two-column layout for main content */}
				<div className="flex flex-col lg:flex-row gap-6">
					{/* Left Column: Stats & Info */}
					<div className="w-full lg:w-1/3 space-y-6">
						{/* Ranked Info section */}
						{state.rankedData ? (
							<RankedInfo rankedData={state.rankedData} />
						) : (
							<div className="card animate-pulse-custom h-32"></div>
						)}

						{/* Season Ranks - Moved here as requested */}
						{state.accountData && (
							<SeasonRanks
								gameName={state.accountData.gameName}
								tagLine={state.accountData.tagLine}
								region={region}
							/>
						)}

						{/* Recently Played With section */}
						{state.matchDetails && state.profileData ? (
							<RecentlyPlayedWith
								matchDetails={state.matchDetails}
								selectedSummonerPUUID={state.profileData.puuid}
								region={region}
							/>
						) : (
							<div className="card animate-pulse-custom h-64"></div>
						)}

						{/* Champion Mastery section */}
						{state.championMasteryData ? (
							<ChampionMastery
								championMasteryData={state.championMasteryData}
							/>
						) : (
							<div className="card animate-pulse-custom h-48"></div>
						)}
					</div>

					{/* Right Column: Match History */}
					<div className="w-full lg:w-2/3">
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
							<div className="card animate-pulse-custom h-96"></div>
						)}
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
