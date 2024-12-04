import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import NoActiveGameData from "./NoActiveGameData";

const Profile = ({
	accountData,
	profileData,
	rankedData,
	toggleLiveGame,
	triggerUpdate,
	isUpdating,
	liveGameData, // Boolean or object indicating live game status
	region, // New prop indicating the region/server
}) => {
	const soloRankedData = rankedData.find(
		(item) => item.queueType === "RANKED_SOLO_5x5"
	);

	const rankedIcon = soloRankedData
		? `/images/rankedEmblems/${soloRankedData.tier.toLowerCase()}.webp`
		: null;

	const [isUpdated, setIsUpdated] = useState(false);
	const [lastUpdated, setLastUpdated] = useState(null);
	const [countdown, setCountdown] = useState(0);
	const [updateTriggered, setUpdateTriggered] = useState(false);
	const [showNoActiveGameData, setShowNoActiveGameData] = useState(false); // New state
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
				// Cleanup if the countdown has already expired
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
			// Persist the last updated time in localStorage
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
						// Remove the lastUpdated entry from localStorage
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

	// Handler for Live Game button click
	const handleLiveGameClick = () => {
		if (liveGameData) {
			toggleLiveGame();
		} else {
			setShowNoActiveGameData(true);
		}
	};

	// Handler to close NoActiveGameData component
	const handleCloseNoActiveGameData = () => {
		setShowNoActiveGameData(false);
	};

	return (
		<div className="relative w-full py-6 shadow-md overflow-hidden">
			<div className="relative w-full max-w-screen-xl mx-auto p-4 flex items-center justify-between">
				{/* Profile Icon */}
				<div className="relative">
					<div className="rounded-full overflow-hidden w-20 h-20 border-4 border-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
						<Image
							src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileData.profileIconId}.jpg`}
							alt="Player Icon"
							layout="responsive"
							width={80}
							height={80}
							className="rounded-full object-cover"
						/>
					</div>

					{/* Region Badge */}
					<div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded-full shadow-lg">
						{profileData.summonerLevel}
					</div>
				</div>

				{/* Name, Tag, Rank */}
				<div className="ml-4 flex-1">
					<h1 className="text-3xl font-bold text-white">
						{`${accountData.gameName}#${accountData.tagLine}`}
					</h1>

					{/* Ranked Data and Buttons Container */}
					<div className="flex flex-col">
						{soloRankedData ? (
							<div className="flex items-center">
								{rankedIcon && (
									<Image
										src={rankedIcon}
										alt={`${soloRankedData.tier} Emblem`}
										width={32}
										height={32}
										className="rounded-full mr-4"
									/>
								)}
								<div>
									<p className="text-blue-400 font-semibold">
										{soloRankedData.tier} {soloRankedData.rank}{" "}
										{soloRankedData.leaguePoints} LP
									</p>
									<p className="text-gray-400 text-sm">
										{soloRankedData.wins}W - {soloRankedData.losses}L (
										{(
											(soloRankedData.wins /
												(soloRankedData.wins + soloRankedData.losses)) *
											100
										).toFixed(1)}
										% WR)
									</p>
								</div>
							</div>
						) : (
							<p className="text-gray-400 font-semibold">Unranked</p>
						)}

						<div className="flex flex-col items-start mt-3 space-y-2">
							{/* Buttons Container */}
							<div className="flex space-x-2">
								{/* Update Button */}
								<button
									onClick={(e) => {
										e.stopPropagation();
										triggerUpdate();
										setUpdateTriggered(true);
									}}
									className={`px-4 py-2 rounded-md text-sm inline-flex items-center justify-center transition-colors duration-300 ${
										isUpdating
											? "bg-blue-600 opacity-50 cursor-not-allowed"
											: isUpdated
											? "bg-green-500 hover:bg-green-600"
											: "bg-blue-600 hover:bg-blue-700"
									} `}
									disabled={isUpdating || countdown > 0}
								>
									{isUpdating ? (
										<svg
											className="animate-spin h-5 w-5 mr-2 text-white"
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
									) : null}
									{isUpdating
										? "Updating..."
										: isUpdated
										? "Updated"
										: "Update"}
								</button>

								{/* Live Game Button with Tooltip */}
								<div className="relative group">
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleLiveGameClick();
										}}
										disabled={!liveGameData} // Disable button if not in a live game
										className={`px-4 py-2 rounded-md text-sm inline-flex items-center justify-center transition-colors duration-300 ${
											liveGameData
												? "bg-green-600 hover:bg-green-700 text-white"
												: "bg-gray-600 text-gray-300 cursor-not-allowed"
										}`}
									>
										Live Game
									</button>

									{/* Tooltip */}
									{liveGameData && (
										<div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
											Currently in Game
										</div>
									)}
								</div>
							</div>

							{/* Update Status */}
							{isUpdated && countdown > 0 ? (
								<p className="text-xs text-gray-300">
									Available in {countdown} second
									{countdown !== 1 ? "s" : ""}
								</p>
							) : lastUpdated ? (
								<p className="text-xs text-gray-300">
									Last Updated {timeAgo(lastUpdated)}
								</p>
							) : null}
						</div>
					</div>
				</div>
			</div>

			{/* Render NoActiveGameData Component */}
			{showNoActiveGameData && (
				<NoActiveGameData
					summonerName={`${accountData.gameName}#${accountData.tagLine}`}
					region={region}
					onClose={handleCloseNoActiveGameData}
				/>
			)}
		</div>
	);
};

export default Profile;
