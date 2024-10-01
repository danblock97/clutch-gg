import React, { useState } from "react";
import Image from "next/image";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Import chevron icons

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

	// Render Ranked Flex with Expandable/Collapsible Logic
	const renderRankedFlex = (data) => {
		const rankedIcon = data
			? `/images/rankedEmblems/${data.tier.toLowerCase()}.webp`
			: null;

		return (
			<div className="w-full bg-[#1e1e2f] p-4 rounded-md shadow-lg relative border border-gray-800 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:rounded-md before:border before:border-gray-600 before:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6),inset_-2px_-2px_5px_rgba(255,255,255,0.1)]">
				{/* Top row with Flex Rank and Chevron Button */}
				<div className="flex justify-between items-center">
					{/* Ranked Flex Title */}
					<h2 className="text-white text-sm font-bold">Ranked Flex</h2>

					{/* Rank and Tier Information */}
					<div className="flex items-center space-x-2">
						{rankedIcon && (
							<Image
								src={rankedIcon}
								alt={`${data.tier} Emblem`}
								width={20}
								height={20}
								className="rounded-full"
							/>
						)}
						<p className="text-gray-400 text-sm">
							{data ? `${data.tier} ${data.rank}` : "Unranked"}
						</p>

						{/* Expand/Collapse Chevron Button */}
						<button
							onClick={handleToggleExpand}
							className="ml-2"
							aria-label={isExpanded ? "Collapse" : "Expand"}
						>
							{isExpanded ? (
								<FaChevronUp className="text-gray-500" />
							) : (
								<FaChevronDown className="text-gray-500" />
							)}
						</button>
					</div>
				</div>

				{/* Expanded Info (Win/Loss, LP, Winrate) */}
				{isExpanded && data && (
					<div className="mt-2 text-sm text-gray-400">
						<p>
							<strong>Wins:</strong> {data.wins} | <strong>Losses:</strong>{" "}
							{data.losses}
						</p>
						<p>
							<strong>Winrate:</strong>{" "}
							{((data.wins / (data.wins + data.losses)) * 100).toFixed(1)}%
						</p>
						<p>
							<strong>LP:</strong> {data.leaguePoints} LP
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
