"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Image from "next/image";
import Loading from "@/components/Loading";
import TFTDropdowns from "@/components/tft/Dropdowns"; // Use TFT Dropdowns
import TFTLeaderboardTable from "@/components/tft/LeaderboardTable"; // Use TFT Table
import ErrorPage from "@/components/ErrorPage";
import { FaTrophy } from "react-icons/fa";
import { fetchWithErrorHandling, extractErrorMessage } from "@/lib/errorUtils";

// Removed metadata export as it's not allowed in client components

const LeaderboardPage = () => {
	const [leaderboardData, setLeaderboardData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [region, setRegion] = useState("NA1"); // Default region
	const [tier, setTier] = useState("CHALLENGER"); // Default tier
	const [division, setDivision] = useState("I"); // Default division
	const [error, setError] = useState(null);
	const fetchLeaderboardData = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const url = `/api/tft/leaderboard?region=${region}&tier=${tier}&division=${division}`;
			const data = await fetchWithErrorHandling(url);
			if (!Array.isArray(data)) {
				console.error("API did not return an array:", data);
				setLeaderboardData([]);
				throw new Error("Unexpected data format received.");
			} else {
				setLeaderboardData(data);
			}

			setError(null); // Clear previous errors on success
		} catch (error) {
			console.error("TFT Leaderboard fetch error:", error);
			const detailedError = extractErrorMessage(error);
			setError(detailedError);
		} finally {
			setLoading(false);
		}
	}, [region, tier, division]);

	// Fetch data on initial load and when filters change
	useEffect(() => {
		fetchLeaderboardData();
	}, [fetchLeaderboardData]);

	// Get background class based on tier (using TFT colors)
	const getTierBackgroundClass = () => {
		// Use lowercase tier for CSS variable consistency
		const lowerTier = tier.toLowerCase();
		if (
			[
				"challenger",
				"grandmaster",
				"master",
				"diamond",
				"emerald",
				"platinum",
				"gold",
				"silver",
				"bronze",
				"iron",
			].includes(lowerTier)
		) {
			return `from-[--${lowerTier}]/10 to-transparent`;
		}
		return "from-[--tft-primary]/10 to-transparent"; // Fallback
	};

	// Get text color class based on tier
	const getTierColorStyle = () => {
		const lowerTier = tier.toLowerCase();
		if (
			[
				"challenger",
				"grandmaster",
				"master",
				"diamond",
				"emerald",
				"platinum",
				"gold",
				"silver",
				"bronze",
				"iron",
			].includes(lowerTier)
		) {
			return { color: `var(--${lowerTier})` };
		}
		return { color: "var(--tft-primary)" }; // Fallback
	};

	useEffect(() => {
		if (typeof document !== "undefined") {
			document.title = "ClutchGG Leaderboards";
		}
	}, []);

	// Show error page as full page if there's an error
	if (error) {
		return (
			<ErrorPage
				error={error}
				onRetry={fetchLeaderboardData}
			/>
		);
	}

	return (
		<div className="min-h-screen flex flex-col">
			{/* Header Section */}
			<div
				className={`w-full py-16 bg-gradient-to-b ${getTierBackgroundClass()}`}
			>
				<div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
					<div className="flex justify-center mb-4">
						<div className="p-3 rounded-full bg-[--card-bg] shadow-xl">
							{/* Use TFT color for the trophy */}
							<FaTrophy className="text-3xl" style={getTierColorStyle()} />
						</div>
					</div>
					<h1 className="text-3xl sm:text-4xl font-bold mb-4">
						{/* Display selected tier name */}
						{tier.charAt(0) + tier.slice(1).toLowerCase()} TFT Leaderboard
					</h1>
					<p className="text-[--text-secondary] max-w-2xl mx-auto">
						Track the top Teamfight Tactics players and see where they rank.
					</p>
				</div>
			</div>

			{/* Filters Section */}
			<div className="bg-[--card-bg]/50 py-6 border-y border-[--card-border]">
				<div className="max-w-4xl mx-auto px-4 sm:px-6">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<h2 className="text-xl font-semibold">Filter Rankings</h2>
						{/* Use TFTDropdowns component */}
						<TFTDropdowns
							region={region}
							tier={tier}
							division={division}
							setRegion={setRegion}
							setTier={setTier}
							setDivision={setDivision}
						/>
					</div>
				</div>
			</div>

			{/* Content Section */}
			<div className="flex-1 py-8">
				<div className="max-w-6xl mx-auto px-4 sm:px-6">
					{loading ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Loading />
							<p className="mt-4 text-[--text-secondary]">
								Loading TFT leaderboard data...
							</p>
						</div>
					) : leaderboardData.length === 0 ? (
						<div className="card-highlight py-12 px-6 text-center">
							<div className="flex justify-center mb-6">
								<div className="relative">
									<div className="absolute inset-0 bg-yellow-500/20 blur-2xl scale-150 rounded-full"></div>
									<Image
										src="/images/bee-sad.png"
										alt="No players found"
										height={120}
										width={120}
										className="relative z-10 drop-shadow-xl"
									/>
								</div>
							</div>
							<h3 className="text-2xl font-bold mb-3">Nobody here but us bees... 🐝</h3>
							<p className="text-[--text-secondary] text-lg max-w-md mx-auto">
								{["CHALLENGER", "GRANDMASTER", "MASTER"].includes(tier.toUpperCase())
									? `Looks like there aren't any ${tier.charAt(0) + tier.slice(1).toLowerCase()} players in this region yet. Try a different region or come back later!`
									: `No players found in ${tier.charAt(0) + tier.slice(1).toLowerCase()} ${division} for this region. Maybe try another tier or region?`}
							</p>
						</div>
					) : (
						// Use TFTLeaderboardTable component
						<TFTLeaderboardTable
							leaderboardData={leaderboardData}
							region={region}
							tier={tier}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

// Wrap with Suspense for potential future use if needed, though state handles loading now
const LeaderboardPageWrapper = () => (
	<Suspense fallback={<Loading />}>
		<LeaderboardPage />
	</Suspense>
);

export default LeaderboardPageWrapper;
