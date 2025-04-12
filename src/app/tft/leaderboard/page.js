"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import TFTLeaderboardTable from "@/components/tft/LeaderboardTable";
import Loading from "@/components/Loading";
import Dropdowns from "@/components/tft/Dropdowns";
import {
	FaTrophy,
	FaSync,
	FaExclamationTriangle,
	FaChessKnight,
} from "react-icons/fa";
import { useGameType } from "@/context/GameTypeContext";

export default function TFTLeaderboardPage() {
	const searchParams = useSearchParams();
	const initialRegion = searchParams.get("region") || "euw1";
	const initialTier = searchParams.get("tier") || "CHALLENGER";
	const initialDivision = searchParams.get("division") || "I";

	const [region, setRegion] = useState(initialRegion);
	const [tier, setTier] = useState(initialTier);
	const [division, setDivision] = useState(initialDivision);
	const [leaderboardData, setLeaderboardData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [retryCountdown, setRetryCountdown] = useState(0);
	const { gameType } = useGameType();

	const regions = [
		{ value: "br1", label: "Brazil" },
		{ value: "eun1", label: "Europe Nordic & East" },
		{ value: "euw1", label: "Europe West" },
		{ value: "jp1", label: "Japan" },
		{ value: "kr", label: "Korea" },
		{ value: "la1", label: "Latin America North" },
		{ value: "la2", label: "Latin America South" },
		{ value: "na1", label: "North America" },
		{ value: "oc1", label: "Oceania" },
		{ value: "ru", label: "Russia" },
		{ value: "tr1", label: "Turkey" },
	];

	const tiers = [
		{ value: "IRON", label: "Iron" },
		{ value: "BRONZE", label: "Bronze" },
		{ value: "SILVER", label: "Silver" },
		{ value: "GOLD", label: "Gold" },
		{ value: "PLATINUM", label: "Platinum" },
		{ value: "EMERALD", label: "Emerald" },
		{ value: "DIAMOND", label: "Diamond" },
		{ value: "MASTER", label: "Master" },
		{ value: "GRANDMASTER", label: "Grandmaster" },
		{ value: "CHALLENGER", label: "Challenger" },
	];

	const divisions = [
		{ value: "I", label: "I" },
		{ value: "II", label: "II" },
		{ value: "III", label: "III" },
		{ value: "IV", label: "IV" },
	];

	// Filter out divisions for Master+ tiers
	const shouldShowDivisions = !["MASTER", "GRANDMASTER", "CHALLENGER"].includes(
		tier
	);

	// Get background class based on tier
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
				return "from-[--tft-primary]/10 to-transparent";
		}
	};

	const fetchLeaderboard = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const divisionParam = shouldShowDivisions ? `&division=${division}` : "";
			const response = await fetch(
				`/api/tft/leaderboard?region=${region}&tier=${tier}${divisionParam}`
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch leaderboard: ${response.status}`);
			}

			const data = await response.json();
			setLeaderboardData(data);
		} catch (err) {
			console.error("Error fetching leaderboard:", err);
			setError(err.message);
			setRetryCountdown(10);
		} finally {
			setIsLoading(false);
		}
	}, [region, tier, division, shouldShowDivisions]);

	useEffect(() => {
		fetchLeaderboard();
	}, [fetchLeaderboard]);

	// Retry logic
	useEffect(() => {
		if (retryCountdown > 0) {
			const timer = setTimeout(
				() => setRetryCountdown(retryCountdown - 1),
				1000
			);
			return () => clearTimeout(timer);
		} else if (retryCountdown === 0 && error) {
			fetchLeaderboard();
		}
	}, [retryCountdown, error, fetchLeaderboard]);

	return (
		<div className="min-h-screen flex flex-col">
			{/* Header Section */}
			<div
				className={`w-full py-16 bg-gradient-to-b ${getTierBackgroundClass()}`}
			>
				<div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
					<div className="flex justify-center mb-4">
						<div className="p-3 rounded-full bg-[--card-bg] shadow-xl">
							<FaChessKnight
								className={`text-[--${tier.toLowerCase()}] text-3xl`}
							/>
						</div>
					</div>
					<h1 className="text-3xl sm:text-4xl font-bold mb-4">
						TFT {tier.charAt(0) + tier.slice(1).toLowerCase()} Leaderboard
					</h1>
					<p className="text-[--text-secondary] max-w-2xl mx-auto">
						Track the top TFT players and see where they rank in Teamfight
						Tactics
					</p>
				</div>
			</div>

			{/* Filters Section */}
			<div className="bg-[--card-bg]/50 py-6 border-y border-[--card-border]">
				<div className="max-w-4xl mx-auto px-4 sm:px-6">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<h2 className="text-xl font-semibold">Filter Rankings</h2>
						<Dropdowns
							region={region.toUpperCase()}
							tier={tier}
							division={division}
							setRegion={(value) => setRegion(value.toLowerCase())}
							setTier={setTier}
							setDivision={setDivision}
						/>
					</div>
				</div>
			</div>

			{/* Content Section */}
			<div className="flex-1 py-8">
				<div className="max-w-6xl mx-auto px-4 sm:px-6">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Loading />
							<p className="mt-4 text-[--text-secondary]">
								Loading leaderboard data...
							</p>
						</div>
					) : error ? (
						<div className="card-highlight py-8 text-center">
							<FaExclamationTriangle className="text-[--error] text-4xl mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-2">
								Error Loading Leaderboard
							</h3>
							<p className="text-[--text-secondary] mb-6">{error}</p>

							{retryCountdown > 0 ? (
								<p className="text-[--warning]">
									Retrying in {retryCountdown} second
									{retryCountdown > 1 ? "s" : ""}...
								</p>
							) : (
								<button
									onClick={fetchLeaderboard}
									className="btn-primary-tft inline-flex items-center"
								>
									<FaSync className="mr-2" /> Retry Now
								</button>
							)}
						</div>
					) : leaderboardData.length === 0 ? (
						<div className="card-highlight py-8 text-center">
							<h3 className="text-xl font-semibold mb-2">No Players Found</h3>
							<p className="text-[--text-secondary]">
								There are no TFT players in {tier}{" "}
								{shouldShowDivisions ? division : ""} for this region.
							</p>
						</div>
					) : (
						<TFTLeaderboardTable
							data={leaderboardData}
							region={region}
							tier={tier}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
