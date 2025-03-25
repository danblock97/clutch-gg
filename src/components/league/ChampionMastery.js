import React, { useState } from "react";
import Image from "next/image";
import { FaMedal, FaChevronDown, FaChevronUp } from "react-icons/fa";

const ChampionMastery = ({ championMasteryData }) => {
	const [isExpanded, setIsExpanded] = useState(true);

	// Format points with k/m suffix
	const formatPoints = (points) => {
		if (points >= 1000000) {
			return (points / 1000000).toFixed(1) + 'M';
		} else if (points >= 1000) {
			return (points / 1000).toFixed(1) + 'K';
		}
		return points;
	};

	// Get mastery color class
	const getMasteryColorClass = (level) => {
		switch (level) {
			case 7: return "text-purple-400 border-purple-400";
			case 6: return "text-pink-400 border-pink-400";
			case 5: return "text-red-400 border-red-400";
			case 4: return "text-blue-400 border-blue-400";
			default: return "text-gray-400 border-gray-400";
		}
	};

	// Get mastery background class
	const getMasteryBgClass = (level) => {
		switch (level) {
			case 7: return "bg-purple-900/20";
			case 6: return "bg-pink-900/20";
			case 5: return "bg-red-900/20";
			case 4: return "bg-blue-900/20";
			default: return "bg-gray-900/20";
		}
	};

	if (!championMasteryData || championMasteryData.length === 0) {
		return (
			<div className="card-highlight">
				<div className="flex items-center p-4">
					<div className="p-2 rounded-full bg-[--card-bg] mr-3 flex items-center justify-center">
						<FaMedal className="text-[--secondary] text-lg" />
					</div>
					<h2 className="text-base font-semibold">Champion Mastery</h2>
				</div>
				<div className="p-4 pt-0 text-[--text-secondary] text-center">
					No champion mastery data available.
				</div>
			</div>
		);
	}

	return (
		<div className="card-highlight">
			<div
				className="flex items-center justify-between p-4 cursor-pointer"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center">
					<div className="p-2 rounded-full bg-[--card-bg] mr-3 flex items-center justify-center">
						<FaMedal className="text-[--secondary] text-lg" />
					</div>
					<h2 className="text-base font-semibold">Champion Mastery</h2>
				</div>
				<button className="text-[--text-secondary] transition-colors duration-200 hover:text-[--text-primary]">
					{isExpanded ? <FaChevronUp /> : <FaChevronDown />}
				</button>
			</div>

			{isExpanded && (
				<div className="px-4 pb-4">
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
						{championMasteryData.map((mastery) => {
							const championIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${mastery.championId}.png`;
							const masteryLevel = mastery.championLevel;
							const colorClass = getMasteryColorClass(masteryLevel);
							const bgClass = getMasteryBgClass(masteryLevel);

							return (
								<div
									key={mastery.championId}
									className={`flex flex-col items-center ${bgClass} rounded-lg p-3 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
									title={`Mastery Level: ${mastery.championLevel}`}
								>
									{/* Champion Icon with Mastery Badge */}
									<div className="relative mb-2">
										<div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[--card-border]">
											<Image
												src={championIcon}
												alt={`${mastery.championName} Icon`}
												fill
												className="object-cover transform scale-110"
												loading="lazy"
											/>
										</div>

										{/* Mastery Level Badge */}
										<div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full ${colorClass} border-2 flex items-center justify-center bg-[--card-bg] text-xs font-bold`}>
											{masteryLevel}
										</div>
									</div>

									{/* Champion Name */}
									<h3 className="text-sm font-medium text-center line-clamp-1">
										{mastery.championName}
									</h3>

									{/* Points */}
									<div className="mt-1 text-xs text-[--text-secondary]">
										{formatPoints(mastery.championPoints)} pts
									</div>

									{/* Progress Bar for next level (only show for levels below 7) */}
									{masteryLevel < 7 && (
										<div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
											<div
												className={`h-full ${masteryLevel === 6 ? 'bg-pink-500' : masteryLevel === 5 ? 'bg-red-500' : 'bg-blue-500'}`}
												style={{ width: `${(mastery.championPointsSinceLastLevel / (mastery.championPointsUntilNextLevel + mastery.championPointsSinceLastLevel)) * 100}%` }}
											></div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

export default ChampionMastery;