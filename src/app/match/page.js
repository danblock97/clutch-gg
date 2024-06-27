"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MatchDetails from "@/components/MatchDetails";
import useProfileData from "../hooks/useProfileData";
import Loading from "@/components/Loading";

const MatchPage = () => {
    const searchParams = useSearchParams();
    const matchId = searchParams.get("matchId");
    const { matchDetails, accountData, error, isLoading } = useProfileData();

    const [selectedSummonerPUUID, setSelectedSummonerPUUID] = useState(null);

    useEffect(() => {
        const gameName = searchParams.get("gameName");
        const tagLine = searchParams.get("tagLine");

        if (accountData && accountData.puuid) {
            setSelectedSummonerPUUID(accountData.puuid);
        }
    }, [searchParams, accountData]);

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div>
            {matchId && selectedSummonerPUUID && (
                <MatchDetails
                    matchId={matchId}
                    matchDetails={matchDetails}
                    selectedSummonerPUUID={selectedSummonerPUUID}
                />
            )}
        </div>
    );
};

export default MatchPage;
