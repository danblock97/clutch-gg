import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import DiscordBotBanner from "@/components/DiscordBotBanner.js";
import { scrapeLeagueLadderRanking } from "@/lib/opggApi.js";
import {
	FaSync,
	FaGamepad,
	FaCheckCircle,
	FaExclamationCircle,
	FaIdCard,
	FaClock,
	FaTrophy
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

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

	return (
		<div className="w-full relative z-10 mb-6">
			<div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 pt-6 pb-2">
				<div className="flex flex-col md:flex-row items-center md:items-end gap-6">

					{/* Avatar Section - Minimal */}
					<div className="relative shrink-0">
						<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-1 ring-white/10 bg-white/5 shadow-lg">
							<Image
								src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileData.profileIconId}.jpg`}
								alt="Player Icon"
								width={112}
								height={112}
								className="w-full h-full object-cover"
							/>
						</div>
						<div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2">
							<span className="px-2 py-0.5 rounded-md bg-[--card-bg] border border-[--card-border] text-[--text-secondary] text-[10px] font-bold shadow-sm">
								Lvl {profileData.summonerLevel}
							</span>
						</div>
					</div>

					{/* Info Section - Integrated */}
					<div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left">
						<div className="flex items-baseline gap-2 mb-2">
							<div className="flex items-center gap-2">
								<h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
									{accountData.gameName}
								</h1>
								{claimStatus?.claimed && (
									<MdVerified className="text-blue-400 text-2xl" title="Verified Player" />
								)}
							</div>
							<span className="text-xl text-[--text-secondary] font-medium">
								#{accountData.tagLine}
							</span>
						</div>

						{/* Rank Info Row */}
						{soloRankedData ? (
							<div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
								<div className="flex items-center gap-2">
									{rankedIcon && (
										<Image
											src={rankedIcon}
											alt="Rank"
											width={52}
											height={52}
											className="object-contain"
										/>
									)}
									<div className="flex flex-col">
										<span className="text-lg font-bold text-white leading-none">
											<span style={{ color: `var(--${soloRankedData.tier.toLowerCase()})` }}>{soloRankedData.tier}</span>
											<span className="ml-1.5">{soloRankedData.rank}</span>
										</span>
										<span className="text-sm text-[--text-secondary]">
											{soloRankedData.leaguePoints} LP
										</span>
									</div>
								</div>

								<div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

								<div className="flex items-center gap-4 text-sm">
									<div className="flex flex-col items-center md:items-start">
										<span className="text-[10px] uppercase text-[--text-secondary] font-bold">Win Rate</span>
										<span className={`font-bold ${(soloRankedData.wins / (soloRankedData.wins + soloRankedData.losses)) * 100 >= 50 ? 'text-[--success]' : 'text-[--text-primary]'
											}`}>
											{((soloRankedData.wins / (soloRankedData.wins + soloRankedData.losses)) * 100).toFixed(0)}%
										</span>
									</div>
									<div className="flex flex-col items-center md:items-start text-[--text-secondary]">
										<span className="text-[10px] uppercase font-bold">Record</span>
										<span>
											<span className="text-white">{soloRankedData.wins}</span>W - <span className="text-white">{soloRankedData.losses}</span>L
										</span>
									</div>
								</div>

								{ladderRanking && (
									<>
										<div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />
										<div className="flex flex-col items-center md:items-start">
											<span className="text-[10px] uppercase text-[--text-secondary] font-bold flex items-center gap-1">
												<FaTrophy className="text-[8px]" /> Ladder
											</span>
											<span className="text-sm font-bold text-[--primary]">
												#{ladderRanking.rank}
											</span>
										</div>
									</>
								)}
							</div>
						) : (
							<div className="text-[--text-secondary] font-medium py-2">
								Unranked in Solo/Duo
							</div>
						)}
					</div>

					{/* Actions - Right Aligned & Minimal */}
					<div className="flex flex-wrap items-center justify-center md:justify-end gap-3 pb-1">
						{/* Update Button */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								triggerUpdate();
								setUpdateTriggered(true);
							}}
							disabled={isUpdating || countdown > 0}
							className={`h-9 px-4 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all duration-200 border ${isUpdating || countdown > 0
								? "bg-white/5 border-white/5 text-[--text-secondary] cursor-not-allowed"
								: "bg-transparent border-[--card-border] text-[--text-primary] hover:bg-[--card-bg] hover:border-white/20"
								}`}
						>
							<FaSync className={`text-xs ${isUpdating ? "animate-spin" : ""}`} />
							<span>
								{isUpdating ? "Updating..." : countdown > 0 ? `${countdown}s` : "Update"}
							</span>
						</button>

						{/* Live Game Button */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								if (liveGameData) toggleLiveGame();
							}}
							disabled={!liveGameData}
							className={`h-9 px-4 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all duration-200 border ${liveGameData
								? "bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
								: "bg-transparent border-[--card-border] text-[--text-secondary]/50 cursor-not-allowed"
								}`}
						>
							<FaGamepad />
							<span>Live Game</span>
						</button>

						{/* Claim Actions */}
						{!claimStatus.loading && !claimStatus.claimed && canClaim && (
							<button
								onClick={() => {
									handleClaim();
								}}
								disabled={claimLoading}
								className={`h-10 w-10 rounded-full flex items-center justify-center text-lg transition-all border ${canClaim
										? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500 hover:text-white"
										: "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
									}`}
								title="Claim Profile"
							>
								<FaCheckCircle />
							</button>
						)}

						{!claimStatus.loading && user && claimStatus.claimed && claimStatus.ownClaim && (
							<a
								href={`/card?` + new URLSearchParams({
									mode: "league",
									gameName: accountData.gameName,
									tagLine: accountData.tagLine,
									region: (region || "euw1").toUpperCase(),
								}).toString()}
								className="h-10 px-4 rounded-full flex items-center gap-2 text-sm font-bold bg-fuchsia-500/10 border border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-white transition-all transform hover:scale-105"
							>
								<FaIdCard />
								<span>Card</span>
							</a>
						)}
					</div>
				</div>

				{/* Mobile Banner */}
				<div className="md:hidden mt-4">
					<DiscordBotBanner />
				</div>
			</div>
			{/* Desktop Banner Absolute or integrated */}
			<div className="hidden md:block absolute top-6 right-6 z-0 opacity-80 hover:opacity-100 transition-opacity">
				{/*  Simplified banner placement or removed for cleaner look? 
                      User asked for "minimal". Let's keep it but make it less obtrusive if possible, 
                      or just keep standard placement. Let's stick to standard flow to avoid overlapping content.
                  */}
			</div>
		</div>
	);
};

export default Profile;
