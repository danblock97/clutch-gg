import React, { useState } from "react";
import Image from "next/image";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const RankedInfo = ({ rankedData }) => {
	// Fetch the Ranked Flex data only
	const flexRankedData = rankedData.find(
		(item) => item.queueType === "RANKED_FLEX_SR"
	);

	// State to handle expand/collapse
	const [isExpanded, setIsExpanded] = useState(false);

	// Function to handle toggle for expand/collapse
	const handleToggleExpand = () => {
		setIsExpanded((prev) => !prev);
	};

	const renderRankedFlex = (data) => {
		// Check if data exists, else provide default unranked values
		const rankedIcon = data
			? `/images/rankedEmblems/${data.tier.toLowerCase()}.webp`
			: null;
		const tier = data ? data.tier : "Unranked";
		const rank = data ? data.rank : "";
		const wins = data ? data.wins : 0;
		const losses = data ? data.losses : 0;
		const leaguePoints = data ? data.leaguePoints : 0;
		const winRate = data ? ((wins / (wins + losses)) * 100).toFixed(1) : "0.0";

		return (
			<div
				className="w-full bg-[#1e1e2f] p-4 rounded-md shadow-lg relative border border-gray-800 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:rounded-md before:border before:border-gray-600 before:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] cursor-pointer"
				onClick={handleToggleExpand} // Apply the onClick handler to the entire div
			>
				<div className="flex justify-between items-center">
					<h2 className="text-white text-sm font-bold">Ranked Flex</h2>

					{/* Rank and Tier Information */}
					<div className="flex items-center space-x-2">
						{rankedIcon && (
							<Image
								src={rankedIcon}
								alt={`${tier} Emblem`}
								width={20}
								height={20}
								className="rounded-full"
							/>
						)}
						<p className="text-gray-400 text-sm">
							{data ? `${tier} ${rank}` : "Unranked"}
						</p>

						<div aria-label={isExpanded ? "Collapse" : "Expand"}>
							{isExpanded ? (
								<FaChevronUp className="text-gray-500" />
							) : (
								<FaChevronDown className="text-gray-500" />
							)}
						</div>
					</div>
				</div>

				{/* Expanded Info (Win/Loss, LP, Winrate) */}
				{isExpanded && (
					<div className="mt-2 text-sm text-gray-400">
						<p>
							<strong>Wins:</strong> {wins} | <strong>Losses:</strong> {losses}
						</p>
						<p>
							<strong>Winrate:</strong> {winRate}%
						</p>
						<p>
							<strong>LP:</strong> {leaguePoints} LP
						</p>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="flex flex-col space-y-4">
			{/* Only Render Ranked Flex */}
			{renderRankedFlex(flexRankedData)}
		</div>
	);
};

export default RankedInfo;
