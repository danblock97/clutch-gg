import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import useTFTProfileData from "@/app/hooks/tft/useProfileData";
import TFTRankedInfo from "./RankedInfo";
import TFTMatchHistory from "./MatchHistory";
import TopTraits from "./TopTraits";
import Loading from "@/components/Loading";
import NoProfileFound from "@/components/league/NoProfileFound";
import DiscordBotBanner from "@/components/DiscordBotBanner.js";

export default function Profile({ profileData }) {
	const { summonerData, rankedData, matchDetails, isLoading } =
		useTFTProfileData(profileData);
	const [tab, setTab] = useState("matches");

	// Update functionality
	const [isUpdated, setIsUpdated] = useState(false);
	const [lastUpdated, setLastUpdated] = useState(null);
	const [countdown, setCountdown] = useState(0);
	const [updateTriggered, setUpdateTriggered] = useState(false);
	const intervalRef = useRef(null);

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

	if (isLoading) {
		return <Loading />;
	}

	if (!summonerData) {
		return <NoProfileFound />;
	}

	// Find TFT ranked queue
	const tftRanked =
		rankedData.find((queue) => queue.queueType === "RANKED_TFT") || null;
	const rankedIcon =
		tftRanked && tftRanked.tier
			? `/images/league/rankedEmblems/${tftRanked.tier.toLowerCase()}.webp`
			: null;

	// Handle refresh/update
	const handleUpdate = () => {
		setUpdateTriggered(true);
		window.location.reload();

		// Store update time
		const now = new Date();
		setIsUpdated(true);
		setLastUpdated(now);
		setCountdown(120);
		localStorage.setItem("tft_lastUpdated", now.toISOString());
	};

	return (
		<main className="min-h-screen bg-gray-900 text-white">
			<div className="profile-header-bg w-full py-8 shadow-2xl overflow-hidden">
				<div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6">
					<div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
						{/* Left Side: Profile Icon & Level */}
						<div className="flex-shrink-0 relative">
							<div className="rank-icon rank-gold w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden">
								<Image
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summonerData.profileIconId}.jpg`}
									alt="Player Icon"
									width={112}
									height={112}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[--primary] to-[--secondary] text-white text-sm font-bold py-1 px-3 rounded-full shadow-lg">
								{summonerData.summonerLevel}
							</div>
						</div>

						{/* Middle: Name, Tag, Ranked Info */}
						<div className="flex-grow flex flex-col">
							<h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
								{summonerData.name}
								<span className="text-[--text-secondary] text-base sm:text-lg md:text-xl font-medium">
									#{summonerData.tagLine}
								</span>
							</h1>

							{/* TFT Queue Rank */}
							{tftRanked ? (
								<div className="flex items-center mt-2">
									{rankedIcon && (
										<div className="relative mr-3">
											<Image
												src={rankedIcon}
												alt={`${tftRanked.tier} Emblem`}
												width={40}
												height={40}
												className="drop-shadow-md"
											/>
											<div className="absolute -bottom-1 -right-1 bg-[--card-bg] text-xs px-1 rounded-md border border-[--card-border]">
												{tftRanked.rank}
											</div>
										</div>
									)}
									<div>
										<p className="font-semibold text-lg">
											<span
												className={`text-[--${tftRanked.tier.toLowerCase()}]`}
											>
												{tftRanked.tier}
											</span>
											<span className="text-[--text-primary] ml-2">
												{tftRanked.leaguePoints} LP
											</span>
										</p>
										<p className="text-[--text-secondary] text-sm">
											{tftRanked.wins}W - {tftRanked.losses}L (
											{(
												(tftRanked.wins / (tftRanked.wins + tftRanked.losses)) *
												100
											).toFixed(1)}
											% WR)
										</p>
									</div>
								</div>
							) : (
								<p className="text-[--text-secondary] font-semibold">
									Unranked
								</p>
							)}

							{/* Action Buttons */}
							<div className="flex flex-wrap gap-3 mt-4">
								<button
									onClick={handleUpdate}
									className={`relative overflow-hidden rounded-lg text-sm font-medium transition-all duration-300 inline-flex items-center justify-center px-4 py-2
                    ${isUpdated ? "btn-success" : "btn-primary"}`}
									disabled={countdown > 0}
								>
									{isUpdated ? "Updated" : "Update Profile"}
								</button>

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

			{/* Main Content */}
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col lg:flex-row gap-6">
					{/* Left Column */}
					<div className="w-full lg:w-1/3">
						<TFTRankedInfo rankedData={rankedData} />

						{/* Top Traits Component */}
						<TopTraits
							matchDetails={matchDetails}
							summonerData={summonerData}
						/>
					</div>

					{/* Right Column */}
					<div className="w-full lg:w-2/3">
						{/* Tab Content */}
						<div className="card-highlight">
							{tab === "matches" && (
								<TFTMatchHistory
									matchDetails={matchDetails}
									summonerData={summonerData}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
