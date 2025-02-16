import React from "react";
import NextImage from "next/image";

export default function TeamAnalysisTab({ matchDetails, matchId }) {
	if (!matchDetails) return null;

	const match = matchDetails.find((m) => m.metadata.matchId === matchId);
	if (!match) return <div className="text-white">No match found.</div>;

	const parts = match.info.participants;
	const team1 = parts.filter((p) => p.teamId === 100);
	const team2 = parts.filter((p) => p.teamId === 200);

	const stats = [
		{
			label: "Kills",
			getValue: (p) => p.kills,
		},
		{
			label: "Gold earned",
			getValue: (p) => p.goldEarned,
		},
		{
			label: "Damage dealt to champions",
			getValue: (p) => p.totalDamageDealtToChampions,
		},
		{
			label: "Wards placed",
			getValue: (p) => p.wardsPlaced,
		},
		{
			label: "Damage taken",
			getValue: (p) => p.totalDamageTaken,
		},
		{
			label: "CS",
			getValue: (p) => p.totalMinionsKilled + p.neutralMinionsKilled,
		},
	];

	return (
		<div className="text-white max-w-6xl w-full space-y-8">
			<div className="flex items-center justify-center space-x-6 mb-2">
				<div className="flex items-center space-x-1">
					<span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
					<span className="text-sm text-gray-200">Blue 1</span>
				</div>
				<div className="flex items-center space-x-1">
					<span className="inline-block w-3 h-3 rounded-full bg-red-500" />
					<span className="text-sm text-gray-200">Red 2</span>
				</div>
			</div>

			{stats.map((stat) => (
				<TeamAnalysisRow
					key={stat.label}
					label={stat.label}
					team1={team1}
					team2={team2}
					getValue={stat.getValue}
				/>
			))}
		</div>
	);
}

function TeamAnalysisRow({ label, team1, team2, getValue }) {
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

	// 2-slice donut: T1 is #3182CE (blue), T2 is #E53E3E (red)
	const donutStyle = {
		background: `conic-gradient(
      #3182CE 0deg ${t1Frac * 360}deg,
      #E53E3E ${t1Frac * 360}deg 360deg
    )`,
	};

	return (
		<div className="rounded-md">
			<div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 md:gap-14 items-center">
				{/* Left side: Team1 champion stats (blue) */}
				<div className="space-y-2">
					{t1Sorted.map((p) => (
						<ChampionStatBar
							key={p.participantId}
							championId={p.championId}
							value={getValue(p)}
							total={t1Total}
							barColor="#3182CE" // Blue
						/>
					))}
				</div>

				{/* Center donut */}
				<div className="flex flex-col items-center">
					<span className="font-semibold mb-2">{label}</span>
					<div className="relative w-24 h-24 rounded-full" style={donutStyle}>
						<div className="absolute inset-1 rounded-full bg-[#1e1e2e]" />
						<div className="absolute inset-0 flex flex-col items-center justify-center font-semibold">
							<span className="text-blue-400">{t1Total.toLocaleString()}</span>
							<span className="text-red-400">{t2Total.toLocaleString()}</span>
						</div>
					</div>
				</div>

				{/* Right side: Team2 champion stats (red) */}
				<div className="space-y-2">
					{t2Sorted.map((p) => (
						<ChampionStatBar
							key={p.participantId}
							championId={p.championId}
							value={getValue(p)}
							total={t2Total}
							barColor="#E53E3E"
						/>
					))}
				</div>
			</div>
		</div>
	);
}

function ChampionStatBar({ championId, value, total, barColor }) {
	const fraction = total > 0 ? value / total : 0;

	return (
		<div className="flex items-center space-x-2">
			<NextImage
				src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${championId}.png`}
				alt="champion"
				width={24}
				height={24}
				className="rounded-full flex-shrink-0"
			/>

			{/* Bar container */}
			<div className="relative flex-1 h-5">
				{/* Background */}
				<div className="absolute inset-0 bg-[#2e2e2e] rounded" />
				{/* Filled portion */}
				<div
					className="absolute inset-y-0 left-0 rounded"
					style={{
						width: (fraction * 100).toFixed(2) + "%",
						backgroundColor: barColor,
					}}
				/>
				{/* Value text on top */}
				<div className="relative z-10 h-full flex items-center justify-end pr-2 text-sm">
					{value.toLocaleString()}
				</div>
			</div>
		</div>
	);
}
