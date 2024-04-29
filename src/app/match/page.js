"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MatchDetails from "@/components/MatchDetails";
import useProfileData from "../hooks/useProfileData";

const MatchPage = () => {
	const searchParams = useSearchParams();
	const matchId = searchParams.get("matchId");
	const { matchDetails, accountData } = useProfileData();

	// Log gameName and tagLine
	useEffect(() => {
		const gameName = searchParams.get("gameName");
		const tagLine = searchParams.get("tagLine");
	}, [searchParams]);

	return (
		<div>
			{matchId && (
				<MatchDetails
					matchId={matchId}
					matchDetails={matchDetails}
					accountData={accountData}
				/>
			)}
		</div>
	);
};

export default MatchPage;
