"use client";

import React, { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import Dropdowns from "@/components/Dropdowns";
import LeaderboardTable from "@/components/LeaderboardTable";

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
			const data = await response.json();

			if (!Array.isArray(data)) {
				throw new Error("Unexpected API response format");
			}

			setLeaderboardData(data);
			setError(null);
		} catch (error) {
			console.error("Error fetching leaderboard data:", error);
			setError(error.message);
			setRetryCountdown(10); // Set countdown to 10 seconds
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLeaderboardData();
	}, [region, tier, division]);

	useEffect(() => {
		if (retryCountdown > 0) {
			const timer = setTimeout(
				() => setRetryCountdown(retryCountdown - 1),
				1000
			);
			return () => clearTimeout(timer);
		} else if (retryCountdown === 0 && error) {
			fetchLeaderboardData(); // Retry fetching data
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
				<div className="mt-8">
					<Loading />
				</div>
			) : error ? (
				<div className="mt-8 text-red-500">
					{error}
					{retryCountdown > 0 && (
						<p className="text-yellow-500">
							Failed to fetch, automatic retry in {retryCountdown} seconds
						</p>
					)}
				</div>
			) : (
				<LeaderboardTable leaderboardData={leaderboardData} />
			)}
		</div>
	);
};

export default Leaderboard;
