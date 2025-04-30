import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCrown, FaMedal } from "react-icons/fa";

// Re-using the League table structure and styling
const TFTLeaderboardTable = ({ leaderboardData, region, tier }) => {
	// Function to get row highlight class based on player rank (identical to League)
	const getRowHighlightClass = (index) => {
		if (index === 0)
			return "bg-gradient-to-r from-yellow-500/20 to-yellow-500/5"; // First place
		if (index === 1) return "bg-gradient-to-r from-gray-400/20 to-gray-400/5"; // Second place
		if (index === 2) return "bg-gradient-to-r from-amber-700/20 to-amber-700/5"; // Third place
		return index % 2 === 0 ? "bg-[--card-bg]" : "bg-[--card-bg-secondary]"; // Alternating rows
	};

	// Function to render rank indicator (identical to League)
	const getRankIndicator = (index) => {
		if (index === 0)
			return <FaCrown className="text-yellow-500 mr-2" title="1st Place" />;
		if (index === 1)
			return <FaMedal className="text-gray-300 mr-2" title="2nd Place" />;
		if (index === 2)
			return <FaMedal className="text-amber-700 mr-2" title="3rd Place" />;
		return null;
	};

	// Function to calculate winrate percent and color (identical to League)
	const getWinrateDisplay = (wins, losses) => {
		const total = wins + losses;
		if (total === 0) return { percent: "0.0", colorClass: "text-gray-400" };

		const winrate = (wins / total) * 100;
		let colorClass = "text-gray-400";

		if (winrate >= 65) colorClass = "text-green-500";
		else if (winrate >= 55) colorClass = "text-green-400";
		else if (winrate >= 50) colorClass = "text-blue-400";
		else if (winrate >= 45) colorClass = "text-yellow-400";
		else colorClass = "text-red-400";

		return {
			percent: winrate.toFixed(1),
			colorClass,
		};
	};

	// Get tier color class (using TFT tier names)
	const getTierColorClass = () => {
		const lowerTier = tier.toLowerCase();
		if (
			[
				"challenger",
				"grandmaster",
				"master",
				"diamond",
				"emerald",
				"platinum",
				"gold",
				"silver",
				"bronze",
				"iron",
			].includes(lowerTier)
		) {
			return `text-[--${lowerTier}]`;
		}
		return "text-[--tft-primary]"; // Fallback
	};

	return (
		<div className="w-full overflow-hidden rounded-lg border border-[--card-border] shadow-xl">
			{/* Table Header (identical to League) */}
			<div className="w-full bg-[--card-bg-secondary] border-b border-[--card-border] text-xs sm:text-sm text-[--text-secondary] sticky top-0 z-10">
				<div className="grid grid-cols-12 py-3 px-4">
					<div className="col-span-1 font-semibold">Rank</div>
					<div className="col-span-5 font-semibold">Summoner</div>
					<div className="col-span-2 text-center font-semibold">LP</div>
					<div className="col-span-4 text-center font-semibold">Win Rate</div>
				</div>
			</div>

			{/* Table Body */}
			<div className="max-h-[600px] overflow-y-auto custom-scrollbar">
				{leaderboardData.map((entry, index) => {
					const winrateInfo = getWinrateDisplay(entry.wins, entry.losses);
					const tierColor = getTierColorClass();

					return (
						<div
							key={entry.summonerId} // Use summonerId as key
							className={`grid grid-cols-12 py-3 px-4 items-center border-b border-[--card-border] hover:bg-[--primary]/5 transition-colors duration-150 ${getRowHighlightClass(
								index
							)}`}
						>
							{/* Rank Column (identical to League) */}
							<div className="col-span-1 font-bold flex items-center">
								{getRankIndicator(index)}
								{index + 1}
							</div>

							{/* Summoner Column - Adjusted for TFT profile link */}
							<div className="col-span-5">
								<Link
									href={`/tft/profile?gameName=${encodeURIComponent(
										entry.profileData?.gameName || "Unknown"
									)}&tagLine=${encodeURIComponent(
										entry.profileData?.tagLine || "Unknown"
									)}&region=${encodeURIComponent(region)}`}
									className="flex items-center group"
								>
									{/* Profile Icon (using TFT profileIconId) */}
									{entry.profileData?.profileIconId ? (
										<div className="relative w-10 h-10 mr-3 rounded-full overflow-hidden border-2 border-[--card-border] group-hover:border-[--primary] transition-colors">
											<Image
												// Use the correct base URL for TFT profile icons if different, assuming same for now
												src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${entry.profileData.profileIconId}.jpg`}
												alt="Profile Icon"
												fill
												className="object-cover"
											/>
										</div>
									) : (
										<div className="w-10 h-10 mr-3 rounded-full bg-[--card-border] flex items-center justify-center">
											<span className="text-[--text-secondary] text-xs">?</span>
										</div>
									)}

									{/* Summoner Name (using gameName and tagLine) */}
									<div className="overflow-hidden">
										<div className="font-medium text-[--text-primary] truncate group-hover:text-[--primary] transition-colors">
											{entry.profileData?.gameName ||
												entry.summonerName ||
												"Unknown"}
										</div>
										<div className="text-xs text-[--text-secondary]">
											#{entry.profileData?.tagLine || "Unknown"}
										</div>
									</div>
								</Link>
							</div>

							{/* LP Column (using tier color) */}
							<div className="col-span-2 text-center">
								<span className={`font-bold ${tierColor}`}>
									{entry.leaguePoints}
								</span>
								<span className="text-[--text-secondary] ml-1 text-sm">LP</span>
							</div>

							{/* Win Rate Column (identical to League) */}
							<div className="col-span-4">
								<div className="flex flex-col sm:flex-row items-center justify-center gap-2">
									{/* Win/Loss */}
									<div className="text-sm whitespace-nowrap">
										<span className="text-[--success]">{entry.wins}W</span>
										<span className="text-[--text-secondary] mx-1">/</span>
										<span className="text-[--error]">{entry.losses}L</span>
									</div>

									{/* Win Rate Bar */}
									<div className="w-full max-w-[100px] h-5 bg-[--card-bg] rounded-full overflow-hidden relative">
										<div
											className={`h-full ${winrateInfo.colorClass} bg-current opacity-20`}
											style={{ width: `${winrateInfo.percent}%` }}
										></div>
										<div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
											<span className={winrateInfo.colorClass}>
												{winrateInfo.percent}%
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default TFTLeaderboardTable;
