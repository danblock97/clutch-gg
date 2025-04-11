"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TFTLeaderboardTable from "@/components/tft/LeaderboardTable";
import Loading from "@/components/Loading";
import { Dropdown } from "@/components/tft/Dropdowns";

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

	useEffect(() => {
		async function fetchLeaderboard() {
			setIsLoading(true);
			setError(null);

			try {
				const divisionParam = shouldShowDivisions
					? `&division=${division}`
					: "";
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
			} finally {
				setIsLoading(false);
			}
		}

		fetchLeaderboard();
	}, [region, tier, division, shouldShowDivisions]);

	return (
		<main className="min-h-screen py-24 bg-gray-900 text-white">
			<div className="container mx-auto px-4">
				<h1 className="text-3xl font-bold mb-8 text-center">TFT Leaderboard</h1>

				<div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
					<Dropdown
						label="Region"
						options={regions}
						value={region}
						onChange={(value) => setRegion(value)}
					/>
					<Dropdown
						label="Tier"
						options={tiers}
						value={tier}
						onChange={(value) => {
							setTier(value);
							if (!shouldShowDivisions) {
								setDivision("I");
							}
						}}
					/>
					{shouldShowDivisions && (
						<Dropdown
							label="Division"
							options={divisions}
							value={division}
							onChange={(value) => setDivision(value)}
						/>
					)}
				</div>

				{isLoading ? (
					<Loading />
				) : error ? (
					<div className="text-red-500 text-center">{error}</div>
				) : leaderboardData.length === 0 ? (
					<div className="text-center">
						No data available for the selected criteria.
					</div>
				) : (
					<TFTLeaderboardTable data={leaderboardData} region={region} />
				)}
			</div>
		</main>
	);
}
