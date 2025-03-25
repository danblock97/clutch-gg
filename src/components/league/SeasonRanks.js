import React, { useState, useEffect } from "react";
import Image from "next/image";
import {FaHistory, FaChevronUp, FaChevronDown} from "react-icons/fa";

const SeasonRanks = ({ gameName, tagLine, region, forceUpdate }) => {
    const [rankHistory, setRankHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Fixed function to get the correct rank emblem path
    const getRankEmblemPath = (tier) => {
        if (!tier) return "/images/league/rankedEmblems/unranked.webp";

        // Extract just the tier name (before any space or number)
        // For example, "DIAMOND 1" becomes just "diamond"
        const baseTier = tier.split(' ')[0].toLowerCase();

        // Return just the tier name without division number
        // This assumes image files are named "diamond.webp", "platinum.webp", etc.
        return `/images/league/rankedEmblems/${baseTier}.webp`;
    };

    // Helper to get rank color class
    const getRankColorClass = (tier) => {
        if (!tier) return "text-gray-400";

        // Extract just the tier name (before any space or number)
        // For example, "DIAMOND 1" becomes just "diamond"
        const baseTier = tier.split(' ')[0].toLowerCase();
        return `text-[--${baseTier}]`;
    };

    const fetchRankHistory = async (shouldRefresh = false) => {
        if (!gameName || !tagLine || !region) return;

        setIsLoading(true);

        // Check local storage for cached data
        const storageKey = `rankHistory_${gameName}_${tagLine}_${region}`;
        const now = Date.now();

        try {
            // If not forcing refresh, try to use cached data
            if (!shouldRefresh) {
                const cachedData = localStorage.getItem(storageKey);
                if (cachedData) {
                    const parsedCache = JSON.parse(cachedData);
                    // Check if the cache is still valid (24 hours)
                    if (parsedCache.expiresAt && parsedCache.expiresAt > now) {
                        console.log("Using cached rank history from localStorage");
                        setRankHistory(parsedCache.data);
                        setIsLoading(false);
                        return;
                    }
                }
            }

            // Cache not found, expired, or forcing refresh
            const refreshParam = shouldRefresh ? "&refresh=true" : "";
            const response = await fetch(
                `/api/league/rankHistory?gameName=${encodeURIComponent(
                    gameName
                )}&tagLine=${encodeURIComponent(
                    tagLine
                )}&region=${encodeURIComponent(region)}${refreshParam}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch rank history");
            }

            const data = await response.json();

            // Only update state if we have actual data
            if (data && Array.isArray(data) && data.length > 0) {
                setRankHistory(data);

                // Get cache expiration from header or default to 24 hours
                const expiresHeader = response.headers.get("X-Cache-Expires");
                const expiresAt = expiresHeader
                    ? new Date(expiresHeader).getTime()
                    : now + (24 * 60 * 60 * 1000);

                // Cache the data in localStorage with expiration
                localStorage.setItem(storageKey, JSON.stringify({
                    data: data,
                    timestamp: now,
                    expiresAt: expiresAt
                }));
            } else if (data && Array.isArray(data) && data.length === 0) {
                // No rank history found for this player
                console.log("No rank history found for this player");
                setRankHistory([]);
            }
        } catch (error) {
            console.error("Error fetching rank history:", error);
            setError(error.message);

            // Try to load from localStorage as fallback even if expired
            try {
                const cachedData = localStorage.getItem(storageKey);
                if (cachedData) {
                    const parsedCache = JSON.parse(cachedData);
                    if (parsedCache.data && parsedCache.data.length > 0) {
                        setRankHistory(parsedCache.data);
                    }
                }
            } catch (cacheError) {
                console.error("Error loading from cache:", cacheError);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchRankHistory();
    }, [gameName, tagLine, region]);

    // When forceUpdate changes, refresh the data
    useEffect(() => {
        if (forceUpdate) {
            fetchRankHistory(true);
        }
    }, [forceUpdate]);

    if (isLoading && rankHistory.length === 0) {
        return (
            <div className="card-highlight text-center py-6">
                <div className="loading-spinner mx-auto"></div>
                <p className="text-[--text-secondary] mt-4">Loading rank history...</p>
            </div>
        );
    }

    if (error && rankHistory.length === 0) {
        return (
            <div className="card-highlight p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">Season History</h3>
                </div>
                <p className="text-[--error] text-sm mt-2">{error}</p>
            </div>
        );
    }

    if (rankHistory.length === 0) {
        return (
            <div className="card-highlight p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold flex items-center">
                        <FaHistory className="mr-2" />
                        Season History
                    </h3>
                </div>
                <p className="text-[--text-secondary] text-sm mt-2">No ranked history available</p>
            </div>
        );
    }

    return (
        <div className="card-highlight">
            <div className="flex items-center justify-between p-4 cursor-pointer"
                 onClick={() => setIsExpanded(!isExpanded)}>
                <h3 className="text-base font-semibold flex items-center">
                    <FaHistory className="mr-2 text-[--secondary]" />
                    Season History
                </h3>
                <div>
                    {isExpanded ?
                        <FaChevronUp className="text-[--text-secondary]" /> :
                        <FaChevronDown className="text-[--text-secondary]" />
                    }
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-[--card-border] mt-2">
                    {/* More compact layout without scrollbar */}
                    <div>
                        {rankHistory.map((rank, index) => (
                            <div
                                key={index}
                                className="flex items-center py-1.5 border-b border-[--card-border] last:border-b-0"
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    {/* Season - Made more compact */}
                                    <div className="bg-[--card-bg] text-[--text-secondary] text-xs font-semibold py-0.5 px-2 rounded-md min-w-[50px] text-center">
                                        {rank.season}
                                    </div>

                                    {/* Rank Icon & Text - Made more compact */}
                                    <div className="flex items-center gap-1">
                                        {/* Smaller rank icon */}
                                        {rank.tier ? (
                                            <div className="relative w-6 h-6">
                                                <Image
                                                    src={getRankEmblemPath(rank.tier)}
                                                    alt={`${rank.tier} emblem`}
                                                    width={24}
                                                    height={24}
                                                    className="drop-shadow-lg"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 bg-[--card-bg] rounded-full flex items-center justify-center">
                                                <span className="text-gray-600 text-xs">-</span>
                                            </div>
                                        )}

                                        <span className={`font-bold text-sm ${getRankColorClass(rank.tier)}`}>
                                            {rank.tier || "Unranked"}
                                        </span>
                                    </div>
                                </div>

                                {/* LP - Made more compact */}
                                {rank.lp !== undefined && (
                                    <div className="text-right">
                                        <span className="text-xs text-[--text-secondary]">
                                            {rank.lp} LP
                                        </span>
                                    </div>
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