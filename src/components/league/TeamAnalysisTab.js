import React from "react";
import Image from "next/image";
import { FaChartBar, FaUsers, FaTrophy, FaSkull } from "react-icons/fa";

export default function TeamAnalysisTab({ matchDetails, matchId }) {
	if (!matchDetails) return null;

	const match = matchDetails.find((m) => m.metadata.matchId === matchId);
	if (!match) {
		return (
			<div className="p-6 text-center">
				<p className="text-[--text-secondary]">Match data not found.</p>
			</div>
		);
	}

	// Arena mode is not supported for this tab.
	if (match.info.queueId === 1700 || match.info.queueId === 1710) {
		return (
			<div className="p-4 text-center text-[--text-secondary]">
				Team analysis is not available for Arena mode.
			</div>
		);
	}

	const parts = match.info.participants;
	const team1 = parts.filter((p) => p.teamId === 100);
	const team2 = parts.filter((p) => p.teamId === 200);

	const team1Won = match.info.teams.find((t) => t.teamId === 100)?.win;
	const team2Won = match.info.teams.find((t) => t.teamId === 200)?.win;

	const stats = [
		{
			label: "Kills",
			icon: <FaSkull />,
			getValue: (p) => p.kills,
			color: "text-red-500",
		},
		{
			label: "Gold earned",
			icon: <FaTrophy />,
			getValue: (p) => p.goldEarned,
			color: "text-yellow-500",
		},
		{
			label: "Damage dealt",
			icon: <FaChartBar />,
			getValue: (p) => p.totalDamageDealtToChampions,
			color: "text-orange-500",
		},
		{
			label: "Wards placed",
			icon: <FaChartBar />,
			getValue: (p) => p.wardsPlaced,
			color: "text-purple-500",
		},
		{
			label: "Damage taken",
			icon: <FaChartBar />,
			getValue: (p) => p.totalDamageTaken,
			color: "text-blue-500",
		},
		{
			label: "CS",
			icon: <FaChartBar />,
			getValue: (p) => p.totalMinionsKilled + p.neutralMinionsKilled,
			color: "text-green-500",
		},
	];

	return (
		<div className="p-4">
			<div className="bg-transparent">
				<div className="p-4 border-b border-white/10">
					<h3 className="text-base font-bold flex items-center">
						<FaUsers className="mr-2 text-[--primary]" />
						Team Comparison
					</h3>
				</div>

				<div className="p-4">
					<div className="flex justify-center space-x-6 mb-4">
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 rounded-full bg-blue-500"></div>
							<span className="text-sm text-[--text-secondary]">
								{team1Won ? "Winning Team (Blue)" : "Blue Team"}
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 rounded-full bg-red-500"></div>
							<span className="text-sm text-[--text-secondary]">
								{team2Won ? "Winning Team (Red)" : "Red Team"}
							</span>
						</div>
					</div>

					<div className="space-y-8">
						{stats.map((stat) => (
							<TeamAnalysisRow
								key={stat.label}
								label={stat.label}
								icon={stat.icon}
								iconColor={stat.color}
								team1={team1}
								team2={team2}
								getValue={stat.getValue}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function TeamAnalysisRow({ label, icon, iconColor, team1, team2, getValue }) {
	// Sort each side by the chosen stat
	const t1Sorted = [...team1].sort((a, b) => getValue(b) - getValue(a));
	const t2Sorted = [...team2].sort((a, b) => getValue(b) - getValue(a));

	// Totals
	const t1Total = t1Sorted.reduce((acc, p) => acc + getValue(p), 0);
	const t2Total = t2Sorted.reduce((acc, p) => acc + getValue(p), 0);
	const grandTotal = t1Total + t2Total || 1;

	// Fractions
	const t1Frac = t1Total / grandTotal;
	const t2Frac = t2Total / grandTotal;

	return (
		<div className="rounded-md">
			<div className="mb-1 flex items-center">
				<span className={`mr-2 ${iconColor}`}>{icon}</span>
				<h4 className="text-sm font-semibold">{label}</h4>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-4">
				{/* Left side: Team1 champion stats (blue) */}
				<div className="lg:col-span-5 space-y-1 order-2 lg:order-1">
					{t1Sorted.map((p) => (
						<ChampionStatBar
							key={p.participantId}
							championId={p.championId}
							value={getValue(p)}
							total={t1Total}
							barColor="bg-blue-500"
							textRight={false}
						/>
					))}
				</div>

				{/* Center totals */}
				<div className="lg:col-span-2 flex flex-col items-center justify-center space-y-1 order-1 lg:order-2">
					{/* Visual breakdown of the stats (horizontal bar) */}
					<div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
						<div
							className="h-full bg-blue-500"
							style={{ width: `${(t1Total / grandTotal) * 100}%` }}
						></div>
					</div>

					{/* Team Totals */}
					<div className="flex justify-between w-full text-xs">
						<span className="text-blue-500 font-semibold">
							{t1Total.toLocaleString()}
						</span>
						<span className="text-red-500 font-semibold">
							{t2Total.toLocaleString()}
						</span>
					</div>

					{/* Percentage text */}
					<div className="text-[--text-secondary] text-xs">
						{(t1Frac * 100).toFixed(1)}% - {(t2Frac * 100).toFixed(1)}%
					</div>
				</div>

				{/* Right side: Team2 champion stats (red) */}
				<div className="lg:col-span-5 space-y-1 order-3">
					{t2Sorted.map((p) => (
						<ChampionStatBar
							key={p.participantId}
							championId={p.championId}
							value={getValue(p)}
							total={t2Total}
							barColor="bg-red-500"
							textRight={true}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

function ChampionStatBar({ championId, value, total, barColor, textRight }) {
	const fraction = total > 0 ? value / total : 0;
	const percentage = (fraction * 100).toFixed(1);

	return (
		<div
			className={`flex items-center gap-2 ${
				textRight ? "flex-row-reverse" : "flex-row"
			}`}
		>
			{/* Champion Icon */}
			<div className="relative w-6 h-6 flex-shrink-0">
				<Image
					src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${championId}.png`}
					alt="champion"
					width={24}
					height={24}
					className="rounded-full border border-[--card-border]"
				/>
			</div>

			{/* Bar container */}
			<div className="relative flex-1 h-4 bg-[--card-bg] rounded overflow-hidden group">
				{/* Background */}
				<div className="absolute inset-0 bg-[--card-bg] rounded-sm" />

				{/* Filled portion */}
				<div
					className={`absolute inset-y-0 ${
						textRight ? "right-0" : "left-0"
					} ${barColor} opacity-60 group-hover:opacity-80 transition-opacity duration-200`}
					style={{
						width: `${percentage}%`,
					}}
				/>

				{/* Value text */}
				<div
					className={`absolute inset-0 flex items-center ${
						textRight ? "justify-end px-2" : "justify-start px-2"
					} text-xs font-medium`}
				>
					{value.toLocaleString()}
				</div>
			</div>
		</div>
	);
}
