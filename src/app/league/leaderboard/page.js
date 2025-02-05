"use client";

import React, { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import Dropdowns from "@/components/league/Dropdowns";
import LeaderboardTable from "@/components/league/LeaderboardTable";

const Leaderboard = () => {
	const [leaderboardData, setLeaderboardData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [region, setRegion] = useState("EUW1");
	const [tier, setTier] = useState("CHALLENGER");
	const [division, setDivision] = useState("I");
	const [error, setError] = useState(null);
	const [retryCountdown, setRetryCountdown] = useState(0);

	const fetchLeaderboardData = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/league/leaderboard?region=${region}&tier=${tier}&division=${division}`
			);

			// If the route you wrote above returns non-OK, handle it or fallback to []
			if (!response.ok) {
				console.warn(
					"Non-OK HTTP status:",
					response.status,
					response.statusText
				);
				setLeaderboardData([]);
				throw new Error(
					`HTTP error: ${response.status} - ${response.statusText}`
				);
			}

			let data = [];
			// Try/catch for parsing JSON
			try {
				data = await response.json();
			} catch (jsonError) {
				console.warn(
					"Failed to parse JSON from /api/league/leaderboard:",
					jsonError
				);
				data = [];
			}

			// If data has "error" property, treat that as error
			if (data && data.error) {
				throw new Error(data.error);
			}

			if (!Array.isArray(data)) {
				console.warn("API returned non-array, setting to []");
				setLeaderboardData([]);
			} else {
				setLeaderboardData(data); // an array, possibly empty
			}

			setError(null);
		} catch (error) {
			console.error("Error fetching leaderboard data:", error);
			setError(error.message);
			setRetryCountdown(10); // triggers your retry logic
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLeaderboardData();
	}, [region, tier, division]);

	// Retry logic
	useEffect(() => {
		if (retryCountdown > 0) {
			const timer = setTimeout(
				() => setRetryCountdown(retryCountdown - 1),
				1000
			);
			return () => clearTimeout(timer);
		} else if (retryCountdown === 0 && error) {
			fetchLeaderboardData();
		}
	}, [retryCountdown, error]);

	return (
		<div className="min-h-screen flex flex-col items-center bg-[#0e1015] text-white">
			<h1 className="text-3xl font-bold mt-6">Leaderboard</h1>

			<Dropdowns
				region={region}
				tier={tier}
				division={division}
				setRegion={setRegion}
				setTier={setTier}
				setDivision={setDivision}
			/>

			{loading ? (
				// 1) Show loading spinner
				<div className="mt-8">
					<Loading />
				</div>
			) : error ? (
				// 2) Show error + auto-retry countdown
				<div className="mt-8 text-red-500">
					{error}
					{retryCountdown > 0 && (
						<p className="text-yellow-500">
							Failed to fetch, automatic retry in {retryCountdown} seconds
						</p>
					)}
				</div>
			) : leaderboardData.length === 0 ? (
				// 3) Fallback message if no data
				<div className="mt-8 text-gray-300">
					<p>
						No players found in {tier} {division} for this region.
					</p>
				</div>
			) : (
				// 4) Otherwise, render your table
				<LeaderboardTable leaderboardData={leaderboardData} region={region} />
			)}
		</div>
	);
};

export default Leaderboard;
