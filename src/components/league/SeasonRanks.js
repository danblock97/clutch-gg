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

	// Get rank color style
	const getRankColorStyle = (tier) => {
		if (!tier) return { color: "var(--text-secondary)" };
		const baseTier = tier.split(" ")[0].toLowerCase();
		return { color: `var(--${baseTier})` };
	};

	const fetchRankHistory = useCallback(
		async (shouldRefresh = false) => {
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
					} catch (e) { }
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
		},
		[gameName, tagLine, region, onLoadComplete]
	);

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
		<div className="overflow-hidden bg-white/5 rounded-xl">
			<div className="flex items-center justify-between p-4 border-b border-[--card-border] bg-black/20">
				<h3 className="text-base font-bold flex items-center gap-2">
					<FaHistory className="text-[--text-secondary]" />
					<span>Season History</span>
				</h3>
				<button
					className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-[--text-secondary] hover:text-white hover:bg-white/10 transition-colors"
					onClick={() => setIsExpanded(!isExpanded)}
					aria-label="Toggle season history"
				>
					{isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
				</button>
			</div>

			{isExpanded && (
				<div className="p-4 relative">
					{error && (
						<p className="text-[--error] text-xs px-2 py-1">
							Error refreshing: {error}
						</p>
					)}
					{isLoading && (
						<div className="flex items-center justify-center py-4 text-xs text-[--text-secondary]">
							<div className="loading-spinner-xs mr-2"></div>
							Loading...
						</div>
					)}

					{/* Timeline Vertical Line */}
					{!isLoading && rankHistory.length > 0 && (
						<div className="absolute left-[3.5rem] top-4 bottom-4 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent block" />
					)}

					<div className="grid grid-cols-1 gap-1 relative z-10">
						{rankHistory.map((rank, index) => (
							<div key={index} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all duration-300 group">
								<div className="flex items-center gap-4">
									<span className="text-[10px] font-bold text-[--text-secondary] uppercase tracking-wider w-8 text-right group-hover:text-white transition-colors">
										{rank.season}
									</span>

									{/* Timeline Dot */}
									<div className="w-1.5 h-1.5 rounded-full bg-[--card-border] ring-4 ring-[--card-bg] group-hover:bg-[--primary] transition-colors z-20 shrink-0" />

									<div className="flex items-center gap-3">
										{rank.tier ? (
											<div className="relative w-6 h-6 shrink-0 transition-transform group-hover:scale-110 duration-300">
												<Image src={getRankEmblemPath(rank.tier)} alt={`${rank.tier} emblem`} fill className="object-contain" />
											</div>
										) : (
											<span className="w-6 h-6 rounded-full bg-white/5 block shrink-0" />
										)}
										<span className="text-sm font-bold tracking-tight" style={getRankColorStyle(rank.tier)}>
											{rank.tier || "Unranked"}
										</span>
									</div>
								</div>

								{rank.lp !== undefined && rank.lp !== null ? (
									<span className="text-xs font-mono text-[--text-secondary] opacity-70 group-hover:opacity-100 transition-opacity">{rank.lp} LP</span>
								) : (
									<span className="text-xs text-[--text-secondary] opacity-30">—</span>
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
