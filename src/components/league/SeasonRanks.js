import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaHistory, FaChevronUp, FaChevronDown } from "react-icons/fa";

const SeasonRanks = ({
	gameName,
	tagLine,
	region,
	forceUpdate,
	onLoadComplete,
}) => {
	// Add onLoadComplete prop
	const [rankHistory, setRankHistory] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const [isExpanded, setIsExpanded] = useState(false);

	// Get the correct rank emblem path
	const getRankEmblemPath = (tier) => {
		if (!tier) return "/images/league/rankedEmblems/unranked.webp";
		const baseTier = tier.split(" ")[0].toLowerCase();
		return `/images/league/rankedEmblems/${baseTier}.webp`;
	};

	// Get rank color class
	const getRankColorClass = (tier) => {
		if (!tier) return "text-gray-400";
		const baseTier = tier.split(" ")[0].toLowerCase();
		return `text-[--${baseTier}]`;
	};

	const fetchRankHistory = useCallback(async (shouldRefresh = false) => {
		if (!gameName || !tagLine || !region) {
			setRankHistory([]);
			setIsExpanded(false);
			setIsLoading(false);
			setError(null);
			onLoadComplete && onLoadComplete(); // Call onLoadComplete if no fetch needed
			return;
		}

		setIsLoading(true);
		setError(null);

		const storageKey = `rankHistory_${gameName}_${tagLine}_${region}`;
		const now = Date.now();
		let isCacheLoaded = false;

		try {
			if (!shouldRefresh) {
				const cachedData = localStorage.getItem(storageKey);
				if (cachedData) {
					const parsedCache = JSON.parse(cachedData);
					if (parsedCache.expiresAt && parsedCache.expiresAt > now) {
						const historyData = parsedCache.data || [];
						setRankHistory(historyData);
						setIsExpanded(historyData.length > 0);
						setIsLoading(false);
						isCacheLoaded = true;
						return;
					} else {
						localStorage.removeItem(storageKey);
					}
				}
			}

			const refreshParam = shouldRefresh ? "&refresh=true" : "";
			const apiUrl = `/api/league/rankHistory?gameName=${encodeURIComponent(
				gameName
			)}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(
				region
			)}${refreshParam}`;
			const response = await fetch(apiUrl);

			if (!response.ok) {
				let errorMsg = `Failed to fetch rank history (${response.status})`;
				try {
					const errorData = await response.json();
					errorMsg = errorData.message || errorMsg;
				} catch (e) {}
				throw new Error(errorMsg);
			}

			const data = await response.json();
			const historyData = data && Array.isArray(data) ? data : [];

			setRankHistory(historyData);
			setIsExpanded(historyData.length > 0);

			if (historyData.length > 0) {
				const expiresHeader = response.headers.get("X-Cache-Expires");
				const expiresAt = expiresHeader
					? new Date(expiresHeader).getTime()
					: now + 24 * 60 * 60 * 1000;

				localStorage.setItem(
					storageKey,
					JSON.stringify({
						data: historyData,
						timestamp: now,
						expiresAt: expiresAt,
					})
				);
			} else {
				localStorage.removeItem(storageKey);
			}
		} catch (err) {
			console.error("Error fetching rank history:", err);
			setError(err.message);

			if (!isCacheLoaded) {
				try {
					const cachedData = localStorage.getItem(storageKey);
					if (cachedData) {
						const parsedCache = JSON.parse(cachedData);
						const cacheContent = parsedCache.data || [];
						setRankHistory(cacheContent);
						setIsExpanded(cacheContent.length > 0);
					} else {
						setRankHistory([]);
						setIsExpanded(false);
					}
				} catch (cacheError) {
					console.error("Error reading cache during fallback:", cacheError);
					setRankHistory([]);
					setIsExpanded(false);
				}
			}
		} finally {
			setIsLoading(false);
			onLoadComplete && onLoadComplete(); // Call onLoadComplete in finally block
		}
	}, [gameName, tagLine, region, onLoadComplete]);

	useEffect(() => {
		setRankHistory([]);
		setIsExpanded(false);
		setIsLoading(true);
		setError(null);
		fetchRankHistory(false);
	}, [gameName, tagLine, region, fetchRankHistory]);

	useEffect(() => {
		if (forceUpdate) {
			fetchRankHistory(true);
		}
	}, [forceUpdate, fetchRankHistory]);

	if (isLoading && rankHistory.length === 0) {
		return (
			// Center the loading spinner and text vertically and horizontally
			<div className="card-highlight flex flex-col items-center justify-center py-6 min-h-[100px]">
				<div className="loading-spinner"></div>
				<p className="text-[--text-secondary] mt-4">Loading rank history...</p>
			</div>
		);
	}

	if (error && rankHistory.length === 0) {
		return (
			<div className="card-highlight p-4">
				<div className="flex items-center justify-between">
					<h3 className="text-base font-semibold flex items-center">
						<FaHistory className="mr-2" />
						Season History
					</h3>
				</div>
				<p className="text-[--error] text-sm mt-2">Error: {error}</p>
			</div>
		);
	}

	if (!isLoading && !error && rankHistory.length === 0) {
		return (
			<div className="card-highlight p-4">
				<div className="flex items-center justify-between">
					<h3 className="text-base font-semibold flex items-center">
						<FaHistory className="mr-2" />
						Season History
					</h3>
				</div>
				<p className="text-[--text-secondary] text-sm mt-2">
					No ranked history available for this player.
				</p>
			</div>
		);
	}
	return (
		<div className="card-highlight">
			<div
				className="flex items-center justify-between p-4 cursor-pointer"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<h3 className="text-base font-semibold flex items-center">
					<FaHistory className="mr-2 text-[--secondary]" />
					Season History
				</h3>
				<div>
					{isExpanded ? (
						<FaChevronUp className="text-[--text-secondary]" />
					) : (
						<FaChevronDown className="text-[--text-secondary]" />
					)}
				</div>
			</div>

			{isExpanded && (
				<div className="p-4 pt-0 border-t border-[--card-border]">
					{error && (
						<p className="text-[--error] text-xs mb-2">
							Error refreshing: {error} (showing previous data)
						</p>
					)}

					{isLoading && (
						<div className="flex items-center text-xs text-[--text-secondary] mb-2">
							<div className="loading-spinner-xs mr-2"></div>
							Refreshing...
						</div>
					)}
					<div>
						{rankHistory.map((rank, index) => (
							<div
								key={index}
								// Use flexbox to align items and justify-between to push LP to the right
								className="flex items-center justify-between py-1.5 border-b border-[--card-border] last:border-b-0"
							>
								{/* Left side: Season and Rank */}
								<div className="flex items-center gap-2 flex-grow">
									{/* Season - Fixed width for alignment */}
									<div className="bg-[--card-bg] text-[--text-secondary] text-xs font-semibold py-0.5 px-2 rounded-md w-[60px] text-center flex-shrink-0">
										{rank.season}
									</div>

									{/* Rank - Allow this to take remaining space */}
									<div className="flex items-center gap-1 flex-grow min-w-0">
										{" "}
										{/* Added min-w-0 for flex shrink */}
										{rank.tier ? (
											<div className="relative w-6 h-6 flex-shrink-0">
												{" "}
												{/* Added flex-shrink-0 */}
												<Image
													src={getRankEmblemPath(rank.tier)}
													alt={`${rank.tier} emblem`}
													width={24}
													height={24}
													className="drop-shadow-lg"
												/>
											</div>
										) : (
											<div className="w-6 h-6 bg-[--card-bg] rounded-full flex items-center justify-center flex-shrink-0">
												{" "}
												{/* Added flex-shrink-0 */}
												<span className="text-gray-600 text-xs">-</span>
											</div>
										)}
										<span
											className={`font-bold text-sm truncate ${getRankColorClass(
												// Added truncate
												rank.tier
											)}`}
										>
											{rank.tier || "Unranked"}
										</span>
									</div>
								</div>

								{/* Right side: LP - Fixed width for alignment */}
								{rank.lp !== undefined && rank.lp !== null && (
									<div className="text-right w-[60px] flex-shrink-0">
										{" "}
										{/* Fixed width and flex-shrink-0 */}
										<span className="text-xs text-[--text-secondary]">
											{rank.lp} LP
										</span>
									</div>
								)}
								{/* Add a placeholder div if LP is not present to maintain alignment */}
								{(rank.lp === undefined || rank.lp === null) && (
									<div className="w-[60px] flex-shrink-0"></div>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default SeasonRanks;
