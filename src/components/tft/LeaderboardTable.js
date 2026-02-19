import React from "react";
import Image from "next/image";
import Link from "next/link";
import { buildProfileUrl } from "@/lib/utils/urlHelpers";
import { FaCrown, FaMedal } from "react-icons/fa";

const TFTLeaderboardTable = ({ leaderboardData, region, tier }) => {
	const regionCode =
		(region || "NA1")
			.replace(/\d+/g, "")
			.toUpperCase()
			.slice(0, 3) || "NA";
	const highlightPlayers = leaderboardData.slice(0, 3);
	const tablePlayers = leaderboardData.slice(3);
	const tableStartRank = highlightPlayers.length + 1;
	const tierLabel = tier
		? `${tier.charAt(0) + tier.slice(1).toLowerCase()} Tier`
		: "Challenger Tier";

	const getWinrateInfo = (wins = 0, losses = 0) => {
		const total = wins + losses;
		if (total === 0) {
			return {
				percent: "0.0",
				display: "0.0%",
				color: "from-gray-500 to-gray-800",
			};
		}

		const percent = Math.min(100, ((wins / total) * 100).toFixed(1));
		let gradient = "from-[#64ffda]/70 to-transparent";
		if (percent >= 65) gradient = "from-emerald-400/80 to-transparent";
		else if (percent >= 55) gradient = "from-cyan-400/80 to-transparent";
		else if (percent >= 45) gradient = "from-sky-400/70 to-transparent";
		else gradient = "from-pink-500/70 to-transparent";

		return { percent, display: `${percent}%`, color: gradient };
	};

	const getTopCardGradient = (index) => {
		switch (index) {
			case 0:
				return "bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0f172a] border-l-4 border-yellow-400";
			case 1:
				return "bg-gradient-to-br from-[#1f1b2e] via-[#1b1630] to-[#120a1f] border-l-4 border-slate-400";
			case 2:
				return "bg-gradient-to-br from-[#1b141f] via-[#19121d] to-[#120a11] border-l-4 border-orange-500";
			default:
				return "bg-[--card-bg] border border-[--card-border]";
		}
	};

	const buildLink = (entry) => {
		const name = entry.profileData?.gameName || "Unknown";
		const tag = entry.profileData?.tagLine || "Unknown";
		return (
			buildProfileUrl("tft", region, name, tag) ||
			`/tft/profile?gameName=${encodeURIComponent(name)}&tagLine=${encodeURIComponent(tag)}&region=${encodeURIComponent(
				region
			)}`
		);
	};

	const getRankEmblemSrc = (tierValue) => {
		const tierKey = (tierValue || "iron").toLowerCase().split(" ")[0];
		return `/images/league/rankedEmblems/${tierKey}.webp`;
	};

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.25em] text-[--text-secondary] sm:text-[10px] sm:tracking-[0.4em]">
					<span>{tierLabel}</span>
					<span>Spotlight · Top {highlightPlayers.length}</span>
				</div>
				<div className="grid gap-5 lg:grid-cols-3">
					{highlightPlayers.length === 0 ? (
						<div className="col-span-full rounded-3xl border border-dashed border-[--card-border] bg-[--card-bg] py-12 text-center text-[--text-secondary]">
							No spotlight players yet.
						</div>
					) : (
						highlightPlayers.map((entry, index) => {
							const wins = Number(entry.wins) || 0;
							const losses = Number(entry.losses) || 0;
							const winrate = getWinrateInfo(wins, losses);
							const totalGames = wins + losses;

							return (
								<div
									key={entry.puuid || `${entry.summonerName || "player"}-${index}`}
									className={`relative overflow-hidden rounded-[26px] border border-transparent p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] sm:p-6 ${getTopCardGradient(
										index
									)}`}
								>
									<div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-60"></div>
									<div className="relative z-10 space-y-4">
										<div className="flex items-center justify-between text-xs uppercase tracking-widest text-[--text-secondary]">
											<div className="flex items-center gap-2">
												<span className="font-semibold text-lg text-white">{index + 1}</span>
												{index === 0 && <FaCrown className="text-yellow-400" />}
												{index === 1 && <FaMedal className="text-slate-300" />}
												{index === 2 && <FaMedal className="text-orange-400" />}
											</div>
											<span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold">
												{regionCode}
											</span>
										</div>

										<Link href={buildLink(entry)} className="flex min-w-0 items-center gap-3 sm:gap-4">
											<div className="relative h-14 w-14 rounded-full border border-white/30 bg-gradient-to-br from-white/10 to-transparent sm:h-16 sm:w-16">
												{entry.profileData?.profileIconId ? (
													<Image
														src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${entry.profileData.profileIconId}.jpg`}
														alt="Summoner Icon"
														fill
														className="rounded-full object-cover"
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center rounded-full bg-white/10 text-[--text-secondary]">
														?
													</div>
												)}
											</div>
											<div className="min-w-0 flex-1">
												<div className="truncate text-base font-semibold text-white sm:text-lg">
													{entry.profileData?.gameName || "Unknown"}
												</div>
												<div className="text-[12px] text-[--text-secondary]">
													#{entry.profileData?.tagLine || "0000"}
												</div>
											</div>
										</Link>

										<div className="flex items-center gap-2 text-3xl font-bold tracking-tight text-cyan-400 sm:text-4xl">
											<FaCrown className="text-cyan-300" />
											{entry.leaguePoints} LP
										</div>

										<div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[--text-secondary] sm:text-sm">
											<div>
												<p className="text-xs uppercase tracking-[0.2em] text-[--text-secondary]">Record</p>
												<span className="text-white font-semibold">
													{wins}W · {losses}L
												</span>
											</div>
											<div>
												<p className="text-xs uppercase tracking-[0.2em] text-[--text-secondary]">Win Rate</p>
												<span className="font-bold text-indigo-300">{winrate.display}</span>
											</div>
											<div>
												<p className="text-xs uppercase tracking-[0.2em] text-[--text-secondary]">Games</p>
												<span className="font-bold text-white">{totalGames}</span>
											</div>
										</div>

										<div className="h-2 w-full rounded-full bg-white/10">
											<div
												className={`h-full rounded-full bg-gradient-to-r ${winrate.color}`}
												style={{ width: `${winrate.percent}%` }}
											></div>
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			<div className="overflow-hidden rounded-[28px] border border-[--card-border] bg-[--card-bg-secondary]/60 shadow-[0_40px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl">
				<div className="hidden grid-cols-[2.4fr,1.6fr,2.5fr] border-b border-[--card-border] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[--text-secondary] sm:grid">
					<div>Player</div>
					<div>Rank</div>
					<div>Winrate</div>
				</div>

				{tablePlayers.length === 0 ? (
					<div className="px-6 py-8 text-sm text-[--text-secondary] text-center">
						Fewer than four players available for this tier + region combination.
					</div>
				) : (
					<div className="divide-y divide-[--card-border]">
						{tablePlayers.map((entry, index) => {
							const wins = Number(entry.wins) || 0;
							const losses = Number(entry.losses) || 0;
							const winrate = getWinrateInfo(wins, losses);
							const isEven = index % 2 === 0;
							const currentRank = tableStartRank + index;
							const tierUpper = (entry.tier || tier || "").toUpperCase();
							const includeDivision = !["CHALLENGER", "GRANDMASTER", "MASTER"].includes(tierUpper);

							return (
								<div
									key={entry.puuid || `${entry.summonerName || "player"}-${currentRank}`}
									className={`grid grid-cols-1 gap-3 px-3 py-4 text-xs sm:grid-cols-[2.4fr,1.5fr,2.8fr] sm:items-center sm:gap-0 sm:px-6 sm:py-4 sm:text-sm ${
										isEven ? "bg-[--card-bg]/80" : "bg-[--card-bg-secondary]/60"
									}`}
								>
									<div className="flex min-w-0 items-center gap-2 sm:gap-3">
										<span className="w-7 text-right text-[10px] text-[--text-secondary] sm:w-8 sm:text-[11px]">
											#{currentRank}
										</span>
										<Link href={buildLink(entry)} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
											<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[--card-bg] sm:h-12 sm:w-12">
												{entry.profileData?.profileIconId ? (
													<Image
														src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${entry.profileData.profileIconId}.jpg`}
														alt="Profile Icon"
														fill
														className="object-cover"
													/>
													) : (
														<div className="flex h-full w-full items-center justify-center bg-white/5 text-[--text-secondary]">
															?
														</div>
													)}
											</div>
											<div className="min-w-0 overflow-hidden">
												<div className="truncate text-xs font-semibold text-white sm:text-sm">
													{entry.profileData?.gameName || "Unknown"}
												</div>
												<div className="text-[11px] text-[--text-secondary] sm:text-xs">
													#{entry.profileData?.tagLine || "0000"}
												</div>
											</div>
										</Link>
									</div>

									<div className="flex flex-col items-start gap-1.5 sm:gap-2 sm:px-2">
										<div className="flex items-center gap-2 sm:gap-3">
											<Image
												src={getRankEmblemSrc(entry.tier || tier)}
												alt={`${entry.tier || "Iron"} emblem`}
												width={44}
												height={44}
												className="h-9 w-9 sm:h-11 sm:w-11"
											/>
											<span className="text-xl font-extrabold text-cyan-400 sm:text-2xl">
												{entry.leaguePoints} LP
											</span>
										</div>
										{includeDivision && entry.rank && (
											<span className="text-[10px] uppercase text-[--text-secondary] sm:text-xs">
												{entry.rank}
											</span>
										)}
									</div>

									<div className="flex flex-col gap-1">
										<div className="relative">
											<div className="h-9 rounded-full bg-white/10 sm:h-10"></div>
											<div
												className={`absolute inset-y-1 left-0 h-7 rounded-full bg-gradient-to-r sm:h-8 ${winrate.color}`}
												style={{ width: `${winrate.percent}%` }}
											></div>
											<div className="absolute inset-0 flex items-center justify-between px-3 text-[11px] text-white sm:px-4 sm:text-[12px]">
												<span>{wins}W / {losses}L</span>
												<span>{winrate.display}</span>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default TFTLeaderboardTable;
