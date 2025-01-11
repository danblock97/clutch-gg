import React from "react";
import Image from "next/image";
import Link from "next/link";

const LeaderboardTable = ({ leaderboardData, region }) => {
	return (
		<div className="w-full max-w-4xl mt-8 overflow-x-auto">
			<table className="w-full min-w-max text-center border-separate border-spacing-y-2">
				<thead className="bg-[#13151b] text-xs sm:text-sm text-gray-400">
					<tr>
						<th className="p-2">Rank</th>
						<th className="p-2 text-left">Summoner</th>
						<th className="p-2">LP</th>
						<th className="p-2">Win Rate</th>
					</tr>
				</thead>
				<tbody>
					{leaderboardData.map((entry, index) => (
						<tr
							key={entry.summonerId}
							className="bg-[#1c1e24] text-xs sm:text-sm"
						>
							<td className="p-2">{index + 1}</td>

							<td className="p-2 flex items-center justify-start space-x-2">
								{entry.profileData?.profileIconId && (
									<div className="relative w-6 h-6 sm:w-8 sm:h-8">
										<Image
											src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${entry.profileData.profileIconId}.jpg`}
											alt="Profile Icon"
											className="rounded-full"
											layout="fill"
											objectFit="cover"
										/>
									</div>
								)}
								<span className="truncate">
									{entry.profileData ? (
										<Link
											href={`/profile?gameName=${encodeURIComponent(
												entry.profileData.gameName
											)}&tagLine=${encodeURIComponent(
												entry.profileData.tagLine
											)}&region=${encodeURIComponent(region)}`}
										>
											{`${entry.profileData.gameName}#${entry.profileData.tagLine}`}
										</Link>
									) : (
										"Loading..."
									)}
								</span>
							</td>

							<td className="p-2">{entry.leaguePoints} LP</td>

							<td className="p-2">
								<div>
									<span>
										{entry.wins}W / {entry.losses}L
									</span>
									<br />
									<span>
										{((entry.wins / (entry.wins + entry.losses)) * 100).toFixed(
											1
										)}
										%
									</span>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default LeaderboardTable;
