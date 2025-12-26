"use client";

import { useEffect, useState, useCallback } from "react";
import Profile from "@/components/tft/Profile";
import ErrorPage from "@/components/ErrorPage";
import Loading from "@/components/Loading";
import { fetchWithErrorHandling, extractErrorMessage } from "@/lib/errorUtils";

export default function ProfilePageContent({ gameName, tagLine, region }) {
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
			const url = `/api/tft/profile?gameName=${encodeURIComponent(
				gameName
			)}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(
				region
			)}`;

			const data = await fetchWithErrorHandling(url);
			setProfileData(data);
		} catch (err) {
			console.error("TFT Profile fetch error:", err);
			setError(err);
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

			// Fetch updated profile data
			await fetchProfileData();
		} catch (error) {
			console.error("TFT Profile update error:", error);
			setError(error);
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
				error={
					error ||
					"Please provide a valid Riot ID (gameName#tagLine) and region."
				}
				retryCountdown={0}
				onRetry={() => window.location.reload()}
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
}

