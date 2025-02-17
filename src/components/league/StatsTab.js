import React from "react";

export default function StatsTab({ matchDetails, matchId }) {
	if (!matchDetails) return null;

	// Find the match by matchId
	const match = matchDetails.find((m) => m.metadata.matchId === matchId);
	if (!match) return <div className="text-white">No match found.</div>;

	const participants = match.info.participants;

	// Categories & stats
	const categories = [
		{
			name: "Combat",
			stats: [
				{
					label: "KDA",
					getValue: (p) => `${p.kills}/${p.deaths}/${p.assists}`,
				},
				{
					label: "Largest Killing Spree",
					getValue: (p) => p.largestKillingSpree,
				},
				{ label: "Largest Multi-Kill", getValue: (p) => p.largestMultiKill },
				{ label: "Crowd Control Score", getValue: (p) => p.timeCCingOthers },
			],
		},
		{
			name: "Damage Dealt",
			stats: [
				{
					label: "Total Dmg to Champions",
					getValue: (p) => p.totalDamageDealtToChampions,
				},
				{
					label: "Physical Dmg",
					getValue: (p) => p.physicalDamageDealtToChampions,
				},
				{
					label: "Magic Dmg",
					getValue: (p) => p.magicDamageDealtToChampions,
				},
				{
					label: "True Dmg",
					getValue: (p) => p.trueDamageDealtToChampions,
				},
				{
					label: "Largest Critical Strike",
					getValue: (p) => p.largestCriticalStrike,
				},
				{
					label: "Damage to Turrets",
					getValue: (p) => p.damageDealtToTurrets,
				},
			],
		},
		{
			name: "Damage Taken and Healed",
			stats: [
				{ label: "Dmg Healed", getValue: (p) => p.totalHeal },
				{ label: "Ally Healing", getValue: (p) => p.totalHealsOnTeammates },
				{ label: "Self Mitigated Dmg", getValue: (p) => p.damageSelfMitigated },
				{ label: "Physical Dmg Taken", getValue: (p) => p.physicalDamageTaken },
				{ label: "Magic Dmg Taken", getValue: (p) => p.magicalDamageTaken },
				{ label: "True Dmg Taken", getValue: (p) => p.trueDamageTaken },
			],
		},
		{
			name: "Vision",
			stats: [
				{ label: "Vision Score", getValue: (p) => p.visionScore },
				{ label: "Wards Placed", getValue: (p) => p.wardsPlaced },
				{ label: "Wards Destroyed", getValue: (p) => p.wardsKilled },
				{
					label: "Vision Wards Purchased",
					getValue: (p) => p.visionWardsBoughtInGame,
				},
			],
		},
		{
			name: "Farm",
			stats: [
				{ label: "Gold Earned", getValue: (p) => p.goldEarned },
				{
					label: "CS",
					getValue: (p) => p.totalMinionsKilled + p.neutralMinionsKilled,
				},
			],
		},
		{
			name: "Objectives",
			stats: [
				{ label: "Towers Destroyed", getValue: (p) => p.turretTakedowns },
				{
					label: "Inhibitors Destroyed",
					getValue: (p) => p.inhibitorTakedowns,
				},
				{ label: "Dragons Killed", getValue: (p) => p.dragonKills },
				{
					label: "Rift Heralds Killed",
					getValue: (p) => p.riftHeraldTakedowns,
				},
				{ label: "Barons Killed", getValue: (p) => p.baronKills },
			],
		},
	];

	return (
		<div className="overflow-x-auto text-gray-200">
			<table className="w-full table-auto border-collapse text-xs">
				<tbody>
					{categories.map((category) => (
						<React.Fragment key={category.name}>
							{/* -- Category Header Row: Category name + champion icons -- */}
							<tr className="bg-[#2e2e2e] text-white">
								<td className="py-1 px-2 font-bold">{category.name}</td>
								{participants.map((p) => (
									<td key={p.participantId} className="py-1 px-2 text-center">
										<img
											src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
											alt="champion"
											className="w-5 h-5 mx-auto rounded-full"
										/>
									</td>
								))}
							</tr>

							{/* -- Stat Rows for this Category -- */}
							{category.stats.map((stat) => (
								<tr
									key={stat.label}
									className="hover:bg-gray-700 border-b border-gray-700"
								>
									<td className="py-1 px-2 font-semibold">{stat.label}</td>
									{participants.map((p, idx) => {
										let value = stat.getValue(p);
										// Format numeric values with commas
										if (typeof value === "number") {
											value = value.toLocaleString();
										}
										return (
											<td key={idx} className="py-1 px-2 text-center">
												{value}
											</td>
										);
									})}
								</tr>
							))}
						</React.Fragment>
					))}
				</tbody>
			</table>
		</div>
	);
}
