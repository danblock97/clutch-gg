import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import DiscordBotBanner from "@/components/DiscordBotBanner.js";
import { scrapeLeagueLadderRanking } from "@/lib/opggApi.js";

const Profile = ({
	accountData,
	profileData,
	rankedData,
	toggleLiveGame,
	triggerUpdate,
	isUpdating,
	liveGameData,
	region,
}) => {
	const soloRankedData =
		rankedData && rankedData.RANKED_SOLO_5x5
			? rankedData.RANKED_SOLO_5x5
			: null;

	const rankedIcon = soloRankedData
		? `/images/league/rankedEmblems/${soloRankedData.tier.toLowerCase()}.webp`
		: null;

	const [isUpdated, setIsUpdated] = useState(false);
	const [lastUpdated, setLastUpdated] = useState(null);
	const [countdown, setCountdown] = useState(0);
	const [updateTriggered, setUpdateTriggered] = useState(false);
	const [seasonUpdateTrigger, setSeasonUpdateTrigger] = useState(0);
	const [ladderRanking, setLadderRanking] = useState(null);
	const [isLoadingLadder, setIsLoadingLadder] = useState(false);
	const intervalRef = useRef(null);

	// Claim state
	const { user, loginWithRiot } = useAuth();
	const [claimStatus, setClaimStatus] = useState({ loading: true, claimed: false, ownClaim: false });
	const [claimLoading, setClaimLoading] = useState(false);
	const [claimError, setClaimError] = useState("");

	useEffect(() => {
		const fetchClaim = async () => {
			try {
				const params = new URLSearchParams({
					gameName: accountData?.gameName || "",
					tagLine: accountData?.tagLine || "",
					region: (region || "euw1").toUpperCase(),
					mode: "league",
				});
				if (user?.puuid) params.set("viewerPuuid", user.puuid);
				const res = await fetch(`/api/claims/status?${params.toString()}`);
				const json = await res.json();
				setClaimStatus({ loading: false, claimed: !!json.claimed, ownClaim: !!json.ownClaim });
			} catch {
				setClaimStatus({ loading: false, claimed: false, ownClaim: false });
			}
		};
		if (accountData?.gameName && accountData?.tagLine && region) fetchClaim();
	}, [accountData?.gameName, accountData?.tagLine, region, user?.puuid]);

	const canClaim = !!user && user.puuid && profileData?.puuid === user.puuid;
	const handleClaim = async () => {
		if (!canClaim) return;
		setClaimLoading(true);
		setClaimError("");
		try {
            const res = await fetch("/api/claims/claim", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.NEXT_PUBLIC_UPDATE_API_KEY,
                },
                body: JSON.stringify({
                    gameName: accountData.gameName,
                    tagLine: accountData.tagLine,
                    region: (region || "euw1").toLowerCase(),
                    mode: "league",
                    ownerPuuid: user.puuid,
                }),
            });
			const json = await res.json().catch(() => ({}));
			if (res.ok) {
				setClaimStatus({ loading: false, claimed: true, ownClaim: true });
			} else {
				setClaimError(json?.error || "Failed to claim profile");
			}
		} catch (e) {
			setClaimError(e?.message || "Network error");
		} finally {
			setClaimLoading(false);
		}
	};

	// Initialize state from localStorage on mount
	useEffect(() => {
		const storedLastUpdated = localStorage.getItem("lastUpdated");
		if (storedLastUpdated) {
			const lastUpdatedTime = new Date(storedLastUpdated);
			const now = new Date();
			const elapsedSeconds = Math.floor((now - lastUpdatedTime) / 1000);
			const remainingSeconds = 120 - elapsedSeconds;

			if (remainingSeconds > 0) {
				setIsUpdated(true);
				setLastUpdated(lastUpdatedTime);
				setCountdown(remainingSeconds);
			} else {
				localStorage.removeItem("lastUpdated");
			}
		}
	}, []);

	useEffect(() => {
		if (!isUpdating && updateTriggered) {
			const now = new Date();
			setIsUpdated(true);
			setLastUpdated(now);
			setCountdown(120);
			setUpdateTriggered(false);
			setSeasonUpdateTrigger((prev) => prev + 1); // Trigger SeasonRanks update
			localStorage.setItem("lastUpdated", now.toISOString());
		}
	}, [isUpdating, updateTriggered]);

	useEffect(() => {
		if (isUpdated && countdown > 0) {
			intervalRef.current = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						clearInterval(intervalRef.current);
						setIsUpdated(false);
						setLastUpdated(null);
						localStorage.removeItem("lastUpdated");
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isUpdated, countdown]);

	// Fetch ladder ranking data from OP.GG
	useEffect(() => {
		const fetchLadderRanking = async () => {
			if (accountData?.gameName && accountData?.tagLine && region) {
				setIsLoadingLadder(true);
				try {
					const ladderData = await scrapeLeagueLadderRanking(
						accountData.gameName,
						accountData.tagLine,
						region.toLowerCase()
					);
					setLadderRanking(ladderData);
				} catch (error) {
					console.error("Error fetching ladder ranking:", error);
				} finally {
					setIsLoadingLadder(false);
				}
			}
		};

		fetchLadderRanking();
	}, [accountData?.gameName, accountData?.tagLine, region, updateTriggered]);

	// Helper function to format "time ago"
	const timeAgo = (date) => {
		const now = new Date();
		const seconds = Math.floor((now - date) / 1000);

		let interval = Math.floor(seconds / 31536000);
		if (interval >= 1)
			return `${interval} year${interval !== 1 ? "s" : ""} ago`;

		interval = Math.floor(seconds / 2592000);
		if (interval >= 1)
			return `${interval} month${interval !== 1 ? "s" : ""} ago`;

		interval = Math.floor(seconds / 86400);
		if (interval >= 1) return `${interval} day${interval !== 1 ? "s" : ""} ago`;

		interval = Math.floor(seconds / 3600);
		if (interval >= 1)
			return `${interval} hour${interval !== 1 ? "s" : ""} ago`;

		interval = Math.floor(seconds / 60);
		if (interval >= 1)
			return `${interval} minute${interval !== 1 ? "s" : ""} ago`;

		return "Just now";
	};

	return (
		<>
				<div className="w-full py-8 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06),_transparent_60%)]">
					<div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6">
						<div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
							{/* Left Side: Profile Icon & Level */}
							<div className="flex-shrink-0 relative">
								<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-1 ring-white/15 bg-white/5">
									<Image
										src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileData.profileIconId}.jpg`}
										alt="Player Icon"
										width={112}
										height={112}
										className="w-full h-full object-cover"
									/>
								</div>
								<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-white text-[11px] font-semibold py-1 px-2 rounded-full border border-white/20 bg-gradient-to-r from-[--primary]/70 to-[--secondary]/70">
									{profileData.summonerLevel}
								</div>
							</div>

							{/* Middle: Name, Tag, Ranked Info */}
							<div className="flex-grow flex flex-col">
								<h1 className="text-3xl sm:text-4xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
									{`${accountData.gameName}`}
									<span className="text-[--text-secondary] text-base sm:text-lg font-medium">
										#{accountData.tagLine}
									</span>
								</h1>

								{/* Solo Queue Rank */}
								{soloRankedData ? (
									<div className="flex items-center mt-3">
										{rankedIcon && (
											<div className="relative mr-3">
												<Image
													src={rankedIcon}
													alt={`${soloRankedData.tier} Emblem`}
													width={40}
													height={40}
													className=""
												/>
												<div className="absolute -bottom-1 -right-1 bg-[--card-bg] text-[10px] px-1 rounded-md border border-[--card-border]">
													{soloRankedData.rank}
												</div>
											</div>
										)}
										<div>
											<p className="font-semibold text-lg">
												<span className={`text-[--${soloRankedData.tier.toLowerCase()}]`}>
													{soloRankedData.tier}
												</span>
												<span className="text-[--text-primary] ml-2">
													{soloRankedData.leaguePoints} LP
												</span>
											</p>
											<p className="text-[--text-secondary] text-sm">
												{soloRankedData.wins}W - {soloRankedData.losses}L (
													{(
														(soloRankedData.wins /
															(soloRankedData.wins + soloRankedData.losses)) *
														100
													).toFixed(1)}
												% WR)
											</p>

											{/* Ladder Ranking */}
											{ladderRanking && (
												<p className="text-[--text-secondary] text-xs mt-1">
													Ladder Rank {" "}
													<span className="text-[--primary]">{ladderRanking.rank}</span> {" "}
													({ladderRanking.percentile}% of top)
												</p>
											)}
											{isLoadingLadder && (
												<p className="text-[--text-secondary] text-xs mt-1">
													Loading ladder ranking...
												</p>
											)}
										</div>
									</div>
								) : (
									<p className="text-[--text-secondary] font-semibold">Unranked</p>
								)}

								{/* Action Buttons */}
								<div className="flex flex-wrap gap-2 mt-4">
									<button
										onClick={(e) => {
											e.stopPropagation();
											triggerUpdate();
											setUpdateTriggered(true);
										}}
										className={`relative overflow-hidden rounded-full text-sm font-semibold transition-all duration-300 inline-flex items-center justify-center px-4 py-1.5 shadow-sm ${
												isUpdating
													? "bg-gray-600 opacity-50 cursor-not-allowed"
													: isUpdated
													? "bg-emerald-500/90 hover:bg-emerald-500 text-white"
													: "bg-gradient-to-r from-[--primary] to-[--secondary] hover:opacity-95 text-white"
												}`}
										disabled={isUpdating || countdown > 0}
									>
										{isUpdating && (
											<svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
											</svg>
										)}
										{isUpdating ? "Updating..." : isUpdated ? "Updated" : "Update Profile"}
									</button>

									<button
										onClick={(e) => {
											e.stopPropagation();
											if (liveGameData) toggleLiveGame();
										}}
										disabled={!liveGameData}
										className={`relative overflow-hidden rounded-full text-sm font-semibold transition-all duration-300 inline-flex items-center justify-center px-4 py-1.5 shadow-sm ${
												liveGameData
													? "bg-gradient-to-r from-rose-500 to-orange-500 hover:opacity-95 text-white"
													: "bg-gray-700 text-gray-400 cursor-not-allowed"
												}`}
									>
										{liveGameData ? (
											<>
												<span className="relative flex h-2 w-2 mr-2">
													<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
													<span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
												</span>
												Live Game
											</>
										) : (
											"Not In Game"
										)}
									</button>

									{/* Claim / Card buttons */}
									{claimStatus.loading ? null : (
										<>
									{!claimStatus.claimed && (
										<button
											onClick={() => {
												if (!user) return loginWithRiot();
												handleClaim();
											}}
										disabled={!canClaim || claimLoading}
										className={`relative overflow-hidden rounded-lg text-sm font-semibold transition-all duration-300 inline-flex items-center justify-center px-4 py-1.5 border ${
											canClaim && !claimLoading
												? "bg-indigo-500/90 hover:bg-indigo-400 text-white border-indigo-300/50 ring-1 ring-indigo-400/60 shadow-[0_0_14px_rgba(99,102,241,0.55)]"
												: "bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600"
										}`}
										>
											{claimLoading ? "Claiming..." : user ? (canClaim ? "Claim Profile" : "Sign-in mismatch") : "Sign in to claim"}
										</button>
									)}
                                    {claimError && (
                                        <span className="text-xs text-red-400 ml-2">{claimError}</span>
                                    )}
                                            {user && claimStatus.claimed && claimStatus.ownClaim && (
												<a
													href={`/card?` + new URLSearchParams({
														mode: "league",
														gameName: accountData.gameName,
														tagLine: accountData.tagLine,
														region: (region || "euw1").toUpperCase(),
													}).toString()}
													className="relative overflow-hidden rounded-lg text-sm font-semibold inline-flex items-center justify-center px-4 py-1.5 border bg-fuchsia-500/90 hover:bg-fuchsia-400 text-white border-fuchsia-300/50 ring-1 ring-fuchsia-400/60 shadow-[0_0_14px_rgba(232,121,249,0.55)]"
												>
													Create ClutchGG Card
												</a>
											)}
                                            {!user && claimStatus.claimed && !claimStatus.ownClaim && (
                                                <button
                                                    disabled
                                                    className="relative overflow-hidden rounded-lg text-sm font-semibold inline-flex items-center justify-center px-4 py-1.5 border bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600"
                                                >
                                                    Claimed by another account
                                                </button>
                                            )}
										</>
									)}

									{/* Timer */}
									{isUpdated && countdown > 0 && (
										<div className="text-xs text-[--text-secondary] self-center">
											Next update available in {countdown}s
										</div>
									)}
								</div>
							</div>

							{/* Right Side: Discord Bot Banner (Desktop) */}
							<div className="hidden lg:block flex-shrink-0">
								<DiscordBotBanner />
							</div>
						</div>
						{/* Discord Banner (Mobile) - Appears below on smaller screens */}
						<div className="lg:hidden mt-6">
							<DiscordBotBanner />
						</div>
					</div>
				</div>
			</>
	);
};

export default Profile;
