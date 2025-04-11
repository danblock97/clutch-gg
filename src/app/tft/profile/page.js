"use client";

import { useEffect, useState } from "react";
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

	useEffect(() => {
		async function fetchProfileData() {
			if (!gameName || !tagLine || !region) {
				setIsLoading(false);
				return;
			}

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
		}

		fetchProfileData();
	}, [gameName, tagLine, region]);

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

	return <Profile profileData={profileData} />;
}
