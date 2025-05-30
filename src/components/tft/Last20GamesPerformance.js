import React, { useMemo, useState, useEffect } from "react";
import { FaChartLine, FaTrophy, FaMedal } from "react-icons/fa";

const Last20GamesPerformance = ({ matchDetails, summonerData }) => {
	// Track the current TFT set number
	const [currentSetNumber, setCurrentSetNumber] = useState(null);

	// Extract current set number from the most recent match
	useEffect(() => {
		if (matchDetails?.length > 0 && matchDetails[0]?.info?.tft_set_number) {
			setCurrentSetNumber(matchDetails[0].info.tft_set_number);
		}
	}, [matchDetails]);

	// Filter to get the last 20 ranked matches of the selected player from the current set
	const last20Matches = useMemo(() => {
		// First find the current set number if not already set
		const setNumber =
			currentSetNumber ||
			(matchDetails?.length > 0 ? matchDetails[0]?.info?.tft_set_number : null);

		return matchDetails
			.filter(
				(match) =>
					match &&
					match.info &&
					match.info.queue_id === 1100 && // Filter for ranked games only (queue_id 1100)
					match.info.tft_set_number === setNumber && // Filter for current set only
					match.info.participants &&
					match.info.participants.some(
						(participant) => participant.puuid === summonerData?.puuid
					)
			)
			.sort((a, b) => b.info.gameEndTimestamp - a.info.gameEndTimestamp) // Ensure latest games first
			.slice(0, 20);
	}, [matchDetails, summonerData?.puuid, currentSetNumber]);

	// Calculate placement distribution and stats
	const placementStats = useMemo(() => {
		// --- No changes needed here ---
		if (!last20Matches.length || !summonerData?.puuid) return {}; // Added summonerData check

		const placementDistribution = Array(8).fill(0);
		let totalPlacements = 0;
		let firstPlaceCount = 0;
		let topFourCount = 0;

		last20Matches.forEach((match) => {
			if (!match || !match.info || !match.info.participants) return;

			const currentPlayer = match.info.participants.find(
				(participant) => participant.puuid === summonerData.puuid
			);

			if (!currentPlayer || typeof currentPlayer.placement !== "number") return; // Added placement type check

			const placement = currentPlayer.placement;
			totalPlacements += placement;

			if (placement >= 1 && placement <= 8) {
				placementDistribution[placement - 1]++;
			}

			if (placement === 1) firstPlaceCount++;
			if (placement <= 4) topFourCount++;
		});

		if (last20Matches.length === 0)
			return {
				// Handle case where loop runs but finds no valid players/placements
				avgPlacement: "N/A",
				firstPlaceCount: 0,
				topFourCount: 0,
				placementDistribution: Array(8).fill(0),
				totalGames: 0,
			};

		const avgPlacement = (totalPlacements / last20Matches.length).toFixed(1);
		const totalGames = last20Matches.length;

		return {
			avgPlacement,
			firstPlaceCount,
			topFourCount,
			placementDistribution,
			totalGames,
		};
	}, [last20Matches, summonerData?.puuid]);

	// Get placement color based on avg placement
	const getPlacementColor = (avgPlacement) => {
		// --- No changes needed here ---
		const placement = parseFloat(avgPlacement);
		if (isNaN(placement)) return "text-[--text-secondary]"; // Handle N/A case
		if (placement <= 1.5) return "text-yellow-400";
		if (placement <= 4.0) return "text-blue-400";
		return "text-red-400";
	};

	// Calculate the maximum count in the distribution for scaling the bars
	const maxCount = useMemo(() => {
		// --- No changes needed here ---
		if (!placementStats.placementDistribution) return 0;
		// Ensure maxCount is at least 1 for scaling, even if all counts are 0
		return Math.max(...placementStats.placementDistribution, 1);
	}, [placementStats.placementDistribution]);

	// Get color for each placement bar
	const getBarColor = (placementIndex) => {
		// --- No changes needed here ---
		if (placementIndex === 0) return "bg-yellow-400"; // 1st place
		if (placementIndex < 4) return "bg-blue-500"; // 2nd-4th
		return "bg-red-500"; // 5th-8th
	};

	// Generate Y-axis labels
	const generateYAxisLabels = (maxValue) => {
		// --- No changes needed here ---
		if (!maxValue || maxValue <= 1) return [0, 1]; // Handle low maxCount

		const tickCount = Math.min(Math.ceil(maxValue), 5); // Use ceil and ensure at least 1 tick if maxValue > 0
		const labels = [];
		const step = maxValue / tickCount;

		for (let i = 0; i <= tickCount; i++) {
			const value = Math.round(i * step);
			// Avoid duplicate labels if step is small or rounding overlaps
			if (labels.length === 0 || labels[labels.length - 1] !== value) {
				labels.push(value);
			}
		}
		// Ensure the max value is present if rounded down previously
		if (labels[labels.length - 1] < maxValue && maxValue > 1) {
			labels.push(Math.ceil(maxValue));
		}

		return labels.reverse(); // Reverse to draw from top to bottom
	};

	const yAxisLabels = useMemo(() => {
		// Pass the actual max value from the data, not the adjusted one (max(..., 1))
		const actualMax = placementStats.placementDistribution
			? Math.max(...placementStats.placementDistribution)
			: 0;
		return generateYAxisLabels(actualMax);
	}, [placementStats.placementDistribution]);

	// If no match data or stats couldn't be calculated
	if (!placementStats.totalGames) {
		// --- No changes needed here ---
		return (
			<div className="card-highlight rounded-xl p-5 text-center">
				<h2 className="text-lg font-bold mb-4 flex items-center justify-center">
					<FaChartLine className="text-[--tft-primary] mr-2" />{" "}
					{/* Consistent Icon Color */}
					Recent Ranked Placements
				</h2>
				<p className="text-[--text-secondary]">
					No recent ranked matches found or data unavailable. Play some ranked
					games to see your performance stats!
				</p>
			</div>
		);
	}

	return (
		<div className="card-highlight rounded-xl p-5">
			{/* --- Header and Stats Sections (No changes needed) --- */}
			<h2 className="text-lg font-bold mb-4 flex items-center">
				<FaChartLine className="text-[--tft-primary] mr-2" />
				Recent Ranked Placements
				<span className="text-[--text-secondary] text-sm font-normal ml-2">
					(Last {placementStats.totalGames} Games)
				</span>
				{currentSetNumber && (
					<span className="text-[--text-secondary] text-sm font-normal ml-1">
						• Set {currentSetNumber}
					</span>
				)}
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				{/* Average Placement */}
				<div className="flex items-center space-x-4 p-3 bg-[--card-bg] rounded-lg">
					<div
						className={`text-3xl font-bold ${getPlacementColor(
							placementStats.avgPlacement
						)}`}
					>
						{placementStats.avgPlacement}
					</div>
					<div>
						<p className="text-sm text-[--text-secondary]">AVG PLACEMENT</p>
						<p className="text-xs text-[--text-secondary]">
							in last {placementStats.totalGames} games
						</p>
					</div>
				</div>

				{/* 1st Place Finishes */}
				<div className="flex items-center space-x-4 p-3 bg-[--card-bg] rounded-lg">
					<div className="text-3xl font-bold text-yellow-400 flex items-center">
						<FaTrophy className="mr-2" />
						{placementStats.firstPlaceCount}
					</div>
					<div>
						<p className="text-sm text-[--text-secondary]">1ST PLACE</p>
						<p className="text-xs text-[--text-secondary]">wins</p>
					</div>
				</div>

				{/* Top 4 Finishes */}
				<div className="flex items-center space-x-4 p-3 bg-[--card-bg] rounded-lg">
					<div className="text-3xl font-bold text-blue-400 flex items-center">
						<FaMedal className="mr-2" />
						{placementStats.topFourCount}
					</div>
					<div>
						<p className="text-sm text-[--text-secondary]">TOP 4</p>
						<p className="text-xs text-[--text-secondary]">finishes</p>
					</div>
				</div>
			</div>

			{/* --- Placement Distribution Bar Graph (REFINED) --- */}
			<div className="mt-6">
				<p className="text-sm font-semibold mb-2">Placement Distribution</p>

				<div className="flex mt-2">
					{/* Y-axis */}
					<div
						className="flex flex-col justify-between items-end pr-2 text-xs text-[--text-secondary]"
						style={{ height: "10rem" }}
					>
						{" "}
						{/* Match graph height */}
						{yAxisLabels.map((label, index) => (
							<div key={index}>{label}</div>
						))}
					</div>

					{/* Graph Area */}
					<div className="flex-1">
						{/* Canvas for bars and grid lines */}
						<div
							className="relative border-l border-b border-[--card-border]"
							style={{ height: "10rem" }}
						>
							{" "}
							{/* Consistent height: h-40 = 10rem */}
							{/* Horizontal grid lines */}
							{yAxisLabels.map((_, index) => {
								// Don't draw a line for the bottom-most label (0) as the border-b serves this purpose
								if (index === yAxisLabels.length - 1) return null;
								return (
									<div
										key={`grid-${index}`}
										className="absolute w-full border-t border-[--card-border] border-opacity-30"
										style={{
											// Calculate position based on index relative to the number of intervals
											bottom: `${(index / (yAxisLabels.length - 1)) * 100}%`,
											left: 0,
											zIndex: 0, // Ensure grid lines are behind bars
										}}
									></div>
								);
							})}
							{/* Bars Container */}
							<div className="absolute inset-0 flex items-end justify-around px-1 z-10">
								{" "}
								{/* Use justify-around for spacing, ensure bars are above grid */}
								{placementStats.placementDistribution?.map((count, index) => (
									<div
										key={`bar-${index}`}
										className={`w-[60%] max-w-[24px] rounded-t ${getBarColor(
											index
										)} transition-height duration-300 ease-in-out`} // Use relative width within its space, max-w, rounded-t
										style={{
											// Calculate height relative to the maxCount (which is >= 1)
											height: `${(count / maxCount) * 100}%`,
											// Add a small min-height for visibility even for low counts, but 0 for zero count
											minHeight: count > 0 ? "2px" : "0px",
										}}
										title={`Placement ${index + 1}: ${count} times`} // Add tooltip
									>
										{/* Optional: Add count label inside or above the bar if desired */}
										{/* <span className="text-xs absolute -top-4">{count}</span> */}
									</div>
								))}
							</div>
						</div>

						{/* X-axis labels Container */}
						<div className="flex mt-1 justify-around px-1">
							{placementStats.placementDistribution?.map((count, index) => (
								<div
									key={`label-${index}`}
									className="flex flex-col items-center justify-start pt-1" // Adjusted alignment
									// No explicit width needed if using justify-around on parent
								>
									<div className="text-xs font-medium">#{index + 1}</div>
									{/* Display count below placement number */}
									<div className="text-xs text-[--text-secondary] mt-0.5">
										{count}
									</div>
								</div>
							))}
						</div>

						{/* X-axis title */}
						<div className="text-xs text-center mt-2 text-[--text-secondary]">
							Placement
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Last20GamesPerformance;
