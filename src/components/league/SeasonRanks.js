import React, { useState, useEffect } from "react";
import Image from "next/image";

const SeasonRanks = ({ gameName, tagLine, region }) => {
    const [rankHistory, setRankHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    useEffect(() => {
        const fetchRankHistory = async () => {
            if (!gameName || !tagLine || !region) return;

            setIsLoading(true);

            // Check local storage for cached data
            const storageKey = `rankHistory_${gameName}_${tagLine}_${region}`;
            const now = Date.now();

            try {
                const cachedData = localStorage.getItem(storageKey);

                if (cachedData) {
                    const parsedCache = JSON.parse(cachedData);

                    // Check if the cache is still valid (24 hours)
                    if (parsedCache.expiresAt && parsedCache.expiresAt > now) {
                        console.log("Using cached rank history from localStorage");
                        setRankHistory(parsedCache.data);
                        setLastFetched(new Date(parsedCache.timestamp).toLocaleString());
                        setIsLoading(false);
                        return;
                    }
                }

                // Cache not found or expired, fetch from API
                const response = await fetch(
                    `/api/league/rankHistory?gameName=${encodeURIComponent(
                        gameName
                    )}&tagLine=${encodeURIComponent(
                        tagLine
                    )}&region=${encodeURIComponent(region)}`
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

                    setLastFetched(new Date().toLocaleString());
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
                            setLastFetched(new Date(parsedCache.timestamp).toLocaleString() + " (stale)");
                        }
                    }
                } catch (cacheError) {
                    console.error("Error loading from cache:", cacheError);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRankHistory();
    }, [gameName, tagLine, region]);

    // Helper to get rank color class
    const getRankColorClass = (tier) => {
        if (!tier) return "text-gray-400";

        const lowerTier = tier.toLowerCase();
        if (lowerTier.includes("challenger")) return "text-yellow-400";
        if (lowerTier.includes("grandmaster")) return "text-red-400";
        if (lowerTier.includes("master")) return "text-purple-400";
        if (lowerTier.includes("diamond")) return "text-blue-400";
        if (lowerTier.includes("emerald")) return "text-green-400";
        if (lowerTier.includes("platinum")) return "text-teal-400";
        if (lowerTier.includes("gold")) return "text-yellow-500";
        if (lowerTier.includes("silver")) return "text-gray-400";
        if (lowerTier.includes("bronze")) return "text-yellow-700";
        if (lowerTier.includes("iron")) return "text-gray-600";

        return "text-gray-400";
    };

    // Get the rank emblem path
    const getRankEmblemPath = (tier) => {
        if (!tier) return null;

        const lowerTier = tier.toLowerCase();
        if (lowerTier.includes("challenger")) return "/images/league/rankedEmblems/challenger.webp";
        if (lowerTier.includes("grandmaster")) return "/images/league/rankedEmblems/grandmaster.webp";
        if (lowerTier.includes("master")) return "/images/league/rankedEmblems/master.webp";
        if (lowerTier.includes("diamond")) return "/images/league/rankedEmblems/diamond.webp";
        if (lowerTier.includes("emerald")) return "/images/league/rankedEmblems/emerald.webp";
        if (lowerTier.includes("platinum")) return "/images/league/rankedEmblems/platinum.webp";
        if (lowerTier.includes("gold")) return "/images/league/rankedEmblems/gold.webp";
        if (lowerTier.includes("silver")) return "/images/league/rankedEmblems/silver.webp";
        if (lowerTier.includes("bronze")) return "/images/league/rankedEmblems/bronze.webp";
        if (lowerTier.includes("iron")) return "/images/league/rankedEmblems/iron.webp";

        return null;
    };

    const refreshRankHistory = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/league/rankHistory?gameName=${encodeURIComponent(
                    gameName
                )}&tagLine=${encodeURIComponent(
                    tagLine
                )}&region=${encodeURIComponent(region)}&refresh=true`
            );

            if (!response.ok) {
                throw new Error("Failed to refresh rank history");
            }

            const data = await response.json();

            if (data && Array.isArray(data) && data.length > 0) {
                setRankHistory(data);

                // Update localStorage cache
                const storageKey = `rankHistory_${gameName}_${tagLine}_${region}`;
                const now = Date.now();
                const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours

                localStorage.setItem(storageKey, JSON.stringify({
                    data: data,
                    timestamp: now,
                    expiresAt: expiresAt
                }));

                setLastFetched(new Date().toLocaleString());
            } else {
                // No rank history found even after refresh
                setRankHistory([]);
            }
        } catch (error) {
            console.error("Error refreshing rank history:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && rankHistory.length === 0) {
        return (
            <div className="bg-black bg-opacity-70 p-2 rounded-md">
                <p className="text-gray-400 text-xs animate-pulse">Loading past ranks...</p>
            </div>
        );
    }

    if (error && rankHistory.length === 0) {
        return (
            <div className="bg-black bg-opacity-70 p-2 rounded-md">
                <p className="text-red-400 text-xs">Error loading rank history</p>
                <button
                    onClick={refreshRankHistory}
                    className="text-blue-400 text-xs underline mt-1"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (rankHistory.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-wrap gap-2 mt-2">
                {rankHistory.map((rank, index) => (
                    <div
                        key={index}
                        className="bg-black bg-opacity-70 p-2 rounded-md flex flex-col items-center justify-center"
                    >
                        <div className="flex items-center mb-1">
                            {rank.tier && (
                                <div className="mr-1 w-5 h-5 relative">
                                    <Image
                                        src={getRankEmblemPath(rank.tier) || "/images/league/rankedEmblems/unranked.webp"}
                                        alt={`${rank.tier} emblem`}
                                        width={20}
                                        height={20}
                                    />
                                </div>
                            )}
                            <span className={`text-xs font-bold ${getRankColorClass(rank.tier)}`}>
                {rank.tier}
              </span>
                        </div>
                        <div className="text-xs text-gray-400">{rank.season}</div>
                        {rank.lp !== undefined && (
                            <div className="text-xs text-gray-300">{rank.lp} LP</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeasonRanks;