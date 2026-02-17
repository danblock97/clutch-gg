"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Loading from "@/components/Loading";
import TFTDropdowns from "@/components/tft/Dropdowns";
import TFTLeaderboardTable from "@/components/tft/LeaderboardTable";
import ErrorPage from "@/components/ErrorPage";
import { FaTrophy } from "react-icons/fa";
import { fetchWithErrorHandling } from "@/lib/errorUtils";

const LeaderboardPage = () => {
	const [leaderboardData, setLeaderboardData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [region, setRegion] = useState("NA1");
	const [tier, setTier] = useState("CHALLENGER");
	const [division, setDivision] = useState("I");
	const [error, setError] = useState(null);

	const fetchLeaderboardData = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const url = `/api/tft/leaderboard?region=${region}&tier=${tier}&division=${division}`;
			const data = await fetchWithErrorHandling(url);

			if (!Array.isArray(data)) {
				setLeaderboardData([]);
			} else {
				setLeaderboardData(data);
			}

			setError(null);
		} catch (error) {
			console.error("TFT Leaderboard fetch error:", error);
			setError(error);
		} finally {
			setLoading(false);
		}
	}, [region, tier, division]);

	useEffect(() => {
		fetchLeaderboardData();
	}, [fetchLeaderboardData]);

	const getTierBackgroundClass = () => {
		switch (tier.toLowerCase()) {
			case "challenger":
				return "from-[--challenger]/10 to-transparent";
			case "grandmaster":
				return "from-[--grandmaster]/10 to-transparent";
			case "master":
				return "from-[--master]/10 to-transparent";
			case "diamond":
				return "from-[--diamond]/10 to-transparent";
			case "emerald":
				return "from-[--emerald]/10 to-transparent";
			case "platinum":
				return "from-[--platinum]/10 to-transparent";
			case "gold":
				return "from-[--gold]/10 to-transparent";
			case "silver":
				return "from-[--silver]/10 to-transparent";
			case "bronze":
				return "from-[--bronze]/10 to-transparent";
			case "iron":
				return "from-[--iron]/10 to-transparent";
			default:
				return "from-blue-500/10 to-transparent";
		}
	};

	useEffect(() => {
		if (typeof document !== "undefined") {
			document.title = "ClutchGG TFT Leaderboards";
		}
	}, []);

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
							<FaTrophy
								className="text-3xl"
								style={{ color: `var(--${tier.toLowerCase()})` }}
							/>
						</div>
					</div>
					<h1 className="text-3xl sm:text-4xl font-bold mb-4">
						{tier.charAt(0) + tier.slice(1).toLowerCase()} TFT Leaderboard
					</h1>
					<p className="text-[--text-secondary] max-w-2xl mx-auto">
						Track the top performers in Teamfight Tactics and see where they
						rank
					</p>
				</div>
			</div>

			{/* Filters Section */}
			<div className="bg-[--card-bg]/50 py-6 border-y border-[--card-border]">
				<div className="max-w-4xl mx-auto px-4 sm:px-6">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<h2 className="text-xl font-semibold">Filter Rankings</h2>
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
								Loading leaderboard data...
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
								{["CHALLENGER", "GRANDMASTER", "MASTER"].includes(
									tier.toUpperCase()
								)
									? `Looks like there aren't any ${tier.charAt(0) + tier.slice(1).toLowerCase()} players in this region yet. Try a different region or come back later!`
									: `No players found in ${tier.charAt(0) + tier.slice(1).toLowerCase()} ${division} for this region. Maybe try another tier or region?`}
							</p>
						</div>
					) : (
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

export default LeaderboardPage;
