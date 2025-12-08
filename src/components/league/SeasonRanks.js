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

	// Get rank color style using CSS variables (avoids invalid dynamic classes)
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
			<div className="overflow-hidden bg-white/5 rounded-xl">
				<div className="flex items-center justify-between p-4 border-b border-[--card-border] bg-black/20">
					<h3 className="text-base font-semibold flex items-center">
						<FaHistory className="mr-2 text-[--text-secondary]" />
						Season History
					</h3>
				</div>
				<div className="flex flex-col items-center justify-center py-6 px-4 min-h-[120px] bg-black/10">
					<div className="loading-spinner"></div>
					<p className="text-[--text-secondary] mt-4">Loading rank history...</p>
				</div>
			</div>
		);
	}

	if (error && rankHistory.length === 0) {
		return (
			<div className="overflow-hidden bg-white/5 rounded-xl">
				<div className="flex items-center justify-between p-4 border-b border-[--card-border] bg-black/20">
					<h3 className="text-base font-semibold flex items-center">
						<FaHistory className="mr-2 text-[--text-secondary]" />
						Season History
					</h3>
				</div>
				<div className="p-4 bg-black/10">
					<p className="text-[--error] text-sm">Error: {error}</p>
				</div>
			</div>
		);
	}

	if (!isLoading && !error && rankHistory.length === 0) {
		return (
			<div className="overflow-hidden bg-white/5 rounded-xl">
				<div className="flex items-center justify-between p-4 border-b border-[--card-border] bg-black/20">
					<h3 className="text-base font-semibold flex items-center">
						<FaHistory className="mr-2 text-[--text-secondary]" />
						Season History
					</h3>
				</div>
				<div className="p-4 bg-black/10">
					<p className="text-[--text-secondary] text-sm">
						No ranked history available for this player.
					</p>
				</div>
			</div>
		);
	}
    return (
        <div className="card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[--secondary] to-[--primary]" />
            <div className="flex items-center justify-between p-4">
                <h3 className="text-base font-semibold flex items-center">
                    <FaHistory className="mr-2 text-[--primary]" />
                    Season History
                </h3>
                <button
                    className="text-[--text-secondary] hover:text-[--text-primary]"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label="Toggle season history"
                >
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>
            {isExpanded && (
                <div className="px-4 pb-4">
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
                    {/* Stacked list, no timeline dots */}
                    <div className="space-y-2">
                        {rankHistory.map((rank, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md bg-[--card-bg] border border-[--card-border]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[10px] font-semibold text-[--text-secondary] bg-[--card-bg-secondary] px-2 py-0.5 rounded-md">
                                        {rank.season}
                                    </span>
                                    {rank.tier ? (
                                        <Image src={getRankEmblemPath(rank.tier)} alt={`${rank.tier} emblem`} width={20} height={20} />
                                    ) : (
                                        <span className="w-5 h-5 rounded-full bg-[--card-bg-secondary]" />
                                    )}
										<span className="font-bold text-sm truncate" style={getRankColorStyle(rank.tier)}>
											{rank.tier || "Unranked"}
										</span>
                                </div>
                                {rank.lp !== undefined && rank.lp !== null ? (
                                    <span className="text-xs text-[--text-secondary] bg-[--card-bg-secondary] px-2 py-0.5 rounded-md">{rank.lp} LP</span>
                                ) : (
                                    <span className="text-xs text-[--text-secondary] opacity-60">—</span>
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
