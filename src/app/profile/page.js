"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Profile from "@/components/Profile";
import RankedInfo from "@/components/RankedInfo";
import ChampionMastery from "@/components/ChampionMastery";
import MatchHistory from "@/components/MatchHistory";
import Last20GamesPerformance from "@/components/Last20GamesPerformance";
import Loading from "@/components/Loading";
import LiveGame from "@/components/LiveGame";
import RecentlyPlayedWith from "@/components/RecentlyPlayedWith";

const ProfilePageContent = () => {
    const searchParams = useSearchParams();
    const gameName = searchParams.get("gameName");
    const tagLine = searchParams.get("tagLine");
    const region = searchParams.get("region"); // Retrieve the region from URL

    const [profileData, setProfileData] = useState(null);
    const [accountData, setAccountData] = useState(null);
    const [rankedData, setRankedData] = useState(null);
    const [championMasteryData, setChampionMasteryData] = useState(null);
    const [matchDetails, setMatchDetails] = useState(null);
    const [liveGameData, setLiveGameData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiveGameOpen, setIsLiveGameOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchProfileData = useCallback(async () => {
        setIsLoading(true); // Start loading
        setError(null); // Reset any previous errors
        try {
            const response = await fetch(
                `/api/league/profile?gameName=${gameName}&tagLine=${tagLine}&region=${region}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch profile");
            }
            const data = await response.json();
            setProfileData(data.profiledata);
            setAccountData(data.accountdata);
            setRankedData(data.rankeddata);
            setChampionMasteryData(data.championmasterydata);
            setMatchDetails(data.matchdetails);
            setLiveGameData(data.livegamedata);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false); // End loading
        }
    }, [gameName, tagLine, region]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const toggleLiveGame = () => setIsLiveGameOpen((prev) => !prev);

    const triggerUpdate = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch("/api/league/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.NEXT_PUBLIC_UPDATE_API_KEY,
                },
                body: JSON.stringify({ gameName, tagLine, region }), // Include region in the request body
            });
            if (!response.ok) {
                throw new Error("Failed to trigger update");
            }
            await response.json();
            await fetchProfileData();
        } catch (error) {
            console.error("Error triggering update:", error);
            setError(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-[#0e1015] min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0e1015] flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0e1015] relative">
            <div
                className={`w-full bg-black rounded-b-3xl ${
                    liveGameData
                        ? "shadow-[0px_15px_10px_-5px_rgba(0,153,255,0.8)]"
                        : "shadow-[0px_15px_10px_-5px_rgba(255,255,255,0.5)]"
                }`}
            >
                {profileData && accountData ? (
                    <Profile
                        accountData={accountData}
                        profileData={profileData}
                        rankedData={rankedData}
                        liveGameData={liveGameData}
                        toggleLiveGame={toggleLiveGame}
                        isLiveGameOpen={isLiveGameOpen}
                        triggerUpdate={triggerUpdate}
                        isUpdating={isUpdating}
                    />
                ) : (
                    <p className="text-white">No profile data found.</p>
                )}
            </div>
            {liveGameData && isLiveGameOpen && (
                <div className="max-w-screen-xl mx-auto mt-4">
                    <LiveGame liveGameData={liveGameData} region={region} />
                </div>
            )}
            <div className="max-w-screen-xl mx-auto flex flex-col items-center gap-8 mt-8">
                <div className="w-full flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/3 flex flex-col gap-4">
                        {rankedData ? (
                            <RankedInfo rankedData={rankedData} />
                        ) : (
                            <Loading />
                        )}
                        {matchDetails && profileData ? (
                            <RecentlyPlayedWith
                                matchDetails={matchDetails}
                                selectedSummonerPUUID={profileData.puuid}
                                region={region}
                            />
                        ) : (
                            <Loading />
                        )}
                        {championMasteryData ? (
                            <ChampionMastery championMasteryData={championMasteryData} />
                        ) : (
                            <Loading />
                        )}
                    </div>
                    <div className="md:w-2/3 flex flex-col gap-4">
                        {matchDetails && profileData ? (
                            <Last20GamesPerformance
                                matchDetails={matchDetails}
                                selectedSummonerPUUID={profileData.puuid}
                            />
                        ) : (
                            <Loading />
                        )}
                        {matchDetails ? (
                            <MatchHistory
                                matchDetails={matchDetails}
                                selectedSummonerPUUID={profileData?.puuid || null}
                                gameName={accountData?.gameName}
                                tagLine={accountData?.tagLine}
                                region={region}
                            />
                        ) : (
                            <Loading />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfilePage = () => (
    <Suspense fallback={<Loading />}>
        <ProfilePageContent />
    </Suspense>
);

export default ProfilePage;
