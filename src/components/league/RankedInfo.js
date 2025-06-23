import React, { useState } from "react";
import Image from "next/image";
import {
	FaChevronDown,
	FaChevronUp,
	FaTrophy,
	FaChartLine,
} from "react-icons/fa";

const RankedInfo = ({ rankedData }) => {
	// Fetch the Ranked Flex data only - ensure rankedData is an array
	const flexRankedData = Array.isArray(rankedData)
		? rankedData.find((item) => item.queueType === "RANKED_FLEX_SR")
		: null;

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

		// Determine color class based on tier
		const tierColorClass = data
			? `text-[--${tier.toLowerCase()}]`
			: "text-gray-400";

		return (
			<div
				className="card season-history-card group cursor-pointer transition-all duration-300 hover:shadow-xl"
				onClick={handleToggleExpand}
			>
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-full bg-[--card-bg] flex items-center justify-center">
							<FaTrophy className="text-[--gold] text-lg" />
						</div>
						<h2 className="text-base font-bold">Ranked Flex</h2>
					</div>

					<div className="flex items-center gap-3">
						{rankedIcon && (
							<div className="flex items-center">
								<Image
									src={rankedIcon}
									alt={`${tier} Emblem`}
									width={28}
									height={28}
									className=""
								/>
								<p className={`ml-2 font-semibold ${tierColorClass}`}>
									{data ? `${tier} ${rank}` : "Unranked"}
								</p>
							</div>
						)}

						<div className="text-[--text-secondary] group-hover:text-[--primary] transition-colors duration-200">
							{isExpanded ? <FaChevronUp /> : <FaChevronDown />}
						</div>
					</div>
				</div>

				{isExpanded && (
					<div className="mt-4 pt-4 border-t border-[--card-border] grid grid-cols-3 gap-4 text-center">
						<div className="stat-block">
							<span className="text-xs text-[--text-secondary] uppercase">
								Win Rate
							</span>
							<div className="relative my-2">
								<svg className="w-16 h-16" viewBox="0 0 36 36">
									<path
										d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
										fill="none"
										stroke="#444"
										strokeWidth="1"
									/>
									<path
										d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
										fill="none"
										stroke={parseFloat(winRate) > 50 ? "#10b981" : "#ef4444"}
										strokeWidth="3"
										strokeDasharray={`${winRate}, 100`}
										strokeLinecap="round"
									/>
									<text
										x="18"
										y="20.5"
										textAnchor="middle"
										fontSize="8"
										fill="white"
										fontWeight="bold"
									>
										{winRate}%
									</text>
								</svg>
							</div>
						</div>

						<div className="stat-block">
							<span className="text-xs text-[--text-secondary] uppercase">
								W/L
							</span>
							<div className="flex items-center justify-center gap-1 mt-2">
								<span className="text-[--success] font-semibold">{wins}W</span>
								<span className="text-[--text-secondary]">/</span>
								<span className="text-[--error] font-semibold">{losses}L</span>
							</div>
						</div>

						<div className="stat-block">
							<span className="text-xs text-[--text-secondary] uppercase">
								LP
							</span>
							<div className="flex items-center justify-center mt-2">
								<FaChartLine className="text-[--primary] mr-1" />
								<span className="font-bold text-lg">{leaguePoints}</span>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	};

	return <div className="space-y-4">{renderRankedFlex(flexRankedData)}</div>;
};

export default RankedInfo;
