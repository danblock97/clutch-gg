"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LiveGame from "@/components/LiveGame";
import Loading from "@/components/Loading";
import useProfileData from "../hooks/useProfileData";

const LiveGamePage = () => {
    const { liveGameData, isLoading, error, fetchLiveGameData } = useProfileData();
    const searchParams = useSearchParams();
    const gameName = searchParams.get("gameName");
    const tagLine = searchParams.get("tagLine");

    useEffect(() => {
        if (gameName && tagLine) {
            fetchLiveGameData();
            const interval = setInterval(() => {
                fetchLiveGameData();
            }, 10000); // Check for updates every 10 seconds

            return () => clearInterval(interval);
        }
    }, [gameName, tagLine, fetchLiveGameData]);

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!liveGameData || !liveGameData.participants) {
        return <p>No active game data available</p>;
    }

    return (
        <div>
            <LiveGame liveGameData={liveGameData} />
        </div>
    );
};

export default LiveGamePage;
