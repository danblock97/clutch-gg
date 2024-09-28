"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MatchDetails from "@/components/league/MatchDetails";
import useProfileData from "@/app/hooks/league/useProfileData";
import Loading from "@/components/Loading";

const MatchPage = () => {
	const searchParams = useSearchParams();
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");
	const matchId = searchParams.get("matchId");
	const region = searchParams.get("region"); // Capture region from the query string

	const { matchDetails, accountData, error, isLoading } = useProfileData(
		gameName,
		tagLine,
		region
	); // Pass region to the hook

	const [selectedSummonerPUUID, setSelectedSummonerPUUID] = useState(null);

	useEffect(() => {
		if (accountData && accountData.puuid) {
			setSelectedSummonerPUUID(accountData.puuid);
		}
	}, [accountData]);

	if (isLoading) {
		return (
			<div className="bg-[#0e1015]">
				<Loading />
			</div>
		);
	}

	if (error) {
		return <p className="text-red-500">{error}</p>;
	}

	return (
		<div>
			{matchId && selectedSummonerPUUID ? (
				<MatchDetails
					matchId={matchId}
					matchDetails={matchDetails}
					selectedSummonerPUUID={selectedSummonerPUUID}
				/>
			) : (
				<p>Loading match details...</p>
			)}
		</div>
	);
};

export default MatchPage;
