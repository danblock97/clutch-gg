"use client";

import React, { useReducer, useCallback, useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import Profile from "@/components/league/Profile";
import RankedInfo from "@/components/league/RankedInfo";
import SeasonRanks from "@/components/league/SeasonRanks";
import ChampionMastery from "@/components/league/ChampionMastery";
import MatchHistory from "@/components/league/MatchHistory";
import Last20GamesPerformance from "@/components/league/Last20GamesPerformance";
import Loading from "@/components/Loading";
import LiveGame from "@/components/league/LiveGame";
import RecentlyPlayedWith from "@/components/league/RecentlyPlayedWith";
import ErrorPage from "@/components/ErrorPage";
import { fetchWithErrorHandling, extractErrorMessage } from "@/lib/errorUtils";

// SWR fetcher for match details
const matchFetcher = (url) => fetch(url).then((res) => {
	if (!res.ok) throw new Error("Failed to fetch match");
	return res.json();
});

// Hook to fetch multiple match details with SWR
const useMatchDetails = (matchIds) => {
	const [loadedMatches, setLoadedMatches] = useState({});
	const [loadingCount, setLoadingCount] = useState(0);

	// Only fetch the first 20 match IDs for performance stats
	const matchIdsToFetch = useMemo(() => {
		return (matchIds || []).slice(0, 20);
	}, [matchIds]);

	// Track loaded matches
	useEffect(() => {
		if (!matchIdsToFetch || matchIdsToFetch.length === 0) return;

		let isMounted = true;
		setLoadingCount(matchIdsToFetch.length);

		// Fetch matches in parallel
		matchIdsToFetch.forEach(async (matchId) => {
			if (loadedMatches[matchId]) {
				setLoadingCount(prev => Math.max(0, prev - 1));
				return;
			}

			try {
				const response = await fetch(`/api/league/match/${matchId}`);
				if (response.ok) {
					const data = await response.json();
					if (isMounted) {
						setLoadedMatches(prev => ({
							...prev,
							[matchId]: data
						}));
					}
				}
			} catch (error) {
				console.error(`Failed to fetch match ${matchId}:`, error);
			} finally {
				if (isMounted) {
					setLoadingCount(prev => Math.max(0, prev - 1));
				}
			}
		});

		return () => {
			isMounted = false;
		};
	}, [matchIdsToFetch]); // Remove loadedMatches from dependencies to avoid re-fetching

	// Convert loaded matches object to array, maintaining order from matchIds
	const matchDetailsArray = useMemo(() => {
		return matchIdsToFetch
			.map(id => loadedMatches[id])
			.filter(Boolean);
	}, [matchIdsToFetch, loadedMatches]);

	return {
		matchDetails: matchDetailsArray,
		isLoading: loadingCount > 0,
		loadedCount: matchDetailsArray.length,
		totalCount: matchIdsToFetch.length,
	};
};

const initialState = {
	profileData: null,
	accountData: null,
	rankedData: null,
	championMasteryData: null,
	matchIds: null, // Changed from matchDetails to matchIds
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
				matchIds: action.payload.matchIds, // Changed from matchdetails to matchIds
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

export default function ProfilePageContent({ gameName, tagLine, region }) {
	const [state, dispatch] = useReducer(reducer, initialState);
	
	// Lazy load match details client-side for performance stats
	const { 
		matchDetails: loadedMatchDetails, 
		isLoading: matchesLoading, 
		loadedCount, 
		totalCount 
	} = useMatchDetails(state.matchIds);

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
			<ErrorPage
				error={state.error}
				onRetry={() => window.location.reload()}
			/>
		);
	}

	// Determine if we have enough match data for stats components
	const hasEnoughMatchData = loadedMatchDetails && loadedMatchDetails.length >= 5;

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
					<LiveGame
						liveGameData={state.liveGameData}
						region={region}
					/>
				</div>
			)}

			{/* Main Content Section */}
			<div className="max-w-screen-xl w-full mx-auto px-4 mt-8 flex flex-col gap-8">
				{/* Performance Overview - Shows loading indicator while matches load */}
				{state.matchIds && state.profileData && (
					<div className="w-full">
						{hasEnoughMatchData ? (
							<Last20GamesPerformance
								matchDetails={loadedMatchDetails}
								selectedSummonerPUUID={state.profileData.puuid}
								onChampionClick={handleChampionClick}
								selectedChampionId={state.selectedChampionId}
							/>
						) : (
							<div className="card p-4">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold text-[--text-primary]">
										Recent Performance
									</h3>
									<span className="text-sm text-[--text-secondary]">
										Loading matches... ({loadedCount}/{totalCount})
									</span>
								</div>
								<div className="animate-pulse space-y-3">
									<div className="h-24 bg-gray-700/50 rounded-lg"></div>
									<div className="flex gap-4">
										{[...Array(5)].map((_, i) => (
											<div key={i} className="flex-1 h-16 bg-gray-700/50 rounded-lg"></div>
										))}
									</div>
								</div>
							</div>
						)}
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

						{/* Recently Played With section - Uses loaded match data */}
						{state.matchIds && state.profileData ? (
							hasEnoughMatchData ? (
								<RecentlyPlayedWith
									matchDetails={loadedMatchDetails}
									selectedSummonerPUUID={state.profileData.puuid}
									region={region}
								/>
							) : (
								<div className="card p-4">
									<h3 className="text-lg font-semibold text-[--text-primary] mb-4">
										Recently Played With
									</h3>
									<div className="animate-pulse space-y-3">
										{[...Array(5)].map((_, i) => (
											<div key={i} className="flex items-center gap-3">
												<div className="w-8 h-8 bg-gray-700/50 rounded-full"></div>
												<div className="flex-1 h-4 bg-gray-700/50 rounded"></div>
											</div>
										))}
									</div>
								</div>
							)
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

					{/* Right Column: Match History - Now uses matchIds with lazy loading */}
					<div className="w-full lg:w-2/3">
						{state.matchIds ? (
							<MatchHistory
								matchIds={state.matchIds}
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
}
