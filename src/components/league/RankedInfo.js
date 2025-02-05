import React, { useState } from "react";
import Image from "next/image";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const RankedInfo = ({ rankedData }) => {
	// Fetch the Ranked Flex data only
	const flexRankedData = rankedData.find(
		(item) => item.queueType === "RANKED_FLEX_SR"
	);

	const [isExpanded, setIsExpanded] = useState(false);

	const handleToggleExpand = () => {
		setIsExpanded((prev) => !prev);
	};

	const renderRankedFlex = (data) => {
		const rankedIcon = data
			? `/images/league/rankedEmblems/${data.tier.toLowerCase()}.webp`
			: null;
		const tier = data ? data.tier : "Unranked";
		const rank = data ? data.rank : "";
		const wins = data ? data.wins : 0;
		const losses = data ? data.losses : 0;
		const leaguePoints = data ? data.leaguePoints : 0;
		const winRate = data ? ((wins / (wins + losses)) * 100).toFixed(1) : "0.0";

		return (
			<div
				className="
          w-full
          p-4
          rounded-xl
          text-white
          border border-[#2f2f46]
          bg-gradient-to-br from-[#232337] to-[#1b1b2d]
          shadow-[0_4px_15px_rgba(0,0,0,0.6)]
          transition-shadow
          duration-200
          cursor-pointer
          hover:shadow-[0_8px_30px_rgba(0,0,0,0.8)]
        "
				onClick={handleToggleExpand}
			>
				<div className="flex justify-between items-center">
					<h2 className="text-sm font-bold">Ranked Flex</h2>
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
						<p className="text-gray-300 text-sm">
							{data ? `${tier} ${rank}` : "Unranked"}
						</p>
						<div aria-label={isExpanded ? "Collapse" : "Expand"}>
							{isExpanded ? (
								<FaChevronUp className="text-gray-400" />
							) : (
								<FaChevronDown className="text-gray-400" />
							)}
						</div>
					</div>
				</div>

				{isExpanded && (
					<div className="mt-2 text-sm text-gray-300">
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
			{renderRankedFlex(flexRankedData)}
		</div>
	);
};

export default RankedInfo;
