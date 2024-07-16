"use client";

import React, { useEffect } from "react";
import Profile from "@/components/league/Profile";
import RankedInfo from "@/components/league/RankedInfo";
import ChampionMastery from "@/components/league/ChampionMastery";
import MatchHistory from "@/components/league/MatchHistory";
import LiveGameBanner from "@/components/league/LiveGameBanner";
import useProfileData from "@/app/hooks/league/useProfileData";
import Loading from "@/components/Loading";

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

    if (isLoading) {
        return (
            <div className="bg-[#0e1015]">
                <Loading />
            </div>
        );
    }

    return (
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
                {/* Right Section - Match History and Live Game Banner */}
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
                            selectedSummonerPUUID={profileData ? profileData.puuid : null}
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
    );
};

export default ProfilePage;
