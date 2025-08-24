import React, { useState } from "react";
import Image from "next/image";
import {
	FaChevronDown,
	FaChevronUp,
	FaTrophy,
	FaChartLine,
} from "react-icons/fa";

const RankDisplay = ({ tier, rank, tierColorClass }) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className="relative flex items-center"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{isHovered && (
				<div
					className={`absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md ${tierColorClass}`}
				>
					{`${tier} ${rank}`}
				</div>
			)}
		</div>
	);
};

export default function TFTRankedInfo({ rankedData }) {
	// Find TFT ranked queue - ensure rankedData is an array
	const tftRanked = Array.isArray(rankedData)
		? rankedData.find((queue) => queue.queueType === "RANKED_TFT")
		: null;

	const [isExpanded, setIsExpanded] = useState(false);

	const handleToggleExpand = () => {
		setIsExpanded((prev) => !prev);
	};

	const renderRankedTFT = (data) => {
		const rankedIcon =
			data && data.tier
				? `/images/league/rankedEmblems/${data.tier.toLowerCase()}.webp`
				: null;
		const tier = data && data.tier ? data.tier : "Unranked";
		const rank = data && data.rank ? data.rank : "";
		const wins = data ? data.wins || 0 : 0;
		const losses = data ? data.losses || 0 : 0;
		const leaguePoints = data ? data.leaguePoints || 0 : 0;
		const totalGames = wins + losses;
		const winRate =
			totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0";

		// Determine color class based on tier
		const tierColorClass =
			data && data.tier ? `text-[--${tier.toLowerCase()}]` : "text-gray-400";

		return (
			<div
				className="card-highlight group cursor-pointer transition-all duration-300 hover:shadow-xl"
				onClick={handleToggleExpand}
			>
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-full bg-[--card-bg] flex items-center justify-center">
							<FaTrophy className="text-[--gold] text-lg" />
						</div>
						<h2 className="text-base font-bold">Ranked TFT</h2>
					</div>

					<div className="flex items-center gap-3">
						{rankedIcon && (
							<div className="flex items-center">
								<Image
									src={rankedIcon}
									alt={`${tier} Emblem`}
									width={28}
									height={28}
									className="drop-shadow-lg"
								/>
								<RankDisplay
									tier={tier}
									rank={rank}
									tierColorClass={tierColorClass}
								/>
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

	// TFT Hyperroll
	const tftHyperroll =
		rankedData.find((queue) => queue.queueType === "RANKED_TFT_TURBO") || null;
	const [isHyperrollExpanded, setIsHyperrollExpanded] = useState(false);

	const handleToggleHyperrollExpand = () => {
		setIsHyperrollExpanded((prev) => !prev);
	};

	const renderHyperroll = (data) => {
		// Hyperroll uses a different ranking system (gray, green, blue, purple, orange)
		const colorMap = {
			GRAY: "gray-400",
			GREEN: "green-400",
			BLUE: "blue-400",
			PURPLE: "purple-400",
			ORANGE: "orange-400",
		};

		const tier = data?.ratedTier || "GRAY";
		const displayTier =
			tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
		const ratingPoints = data?.ratedRating || 0;
		const wins = data?.wins || 0;
		const losses = data?.losses || 0;
		const totalGames = wins + losses;
		const winRate =
			totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0";
		const tierColor = colorMap[tier] || "gray-400";

		return (
			<div
				className="card-highlight group cursor-pointer transition-all duration-300 hover:shadow-xl mt-4"
				onClick={handleToggleHyperrollExpand}
			>
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-full bg-[--card-bg] flex items-center justify-center">
							<FaTrophy className={`text-${tierColor} text-lg`} />
						</div>
						<h2 className="text-base font-bold">TFT Hyperroll</h2>
					</div>

					<div className="flex items-center gap-3">
						<p className={`font-semibold text-${tierColor}`}>
							{data ? displayTier : "Unranked"}
						</p>
						<div className="text-[--text-secondary] group-hover:text-[--primary] transition-colors duration-200">
							{isHyperrollExpanded ? <FaChevronUp /> : <FaChevronDown />}
						</div>
					</div>
				</div>

				{isHyperrollExpanded && (
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
								Rating
							</span>
							<div className="flex items-center justify-center mt-2">
								<FaChartLine className="text-[--primary] mr-1" />
								<span className="font-bold text-lg">{ratingPoints}</span>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	};

	// TFT Double Up
	const tftDoubleUp =
		rankedData.find((queue) => queue.queueType === "RANKED_TFT_DOUBLE_UP") ||
		null;
	const [isDoubleUpExpanded, setIsDoubleUpExpanded] = useState(false);

	const handleToggleDoubleUpExpand = () => {
		setIsDoubleUpExpanded((prev) => !prev);
	};

	const renderDoubleUp = (data) => {
		const rankedIcon =
			data && data.tier
				? `/images/league/rankedEmblems/${data.tier.toLowerCase()}.webp`
				: null;
		const tier = data && data.tier ? data.tier : "Unranked";
		const rank = data && data.rank ? data.rank : "";
		const wins = data ? data.wins || 0 : 0;
		const losses = data ? data.losses || 0 : 0;
		const leaguePoints = data ? data.leaguePoints || 0 : 0;
		const totalGames = wins + losses;
		const winRate =
			totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0";

		// Determine color class based on tier
		const tierColorClass =
			data && data.tier ? `text-[--${tier.toLowerCase()}]` : "text-gray-400";

		return (
			<div
				className="card-highlight group cursor-pointer transition-all duration-300 hover:shadow-xl mt-4"
				onClick={handleToggleDoubleUpExpand}
			>
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-full bg-[--card-bg] flex items-center justify-center">
							<FaTrophy className="text-[--blue] text-lg" />
						</div>
						<h2 className="text-base font-bold">TFT Double Up</h2>
					</div>

					<div className="flex items-center gap-3">
						{rankedIcon ? (
							<div className="flex items-center">
								<Image
									src={rankedIcon}
									alt={`${tier} Emblem`}
									width={28}
									height={28}
									className="drop-shadow-lg"
								/>
								<RankDisplay
									tier={tier}
									rank={rank}
									tierColorClass={tierColorClass}
								/>
							</div>
						) : (
							<p className="font-semibold text-gray-400">Unranked</p>
						)}
						<div className="text-[--text-secondary] group-hover:text-[--primary] transition-colors duration-200">
							{isDoubleUpExpanded ? <FaChevronUp /> : <FaChevronDown />}
						</div>
					</div>
				</div>

				{isDoubleUpExpanded && (
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

	return (
		<div className="space-y-4">
			{renderRankedTFT(tftRanked)}
			{renderHyperroll(tftHyperroll)}
			{renderDoubleUp(tftDoubleUp)}
		</div>
	);
}
