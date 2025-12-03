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
import NoProfileFound from "@/components/league/NoProfileFound";
import DiscordBotBanner from "@/components/DiscordBotBanner.js";
import { FaChevronDown, FaGamepad } from "react-icons/fa";
import {
	fetchTFTCompanions,
	getCompanionIconUrl,
} from "@/lib/tft/companionsApi";
import { scrapeTFTLadderRanking } from "@/lib/opggApi.js";
import { useAuth } from "@/context/AuthContext";

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
                try { json = await res.json(); } catch {}
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
		return <NoProfileFound />;
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
		<main className="min-h-screen bg-gray-900 text-white">
			<div className="w-full py-8 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06),_transparent_60%)]">
				<div className="container mx-auto px-4 sm:px-6">
					<div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
						{/* Left Side: Profile Icon & Level */}
						<div className="flex-shrink-0 relative">
							<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-1 ring-white/15 bg-white/5">
								<Image
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summonerData.profileIconId}.jpg`}
									alt="Player Icon"
									width={112}
									height={112}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-white text-[11px] font-semibold py-1 px-2 rounded-full border border-white/20 bg-gradient-to-r from-[--primary-tft]/70 to-[--secondary]/70">
								{summonerData.summonerLevel}
							</div>
						</div>

						{/* Middle: Name, Tag, Ranked Info */}
						<div className="flex-grow flex flex-col">
							<h1 className="text-3xl sm:text-4xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
								{summonerData.name}
								<span className="text-[--text-secondary] text-base sm:text-lg font-medium">
									#{summonerData.tagLine}
								</span>
							</h1>

							{/* TFT Queue Rank */}
							{tftRanked ? (
								<div className="flex items-center mt-3">
									{rankedIcon && (
										<div className="relative mr-3">
											<Image src={rankedIcon} alt={`${tftRanked.tier} Emblem`} width={40} height={40} />
											{tftDivision && (
												<div className="absolute -bottom-1 -right-1 bg-[--card-bg] border border-[--card-border] text-[10px] font-bold flex items-center justify-center w-5 h-5 rounded-full">
													{tftDivision}
												</div>
											)}
										</div>
									)}
									<div>
										<p className="font-semibold text-lg">
											<span style={{ color: `var(--${tftRanked.tier.toLowerCase()})` }}>{tftRanked.tier ? tftRanked.tier : "Unranked"}</span>
											<span className="text-[--text-primary] ml-2">{tftRanked.leaguePoints} LP</span>
										</p>
										<p className="text-[--text-secondary] text-sm">
											{tftRanked.wins}W - {tftRanked.losses}L (
											{tftRanked.wins === 0 && tftRanked.losses === 0 ? "0.0" : ((tftRanked.wins / (tftRanked.wins + tftRanked.losses)) * 100).toFixed(1)}
											% WR)
										</p>

										{/* TFT Ladder Ranking */}
										{ladderRanking && (
											<p className="text-[--text-secondary] text-xs mt-1">
												Ladder Rank <span className="text-[--primary-tft]">{ladderRanking.rank}</span> ({ladderRanking.percentile}% of top)
											</p>
										)}
										{isLoadingLadder && (
											<p className="text-[--text-secondary] text-xs mt-1">Loading ladder ranking...</p>
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
										isUpdating ? "bg-gray-600 opacity-50 cursor-not-allowed" : isUpdated ? "bg-emerald-500/90 hover:bg-emerald-500 text-white" : "bg-gradient-to-r from-[--primary-tft] to-[--secondary] hover:opacity-95 text-white"
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

						{/* Live Game Button - only displayed if there's a live game */}
						{liveGameData && (
							<button onClick={() => setIsLiveGameOpen(!isLiveGameOpen)} className="relative overflow-hidden rounded-full text-sm font-semibold transition-all duration-300 inline-flex items-center justify-center px-4 py-1.5 shadow-sm bg-gradient-to-r from-rose-500 to-orange-500 hover:opacity-95 text-white">
								<span className="relative flex h-2 w-2 mr-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
								</span>
								Live Game
							</button>
						)}

						{/* Claim / Card buttons */}
						<div className="flex items-center gap-2">
                            {claimStatus.loading && (
                                <span className="text-xs text-[--text-secondary]">Checking claim…</span>
                            )}

							{!claimStatus.loading && !claimStatus.claimed && (
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
                                {claimLoading ? "Claiming..." : (user ? (canClaim ? "Claim Profile" : "Sign-in mismatch") : "Sign in to claim")}
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
                                className="relative overflow-hidden rounded-lg text-sm font-semibold inline-flex items-center justify-center px-4 py-1.5 border bg-fuchsia-500/90 hover:bg-fuchsia-400 text-white border-fuchsia-300/50 ring-1 ring-fuchsia-400/60 shadow-[0_0_14px_rgba(232,121,249,0.55)]"
                            >
                                Create ClutchGG Card
                            </a>
							)}

                            {!claimStatus.loading && claimStatus.claimed && !claimStatus.ownClaim && (
                                <button
                                    disabled
                                    className="relative overflow-hidden rounded-lg text-sm font-semibold inline-flex items-center justify-center px-4 py-1.5 border bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600"
                                >
                                    Claimed by another account
                                </button>
                            )}

							{claimError && (
								<span className="text-xs text-red-400 ml-2">{claimError}</span>
							)}
						</div>

								{/* Timer */}
								{isUpdated && countdown > 0 && (
									<div className="text-xs text-[--text-secondary] self-center">Next update available in {countdown}s</div>
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
					<div className="w-full lg:w-1/3">
						<TFTRankedInfo rankedData={rankedData} />

						{/* Top Traits Component */}
						<TopTraits matchDetails={matchDetails} summonerData={summonerData} traitsData={traitsData} />

						{/* Top Units Component */}
						<TopUnits matchDetails={matchDetails} summonerData={summonerData} championsData={championsData} />
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
