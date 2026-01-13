import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import useTFTProfileData from "@/app/hooks/tft/useProfileData";
import TFTRankedInfo from "./RankedInfo";
import TFTMatchHistory from "./MatchHistory";
import TopTraits from "./TopTraits";
import TopUnits from "./TopUnits";
import Last20GamesPerformance from "./Last20GamesPerformance";
import LiveGame from "./LiveGame";
import Loading from "@/components/Loading";
import ErrorPage from "@/components/ErrorPage";
import DiscordBotBanner from "@/components/DiscordBotBanner.js";
import {
	fetchTFTCompanions,
	getCompanionIconUrl,
} from "@/lib/tft/companionsApi";
import { scrapeTFTLadderRanking } from "@/lib/opggApi.js";
import { useAuth } from "@/context/AuthContext";
import {
	FaSync,
	FaGamepad,
	FaCheckCircle,
	FaIdCard,
	FaTrophy
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

export default function Profile({
	profileData,
	triggerUpdate,
	isUpdating,
	onLoadComplete,
}) {
	const { summonerData, rankedData, matchDetails, liveGameData, isLoading } =
		useTFTProfileData(profileData);
	const [tab, setTab] = useState("matches");
	const [isLiveGameOpen, setIsLiveGameOpen] = useState(false);

	// Update functionality
	const [isUpdated, setIsUpdated] = useState(false);
	const [lastUpdated, setLastUpdated] = useState(null);
	const [countdown, setCountdown] = useState(0);
	const [updateTriggered, setUpdateTriggered] = useState(false);
	const intervalRef = useRef(null);

	// Add states for unit and trait selection
	const [selectedUnitId, setSelectedUnitId] = useState(null);
	const [selectedTraitId, setSelectedTraitId] = useState(null);

	// Lift state up for sharing TFT data between components
	const [traitsData, setTraitsData] = useState({});
	const [championsData, setChampionsData] = useState({});
	const [isDataLoaded, setIsDataLoaded] = useState(false);

	// State for ladder ranking
	const [ladderRanking, setLadderRanking] = useState(null);
	const [isLoadingLadder, setIsLoadingLadder] = useState(false);

	// Claim state
	const { user, loginWithRiot } = useAuth();
	const [claimStatus, setClaimStatus] = useState({ loading: true, claimed: false, ownClaim: false });
	const [claimLoading, setClaimLoading] = useState(false);
	const [claimError, setClaimError] = useState("");

	useEffect(() => {
		const fetchClaim = async () => {
			try {
				const regionForClaim = (profileData?.accountdata?.region || "euw1").toUpperCase();
				const params = new URLSearchParams({
					gameName: summonerData?.name || "",
					tagLine: summonerData?.tagLine || "",
					region: regionForClaim,
					mode: "tft",
				});
				if (user?.puuid) params.set("viewerPuuid", user.puuid);
				const res = await fetch(`/api/claims/status?${params.toString()}`);
				let json = {};
				try { json = await res.json(); } catch { }
				setClaimStatus({ loading: false, claimed: !!json.claimed, ownClaim: !!json.ownClaim });
			} catch {
				setClaimStatus({ loading: false, claimed: false, ownClaim: false });
			}
		};
		if (summonerData?.name && summonerData?.tagLine) fetchClaim();
	}, [summonerData?.name, summonerData?.tagLine, profileData?.accountdata?.region, user?.puuid]);

	const canClaim = !!user && user.puuid && summonerData?.puuid === user.puuid;
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
					gameName: summonerData.name,
					tagLine: summonerData.tagLine,
					region: (profileData?.region || "euw1").toLowerCase(),
					mode: "tft",
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
		const storedLastUpdated = localStorage.getItem("tft_lastUpdated");
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
				localStorage.removeItem("tft_lastUpdated");
			}
		}
	}, []);

	// Fetch TFT data (traits and champions)
	useEffect(() => {
		async function fetchTFTData() {
			try {
				// Fetch traits from Community Dragon
				const traitsResponse = await fetch(
					"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tfttraits.json"
				);
				const traitsJson = await traitsResponse.json();
				const traitsMap = {};
				traitsJson.forEach((trait) => {
					if (trait && trait.trait_id) {
						const traitData = {
							name: trait.name,
							description: trait.desc,
							iconPath: trait.icon_path,
						};
						traitsMap[trait.trait_id] = traitData;
						traitsMap[trait.trait_id.toUpperCase()] = traitData;
					}
				});

				// Fetch champions from Community Dragon for basic info
				const championsResponse = await fetch(
					"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tftchampions.json"
				);
				const championsJson = await championsResponse.json();
				const championsMap = {};
				championsJson.forEach((champion) => {
					if (champion && champion.character_id) {
						const champData = {
							name: champion.name,
							cost: champion.cost,
							traits: champion.traits || [],
							iconPath: champion.squareIconPath,
						};
						championsMap[champion.character_id] = champData;
						championsMap[champion.character_id.toUpperCase()] = champData;
					}
				});

				setTraitsData(traitsMap);
				setChampionsData(championsMap);
				setIsDataLoaded(true);
			} catch (error) {
				console.error("Error fetching TFT data:", error);
				setIsDataLoaded(true);
			}
		}
		fetchTFTData();
	}, []);

	useEffect(() => {
		if (isUpdated && countdown > 0) {
			intervalRef.current = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						clearInterval(intervalRef.current);
						setIsUpdated(false);
						setLastUpdated(null);
						localStorage.removeItem("tft_lastUpdated");
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

	// We'll now use the useEffect to handle updates just like the League implementation
	useEffect(() => {
		if (!isUpdating && updateTriggered) {
			const now = new Date();
			setIsUpdated(true);
			setLastUpdated(now);
			setCountdown(120);
			setUpdateTriggered(false);
			localStorage.setItem("tft_lastUpdated", now.toISOString());
		}
	}, [isUpdating, updateTriggered]);

	// Fetch TFT ladder ranking data from OP.GG
	useEffect(() => {
		const fetchLadderRanking = async () => {
			if (summonerData?.name && summonerData?.tagLine && profileData?.region) {
				setIsLoadingLadder(true);

				// Create a timeout to prevent infinite loading
				const timeoutId = setTimeout(() => {
					setIsLoadingLadder(false);
					if (onLoadComplete) {
						onLoadComplete();
					}
				}, 5000); // 5 second timeout

				try {
					const ladderData = await scrapeTFTLadderRanking(
						summonerData.name,
						summonerData.tagLine,
						profileData.region.toLowerCase()
					);
					setLadderRanking(ladderData);
					// Clear the timeout since we got a response
					clearTimeout(timeoutId);
				} catch (error) {
					console.error("Error fetching TFT ladder ranking:", error);
					// Clear the timeout since we got an error
					clearTimeout(timeoutId);
				} finally {
					setIsLoadingLadder(false);
					// Call onLoadComplete callback if provided
					if (onLoadComplete) {
						onLoadComplete();
					}
				}
			}
		};

		if (summonerData) {
			fetchLadderRanking();
		} else if (onLoadComplete) {
			// If no summoner data, call onLoadComplete immediately
			onLoadComplete();
		}
	}, [summonerData, profileData?.region, updateTriggered, onLoadComplete]);

	// Handler for unit selection
	const handleUnitClick = (unitId) => {
		setSelectedUnitId(unitId === selectedUnitId ? null : unitId);
	};

	// Handler for trait selection
	const handleTraitClick = (traitId) => {
		setSelectedTraitId(traitId === selectedTraitId ? null : traitId);
	};

	// Show loading until all data is fetched, but don't wait for ladder ranking
	if (isLoading || !isDataLoaded) {
		return <Loading />;
	}

	if (!summonerData) {
		return (
			<ErrorPage
				error="Summoner Not Found"
				title="Summoner Not Found"
				onRetry={() => window.location.reload()}
			/>
		);
	} // Find TFT ranked queue - ensure rankedData is an array
	const tftRanked = Array.isArray(rankedData)
		? rankedData.find((queue) => queue.queueType === "RANKED_TFT")
		: null;
	const rankedIcon =
		tftRanked && tftRanked.tier && tftRanked.tier.toLowerCase() !== 'unranked'
			? `/images/league/rankedEmblems/${tftRanked.tier.toLowerCase()}.webp`
			: null;
	// Derive division (I/II/III/IV) from combined rank string if available
	const tftDivision =
		tftRanked && typeof tftRanked.rank === "string" && tftRanked.rank.toLowerCase() !== "unranked"
			? (tftRanked.rank.split(" ")[1] || "")
			: "";

	return (
		<main className="min-h-screen bg-transparent text-white">
			<div className="w-full relative z-10 mb-6">
				<div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 pt-6 pb-2">
					<div className="flex flex-col md:flex-row items-center md:items-end gap-6">

						{/* Avatar Section - Minimal */}
						<div className="relative shrink-0">
							<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-1 ring-white/10 bg-white/5 shadow-lg">
								<Image
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summonerData.profileIconId}.jpg`}
									alt="Player Icon"
									width={112}
									height={112}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2">
								<span className="px-2 py-0.5 rounded-md bg-[--card-bg] border border-[--card-border] text-[--text-secondary] text-[10px] font-bold shadow-sm whitespace-nowrap">
									Lvl {summonerData.summonerLevel}
								</span>
							</div>
						</div>

						{/* Info Section - Integrated */}
						<div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left min-w-0 pb-1">
							<div className="flex items-baseline gap-2 mb-2">
								<div className="flex items-center gap-2">
									<h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
										{summonerData.name}
									</h1>
									{claimStatus?.claimed && (
										<MdVerified className="text-blue-400 text-2xl" title="Verified Player" />
									)}
								</div>
								<span className="text-xl text-[--text-secondary] font-medium">
									#{summonerData.tagLine}
								</span>
							</div>

							{/* Rank Info Row */}
							{tftRanked ? (
								<div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
									<div className="flex items-center gap-2">
										{rankedIcon && (
											<div className="relative">
												<Image src={rankedIcon} alt="Rank" width={52} height={52} className="object-contain" />
												{tftDivision && (
													<div className="absolute -bottom-1 -right-1 bg-black text-[9px] border border-white/20 font-bold flex items-center justify-center w-4 h-4 rounded-full">
														{tftDivision}
													</div>
												)}
											</div>
										)}
										<div className="flex flex-col">
											<span className="text-lg font-bold text-white leading-none">
												<span style={{ color: `var(--${tftRanked.tier.toLowerCase()})` }}>{tftRanked.tier ? tftRanked.tier : "Unranked"}</span>
											</span>
											<span className="text-sm text-[--text-secondary]">
												{tftRanked.leaguePoints} LP
											</span>
										</div>
									</div>

									<div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

									<div className="flex items-center gap-4 text-sm">
										<div className="flex flex-col items-center md:items-start">
											<span className="text-[10px] uppercase text-[--text-secondary] font-bold">Win Rate</span>
											<span className={`font-bold ${(tftRanked.wins / (tftRanked.wins + tftRanked.losses)) * 100 >= 15 ? 'text-[--success]' : 'text-[--text-primary]'
												}`}>
												{tftRanked.wins === 0 && tftRanked.losses === 0 ? "0.0" : ((tftRanked.wins / (tftRanked.wins + tftRanked.losses)) * 100).toFixed(1)}%
											</span>
										</div>
										<div className="flex flex-col items-center md:items-start text-[--text-secondary]">
											<span className="text-[10px] uppercase font-bold">Record</span>
											<span>
												<span className="text-white">{tftRanked.wins}</span>W - <span className="text-white">{tftRanked.losses}</span>L
											</span>
										</div>
									</div>

									{/* Ladder Rank */}
									{ladderRanking && (
										<>
											<div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />
											<div className="flex flex-col items-center md:items-start">
												<span className="text-[10px] uppercase text-[--text-secondary] font-bold flex items-center gap-1">
													<FaTrophy className="text-[8px]" /> Ladder
												</span>
												<span className="text-sm font-bold text-[--primary-tft]">
													#{ladderRanking.rank}
												</span>
											</div>
										</>
									)}
								</div>
							) : (
								<div className="text-[--text-secondary] font-medium py-2">
									Unranked in TFT
								</div>
							)}
						</div>

						{/* Actions - Right Aligned & Minimal */}
						<div className="flex flex-wrap items-center justify-center md:justify-end gap-3 pb-1">
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

							{liveGameData && (
								<button onClick={() => setIsLiveGameOpen(!isLiveGameOpen)} className="h-9 px-4 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all duration-200 bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white">
									<FaGamepad />
									<span>Live Game</span>
								</button>
							)}

							{/* Claim Actions */}
							<div className="flex items-center gap-2">
								{claimStatus.loading && <span className="text-xs text-white/30">...</span>}

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
											mode: "tft",
											gameName: summonerData.name,
											tagLine: summonerData.tagLine,
											region: (profileData?.region || "euw1").toUpperCase(),
										}).toString()}
										className="h-10 px-4 rounded-full flex items-center gap-2 text-sm font-bold bg-fuchsia-500/10 border border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-white transition-all transform hover:scale-105"
									>
										<FaIdCard />
										<span>Card</span>
									</a>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-8">
				{/* Live Game Section (Conditionally Rendered) */}
				{liveGameData && isLiveGameOpen && (
					<div className="w-full mb-8">
						<LiveGame liveGameData={liveGameData} region={profileData.region} matchHistory={matchDetails} />
					</div>
				)}

				<div className="flex flex-col lg:flex-row gap-6">
					{/* Left Column */}
					<div className="w-full lg:w-1/3 space-y-6">
						<TFTRankedInfo rankedData={rankedData} />

						{/* Top Traits Component */}
						<TopTraits matchDetails={matchDetails} summonerData={summonerData} traitsData={traitsData} />

						{/* Top Units Component */}
						<TopUnits matchDetails={matchDetails} summonerData={summonerData} championsData={championsData} />

						{/* Discord Bot Banner */}
						<DiscordBotBanner />
					</div>

					{/* Right Column */}
					<div className="w-full lg:w-2/3">
						{/* Last 20 Games Performance Component */}
						<div className="mb-6">
							<Last20GamesPerformance matchDetails={matchDetails} summonerData={summonerData} />
						</div>

						{/* Tab Content */}
						<div className="card-highlight">
							{tab === "matches" && (
								<TFTMatchHistory matchDetails={matchDetails} summonerData={summonerData} sharedTraitsData={traitsData} sharedChampionsData={championsData} />
							)}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
