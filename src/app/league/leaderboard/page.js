"use client";

import React, { useEffect, useState, useCallback } from "react";
import Loading from "@/components/Loading";
import Dropdowns from "@/components/league/Dropdowns";
import LeaderboardTable from "@/components/league/LeaderboardTable";
import ErrorPage from "@/components/ErrorPage";
import { FaTrophy, FaSync, FaExclamationTriangle } from "react-icons/fa";

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

	// Get background class based on tier
	const getTierBackgroundClass = () => {
		switch (tier.toLowerCase()) {
			case 'challenger': return 'from-[--challenger]/10 to-transparent';
			case 'grandmaster': return 'from-[--grandmaster]/10 to-transparent';
			case 'master': return 'from-[--master]/10 to-transparent';
			case 'diamond': return 'from-[--diamond]/10 to-transparent';
			case 'emerald': return 'from-[--emerald]/10 to-transparent';
			case 'platinum': return 'from-[--platinum]/10 to-transparent';
			case 'gold': return 'from-[--gold]/10 to-transparent';
			case 'silver': return 'from-[--silver]/10 to-transparent';
			case 'bronze': return 'from-[--bronze]/10 to-transparent';
			case 'iron': return 'from-[--iron]/10 to-transparent';
			default: return 'from-blue-500/10 to-transparent';
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			{/* Header Section */}
			<div className={`w-full py-16 bg-gradient-to-b ${getTierBackgroundClass()}`}>
				<div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
					<div className="flex justify-center mb-4">
						<div className="p-3 rounded-full bg-[--card-bg] shadow-xl">
							<FaTrophy className={`text-[--${tier.toLowerCase()}] text-3xl`} />
						</div>
					</div>
					<h1 className="text-3xl sm:text-4xl font-bold mb-4">
						{tier.charAt(0) + tier.slice(1).toLowerCase()} Leaderboard
					</h1>
					<p className="text-[--text-secondary] max-w-2xl mx-auto">
						Track the top performers in League of Legends and see where they rank
					</p>
				</div>
			</div>

			{/* Filters Section */}
			<div className="bg-[--card-bg]/50 py-6 border-y border-[--card-border]">
				<div className="max-w-4xl mx-auto px-4 sm:px-6">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<h2 className="text-xl font-semibold">Filter Rankings</h2>
						<Dropdowns
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
							<p className="mt-4 text-[--text-secondary]">Loading leaderboard data...</p>
						</div>
					) : error ? (
						<div className="card-highlight py-8 text-center">
							<FaExclamationTriangle className="text-[--error] text-4xl mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-2">Error Loading Leaderboard</h3>
							<p className="text-[--text-secondary] mb-6">{error}</p>

							{retryCountdown > 0 ? (
								<p className="text-[--warning]">
									Retrying in {retryCountdown} second{retryCountdown > 1 ? 's' : ''}...
								</p>
							) : (
								<button
									onClick={fetchLeaderboardData}
									className="btn-primary inline-flex items-center"
								>
									<FaSync className="mr-2" /> Retry Now
								</button>
							)}
						</div>
					) : leaderboardData.length === 0 ? (
						<div className="card-highlight py-8 text-center">
							<h3 className="text-xl font-semibold mb-2">No Players Found</h3>
							<p className="text-[--text-secondary]">
								There are no players in {tier} {division} for this region.
							</p>
						</div>
					) : (
						<LeaderboardTable leaderboardData={leaderboardData} region={region} tier={tier} />
					)}
				</div>
			</div>
		</div>
	);
};

export default Leaderboard;