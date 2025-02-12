"use client";

import React, { useEffect, useState, useCallback } from "react";
import Loading from "@/components/Loading";
import Dropdowns from "@/components/league/Dropdowns";
import LeaderboardTable from "@/components/league/LeaderboardTable";
import ErrorPage from "@/components/ErrorPage";

const Leaderboard = () => {
	const [leaderboardData, setLeaderboardData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [region, setRegion] = useState("EUW1");
	const [tier, setTier] = useState("CHALLENGER");
	const [division, setDivision] = useState("I");
	const [error, setError] = useState(null);
	const [retryCountdown, setRetryCountdown] = useState(0);

	const fetchLeaderboardData = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/league/leaderboard?region=${region}&tier=${tier}&division=${division}`
			);

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
			try {
				data = await response.json();
			} catch (jsonError) {
				console.warn("Failed to parse JSON:", jsonError);
				data = [];
			}

			if (data && data.error) {
				throw new Error(data.error);
			}

			if (!Array.isArray(data)) {
				console.warn("API returned non-array, setting to []");
				setLeaderboardData([]);
			} else {
				setLeaderboardData(data);
			}

			setError(null);
		} catch (error) {
			console.error("Error fetching leaderboard data:", error);
			setError(error.message);
			setRetryCountdown(10);
		} finally {
			setLoading(false);
		}
	}, [region, tier, division]);

	useEffect(() => {
		fetchLeaderboardData();
	}, [fetchLeaderboardData]);

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
	}, [retryCountdown, error, fetchLeaderboardData]);

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
				<div className="mt-8">
					<Loading />
				</div>
			) : error ? (
				<ErrorPage error={error} retryCountdown={retryCountdown} />
			) : leaderboardData.length === 0 ? (
				<div className="mt-8 text-gray-300">
					<p>
						No players found in {tier} {division} for this region.
					</p>
				</div>
			) : (
				<LeaderboardTable leaderboardData={leaderboardData} region={region} />
			)}
		</div>
	);
};

export default Leaderboard;
