"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Profile from "@/components/tft/Profile";
import ErrorPage from "@/components/ErrorPage";
import Loading from "@/components/Loading";

const ProfilePageContent = () => {
	const searchParams = useSearchParams();
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");
	const region = searchParams.get("region");
	const [profileData, setProfileData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isLoadingLadderRanking, setIsLoadingLadderRanking] = useState(false);

	const fetchProfileData = useCallback(async () => {
		if (!gameName || !tagLine || !region) {
			setIsLoading(false);
			return;
		}
		// Reset state before fetching new data
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/tft/profile?gameName=${encodeURIComponent(
					gameName
				)}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(
					region
				)}`
			);

			if (!response.ok) {
				throw new Error(
					`Failed to fetch profile data: ${response.status} ${response.statusText}`
				);
			}

			const data = await response.json();
			setProfileData(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, [gameName, tagLine, region]);

	useEffect(() => {
		fetchProfileData();
	}, [fetchProfileData]);

	// Add the trigger update function - similar to League implementation
	// Set isLoadingLadderRanking to true when profileData is available
	useEffect(() => {
		if (profileData) {
			setIsLoadingLadderRanking(true);
		}
	}, [profileData]);

	// Callback to handle when ladder ranking data is loaded
	const handleLadderRankingLoaded = () => {
		setIsLoadingLadderRanking(false);
	};

	const triggerUpdate = async () => {
		setIsUpdating(true);
		try {
			// Use window.ENV variable if it exists, otherwise fallback to process.env
			const apiKey =
				typeof window !== "undefined" && window.ENV?.UPDATE_API_KEY
					? window.ENV.UPDATE_API_KEY
					: process.env.NEXT_PUBLIC_UPDATE_API_KEY;

			const response = await fetch("/api/tft/profile", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": apiKey,
				},
				body: JSON.stringify({ gameName, tagLine, region }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(
					data.error || `Failed to trigger update: ${response.status}`
				);
			}

			// Fetch updated profile data
			await fetchProfileData();
		} catch (error) {
			setError(error.message);
		} finally {
			setIsUpdating(false);
		}
	};

 // Show loading only if initial data is loading
 if (isLoading) {
 	return (
 		<div className="min-h-screen flex items-center justify-center">
 			<Loading />
 		</div>
 	);
 }

	if (error || !gameName || !tagLine || !region) {
		return (
			<ErrorPage
				message={
					error ||
					"Please provide a valid Riot ID (gameName#tagLine) and region."
				}
			/>
		);
	}


	return (
		<Profile
			profileData={profileData}
			triggerUpdate={triggerUpdate}
			isUpdating={isUpdating}
			onLoadComplete={handleLadderRankingLoaded}
		/>
	);
};

export default ProfilePageContent;
