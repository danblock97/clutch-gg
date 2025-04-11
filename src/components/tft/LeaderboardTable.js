import Image from "next/image";
import Link from "next/link";

export default function TFTLeaderboardTable({ data, region }) {
	return (
		<div className="overflow-x-auto">
			<table className="min-w-full bg-gray-800 text-white border border-gray-700 shadow-lg rounded-lg overflow-hidden">
				<thead className="bg-gray-700">
					<tr>
						<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
							Rank
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
							Summoner
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
							Tier
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
							LP
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
							Wins
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
							Losses
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
							Win Rate
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-700">
					{data.map((player, index) => {
						const gameName = player.profileData?.gameName || "Unknown";
						const tagLine = player.profileData?.tagLine || "Unknown";
						const wins = player.wins || 0;
						const losses = player.losses || 0;
						const winRate =
							wins + losses > 0
								? Math.round((wins / (wins + losses)) * 100)
								: 0;

						return (
							<tr
								key={player.summonerId || index}
								className="hover:bg-gray-700"
							>
								<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
									{index + 1}
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-sm">
									<Link
										href={`/tft/profile?gameName=${encodeURIComponent(
											gameName
										)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`}
										className="flex items-center space-x-3 hover:text-blue-400"
									>
										<div className="relative h-8 w-8 rounded-full overflow-hidden">
											<Image
												src={`https://ddragon.leagueoflegends.com/cdn/14.7.1/img/profileicon/${
													player.profileData?.profileIconId || 1
												}.png`}
												alt="Profile Icon"
												width={32}
												height={32}
												className="rounded-full"
											/>
										</div>
										<span>
											{gameName}{" "}
											<span className="text-gray-400">#{tagLine}</span>
										</span>
									</Link>
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-sm">
									<div className="flex items-center">
										<div className="relative w-8 h-8 mr-2">
											<Image
												src={`/images/league/rankedEmblems/${
													player.tier?.toLowerCase() || "unranked"
												}.webp`}
												alt={player.tier || "Unranked"}
												width={32}
												height={32}
											/>
										</div>
										<span>
											{player.tier} {player.rank}
										</span>
									</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-sm">
									{player.leaguePoints}
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-sm text-green-400">
									{wins}
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-sm text-red-400">
									{losses}
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-sm">
									<div className="flex items-center">
										<div className="w-16 bg-gray-600 rounded-full h-2.5 mr-2">
											<div
												className="bg-blue-500 h-2.5 rounded-full"
												style={{ width: `${winRate}%` }}
											></div>
										</div>
										<span>{winRate}%</span>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
