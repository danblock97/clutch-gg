import React from "react";
import Image from "next/image";
import { FaInfoCircle, FaChartLine, FaShieldAlt, FaEye, FaCoins, FaFlag } from "react-icons/fa";

export default function StatsTab({ matchDetails, matchId }) {
	if (!matchDetails) return null;

	// Find the match by matchId
	const match = matchDetails.find((m) => m.metadata.matchId === matchId);
	if (!match) return (
		<div className="card-highlight p-6 text-center">
			<p className="text-[--text-secondary]">Match data not found.</p>
		</div>
	);

	const participants = match.info.participants;

	// Helper function to safely format numbers
	const safeToLocaleString = (value) => {
		if (value === undefined || value === null) return '0';

		// For large numbers, abbreviate to keep compact display
		if (value >= 1000) {
			return (value / 1000).toFixed(1) + 'k';
		}
		return value.toLocaleString();
	};

	// Categories & stats
	const categories = [
		{
			name: "Combat",
			icon: <FaChartLine className="text-[--primary]" />,
			stats: [
				{
					label: "KDA",
					getValue: (p) => `${p.kills || 0}/${p.deaths || 0}/${p.assists || 0}`,
				},
				{
					label: "Killing Spree",
					getValue: (p) => p.largestKillingSpree || 0,
				},
				{
					label: "Multi-Kill",
					getValue: (p) => p.largestMultiKill || 0
				},
				{
					label: "CC Score",
					getValue: (p) => p.timeCCingOthers || 0
				},
			],
		},
		{
			name: "Damage Dealt",
			icon: <FaChartLine className="text-red-500" />,
			stats: [
				{
					label: "Total Dmg",
					getValue: (p) => safeToLocaleString(p.totalDamageDealtToChampions),
				},
				{
					label: "Physical",
					getValue: (p) => safeToLocaleString(p.physicalDamageDealtToChampions),
				},
				{
					label: "Magic",
					getValue: (p) => safeToLocaleString(p.magicDamageDealtToChampions),
				},
				{
					label: "True",
					getValue: (p) => safeToLocaleString(p.trueDamageDealtToChampions),
				},
				{
					label: "Largest Crit",
					getValue: (p) => safeToLocaleString(p.largestCriticalStrike),
				},
				{
					label: "Turret Dmg",
					getValue: (p) => safeToLocaleString(p.damageDealtToTurrets),
				},
			],
		},
		{
			name: "Damage Taken/Healed",
			icon: <FaShieldAlt className="text-blue-500" />,
			stats: [
				{
					label: "Healed",
					getValue: (p) => safeToLocaleString(p.totalHeal)
				},
				{
					label: "Ally Healing",
					getValue: (p) => safeToLocaleString(p.totalHealsOnTeammates)
				},
				{
					label: "Mitigated",
					getValue: (p) => safeToLocaleString(p.damageSelfMitigated)
				},
				{
					label: "Physical Taken",
					getValue: (p) => safeToLocaleString(p.physicalDamageTaken)
				},
				{
					label: "Magic Taken",
					getValue: (p) => safeToLocaleString(p.magicalDamageTaken)
				},
				{
					label: "True Taken",
					getValue: (p) => safeToLocaleString(p.trueDamageTaken)
				},
			],
		},
		{
			name: "Vision",
			icon: <FaEye className="text-purple-500" />,
			stats: [
				{
					label: "Score",
					getValue: (p) => p.visionScore || 0
				},
				{
					label: "Placed",
					getValue: (p) => p.wardsPlaced || 0
				},
				{
					label: "Destroyed",
					getValue: (p) => p.wardsKilled || 0
				},
				{
					label: "Pinks",
					getValue: (p) => p.visionWardsBoughtInGame || 0,
				},
			],
		},
		{
			name: "Farm",
			icon: <FaCoins className="text-yellow-500" />,
			stats: [
				{
					label: "Gold",
					getValue: (p) => safeToLocaleString(p.goldEarned)
				},
				{
					label: "CS",
					getValue: (p) => {
						const minions = p.totalMinionsKilled || 0;
						const neutrals = p.neutralMinionsKilled || 0;
						return safeToLocaleString(minions + neutrals);
					},
				},
			],
		},
		{
			name: "Objectives",
			icon: <FaFlag className="text-green-500" />,
			stats: [
				{
					label: "Towers",
					getValue: (p) => p.turretTakedowns || 0
				},
				{
					label: "Inhibitors",
					getValue: (p) => p.inhibitorTakedowns || 0,
				},
				{
					label: "Dragons",
					getValue: (p) => p.dragonKills || 0
				},
				{
					label: "Heralds",
					getValue: (p) => p.riftHeraldTakedowns || 0,
				},
				{
					label: "Barons",
					getValue: (p) => p.baronKills || 0
				},
			],
		},
	];

	return (
		<div>
			<div className="card-highlight p-4">
				<h3 className="text-base font-bold mb-4 flex items-center">
					<FaInfoCircle className="mr-2 text-[--primary]" />
					Detailed Match Statistics
				</h3>

				<div className="text-sm">
					{categories.map((category, categoryIndex) => (
						<div key={category.name} className="mb-6 last:mb-0">
							{/* Category Header */}
							<div className="flex items-center mb-2 pb-2 border-b border-[--card-border]">
								{category.icon}
								<h4 className="ml-2 font-semibold">{category.name}</h4>
							</div>

							{/* Stats Table */}
							<div className="w-full">
								<table className="w-full table-fixed">
									<thead>
									<tr className="bg-[--card-bg] text-xs text-[--text-secondary]">
										<th className="py-1 px-1 text-left w-20">Stat</th>
										{participants.map((p, idx) => (
											<th key={idx} className="py-1 px-1 text-center">
												<div className="flex flex-col items-center">
													<div className="relative w-6 h-6">
														<Image
															src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
															alt="champion"
															width={24}
															height={24}
															className="rounded-full border border-[--card-border]"
														/>
													</div>
													<span className="truncate text-xs max-w-[50px]">
                              {p.riotIdGameName?.split('#')[0]}
                            </span>
												</div>
											</th>
										))}
									</tr>
									</thead>
									<tbody>
									{category.stats.map((stat, idx) => (
										<tr
											key={idx}
											className={`border-b border-[--card-border]/20 hover:bg-[--card-bg-secondary] ${
												idx % 2 === 0 ? 'bg-[--card-bg]/50' : ''
											}`}
										>
											<td className="py-1 px-1 font-medium text-[--text-secondary] text-xs">{stat.label}</td>
											{participants.map((p, pIdx) => {
												// Get stat value - safely
												let value;
												try {
													value = stat.getValue(p);
												} catch (error) {
													value = 0;
												}

												// Find the highest value for this stat to highlight
												const allValues = participants.map(part => {
													try {
														const val = stat.getValue(part);
														return typeof val === 'number' ? val : 0;
													} catch (error) {
														return 0;
													}
												});

												const maxValue = Math.max(...allValues.filter(val => !isNaN(val) && val !== undefined));
												const isHighest = typeof value === 'number' && !isNaN(value) && value === maxValue && maxValue > 0;

												return (
													<td
														key={pIdx}
														className={`py-1 px-1 text-center text-xs ${
															isHighest ? 'font-bold text-[--primary]' : ''
														}`}
													>
														{value}
													</td>
												);
											})}
										</tr>
									))}
									</tbody>
								</table>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}