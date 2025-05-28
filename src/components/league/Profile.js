import Image from "next/image";
import { useState, useEffect, useRef } from "react";
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
	const soloRankedData = rankedData.find(
		(item) => item.queueType === "RANKED_SOLO_5x5"
	);

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
	const [showSocialModal, setShowSocialModal] = useState(false);
	const [twitchUsername, setTwitchUsername] = useState(accountData.twitchUsername || "");
	const [twitterUsername, setTwitterUsername] = useState(accountData.twitterUsername || "");
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState(null);
	const intervalRef = useRef(null);

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
			setSeasonUpdateTrigger(prev => prev + 1); // Trigger SeasonRanks update
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

	// Function to save social account data
	const saveSocialAccounts = async () => {
		setIsSaving(true);
		setSaveError(null);

		try {
			// Get the user from localStorage
			const storedUser = localStorage.getItem("rso_user");
			if (!storedUser) {
				setSaveError("You must be logged in to update your social accounts");
				return;
			}

			const user = JSON.parse(storedUser);

			// Make sure the logged-in user matches the profile being viewed
			if (user.puuid !== profileData.puuid) {
				setSaveError("You can only update your own profile");
				return;
			}

			const response = await fetch("/api/user/social-accounts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					puuid: user.puuid,
					twitchUsername,
					twitterUsername,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to update social accounts");
			}

			// Update was successful, close the modal and trigger a profile update
			setShowSocialModal(false);
			triggerUpdate();
			setUpdateTriggered(true);
		} catch (error) {
			setSaveError(error.message);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<>
			{/* Social Accounts Modal */}
			{showSocialModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
					<div className="bg-[--card-bg] rounded-lg shadow-xl max-w-md w-full p-6 border border-[--card-border]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-bold text-[--text-primary]">Manage Social Accounts</h3>
							<button 
								onClick={() => setShowSocialModal(false)}
								className="text-[--text-secondary] hover:text-[--text-primary]"
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{saveError && (
							<div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500">
								{saveError}
							</div>
						)}

						<div className="space-y-4">
							<div>
								<label htmlFor="twitchUsername" className="block text-sm font-medium text-[--text-secondary] mb-1">
									Twitch Username
								</label>
								<input
									type="text"
									id="twitchUsername"
									value={twitchUsername}
									onChange={(e) => setTwitchUsername(e.target.value)}
									className="w-full px-3 py-2 bg-[--input-bg] border border-[--card-border] rounded-md text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--primary]"
									placeholder="Enter your Twitch username"
								/>
								<p className="mt-1 text-xs text-[--text-secondary]">
									Adding your Twitch username will display a "STRM" badge next to your name.
								</p>
							</div>

							<div>
								<label htmlFor="twitterUsername" className="block text-sm font-medium text-[--text-secondary] mb-1">
									X (Twitter) Username
								</label>
								<input
									type="text"
									id="twitterUsername"
									value={twitterUsername}
									onChange={(e) => setTwitterUsername(e.target.value)}
									className="w-full px-3 py-2 bg-[--input-bg] border border-[--card-border] rounded-md text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--primary]"
									placeholder="Enter your X (Twitter) username"
								/>
							</div>

							<div className="flex justify-end pt-2">
								<button
									onClick={() => setShowSocialModal(false)}
									className="px-4 py-2 mr-2 rounded-md text-[--text-secondary] hover:text-[--text-primary] border border-[--card-border]"
								>
									Cancel
								</button>
								<button
									onClick={saveSocialAccounts}
									disabled={isSaving}
									className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white"
								>
									{isSaving ? (
										<>
											<svg className="animate-spin h-4 w-4 mr-2 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
											</svg>
											Saving...
										</>
									) : (
										"Save"
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="profile-header-bg w-full py-8 shadow-2xl overflow-hidden">
				<div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6">
					<div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
						{/* Left Side: Profile Icon & Level */}
						<div className="flex-shrink-0 relative">
							<div className="rank-icon rank-gold w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden">
								<Image
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileData.profileIconId}.jpg`}
									alt="Player Icon"
									width={112}
									height={112}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[--primary] to-[--secondary] text-white text-sm font-bold py-1 px-3 rounded-full shadow-lg">
								{profileData.summonerLevel}
							</div>
						</div>

						{/* Middle: Name, Tag, Ranked Info */}
						<div className="flex-grow flex flex-col">
							<h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
								{`${accountData.gameName}`}
								<span className="text-[--text-secondary] text-base sm:text-lg md:text-xl font-medium">
                  #{accountData.tagLine}
                </span>
								{accountData.isClaimed && (
									<span className="ml-2 text-blue-500" title="Verified">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
									</span>
								)}
								{accountData.twitchUsername && (
									<span className="ml-2 text-purple-500" title="Streamer">
										<span className="bg-purple-500 text-white text-xs px-2 py-1 rounded font-bold">STRM</span>
									</span>
								)}
							</h1>

							{/* Solo Queue Rank */}
							{soloRankedData ? (
								<div className="flex items-center mt-2">
									{rankedIcon && (
										<div className="relative mr-3">
											<Image
												src={rankedIcon}
												alt={`${soloRankedData.tier} Emblem`}
												width={40}
												height={40}
												className="drop-shadow-md"
											/>
											<div className="absolute -bottom-1 -right-1 bg-[--card-bg] text-xs px-1 rounded-md border border-[--card-border]">
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
											<p className="text-[--text-secondary] text-sm mt-1">
												Ladder Rank{" "}
												<span className="text-[--primary]">{ladderRanking.rank}</span>{" "}
												({ladderRanking.percentile}% of top)
											</p>
										)}
										{isLoadingLadder && (
											<p className="text-[--text-secondary] text-sm mt-1">
												Loading ladder ranking...
											</p>
										)}
									</div>
								</div>
							) : (
								<p className="text-[--text-secondary] font-semibold">Unranked</p>
							)}

							{/* Action Buttons */}
							<div className="flex flex-wrap gap-3 mt-4">
								<button
									onClick={(e) => {
										e.stopPropagation();
										triggerUpdate();
										setUpdateTriggered(true);
									}}
									className={`relative overflow-hidden rounded-lg text-sm font-medium transition-all duration-300 inline-flex items-center justify-center px-4 py-2
                    ${
										isUpdating
											? "bg-gray-600 opacity-50 cursor-not-allowed"
											: isUpdated
												? "btn-success"
												: "btn-primary"
									}`}
									disabled={isUpdating || countdown > 0}
								>
									{isUpdating && (
										<svg
											className="animate-spin h-4 w-4 mr-2"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8v8H4z"
											></path>
										</svg>
									)}
									{isUpdating
										? "Updating..."
										: isUpdated
											? "Updated"
											: "Update Profile"}
								</button>

								<button
									onClick={(e) => {
										e.stopPropagation();
										if (liveGameData) toggleLiveGame();
									}}
									disabled={!liveGameData}
									className={`relative overflow-hidden rounded-lg text-sm font-medium transition-all duration-300 inline-flex items-center justify-center px-4 py-2
                    ${
										liveGameData
											? "bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-500 hover:to-teal-400 text-white"
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

								{/* Claim Profile / Manage Social Accounts Button */}
								{accountData.isClaimed ? (
									<button
										onClick={(e) => {
											e.stopPropagation();
											// Check if the logged-in user matches the profile
											const storedUser = localStorage.getItem("rso_user");
											if (storedUser) {
												const user = JSON.parse(storedUser);
												if (user.puuid === profileData.puuid) {
													setShowSocialModal(true);
												} else {
													alert("You can only manage your own profile");
												}
											} else {
												alert("You must be logged in to manage your social accounts");
											}
										}}
										className="relative overflow-hidden rounded-lg text-sm font-medium transition-all duration-300 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white"
									>
										Manage Social Accounts
									</button>
								) : (
									<button
										onClick={(e) => {
											e.stopPropagation();
											// Get the current URL to return to after login
											const currentUrl = window.location.href;
											// Redirect to login with returnUrl parameter
											window.location.href = `/api/auth/login?returnUrl=${encodeURIComponent(currentUrl)}`;
										}}
										className="relative overflow-hidden rounded-lg text-sm font-medium transition-all duration-300 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white"
									>
										Claim Profile
									</button>
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
