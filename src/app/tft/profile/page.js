"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Profile from "@/components/tft/Profile";
import ErrorPage from "@/components/ErrorPage";
import Loading from "@/components/Loading";

export default function TFTProfilePage() {
	const searchParams = useSearchParams();
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");
	const region = searchParams.get("region");
	const [profileData, setProfileData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isUpdating, setIsUpdating] = useState(false);

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
			console.error("Error fetching profile data:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, [gameName, tagLine, region]);

	useEffect(() => {
		fetchProfileData();
	}, [fetchProfileData]);

	// Add the trigger update function - similar to League implementation
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
				console.error("API update error:", data);
				throw new Error(
					data.error || `Failed to trigger update: ${response.status}`
				);
			}

			// Fetch updated profile data
			await fetchProfileData();
		} catch (error) {
			console.error("Error triggering TFT profile update:", error.message);
			setError(error.message);
		} finally {
			setIsUpdating(false);
		}
	};

	if (isLoading) {
		return <Loading />;
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
		/>
	);
}
