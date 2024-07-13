"use client";

import React, { useRef, useEffect } from "react";
import Profile from "@/components/Profile";
import RankedInfo from "@/components/RankedInfo";
import ChampionMastery from "@/components/ChampionMastery";
import MatchHistory from "@/components/MatchHistory";
import LoadingBar from "react-top-loading-bar";
import LiveGameBanner from "@/components/LiveGameBanner";
import useProfileData from "../../hooks/useProfileData";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
    const {
        profileData,
        accountData,
        rankedData,
        championMasteryData,
        matchDetails,
        liveGameData,
        error,
        isLoading,
        fetchLiveGameData,
    } = useProfileData();

    const loadingBarRef = useRef(null);

    useEffect(() => {
        if (isLoading) {
            loadingBarRef.current.continuousStart();
        } else {
            loadingBarRef.current.complete();
        }
    }, [isLoading]);

    const router = useRouter();

    const selectedSummonerPUUID = profileData ? profileData.puuid : null;
    const gameName = accountData ? accountData.gameName : null;
    const tagLine = accountData ? accountData.tagLine : null;

    useEffect(() => {
        if (gameName && tagLine) {
            const interval = setInterval(() => {
                fetchLiveGameData();
            }, 10000); // Check for updates every 10 seconds

            return () => clearInterval(interval);
        }
    }, [gameName, tagLine, fetchLiveGameData]);

    return (
        <>
            <LoadingBar color="#f11946" ref={loadingBarRef} />
            <div className="min-h-screen bg-[#0e1015] flex flex-col items-center p-4">
                <div className="max-w-screen-xl flex flex-col sm:flex-row w-full">
                    {/* Left Section - Profile, Ranked, Champion */}
                    <div className="w-full md:w-1/3 sm:pr-4 flex flex-col gap-4">
                        {profileData && accountData && (
                            <Profile accountData={accountData} profileData={profileData} />
                        )}
                        {rankedData && <RankedInfo rankedData={rankedData} />}
                        {championMasteryData && (
                            <ChampionMastery championMasteryData={championMasteryData} />
                        )}
                    </div>
                    {/* Right Section - Match History */}
                    <div className="w-full md:w-2/3 sm:pl-4 flex flex-col gap-4">
                        {liveGameData && (
                            <LiveGameBanner
                                liveGameData={liveGameData}
                                gameName={gameName}
                                tagLine={tagLine}
                            />
                        )}
                        {matchDetails && (
                            <MatchHistory
                                matchDetails={matchDetails}
                                selectedSummonerPUUID={selectedSummonerPUUID}
                                gameName={gameName}
                                tagLine={tagLine}
                            />
                        )}
                    </div>
                </div>
                {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <p className="text-white">Loading...</p>
                    </div>
                )}
                {error && (
                    <div className="h-screen min-h-screen bg-[#0e1015] items-center p-4">
                        <p className="text-red-500 text-center">{error}</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProfilePage;
