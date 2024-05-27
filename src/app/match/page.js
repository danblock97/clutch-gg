"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MatchDetails from "@/components/MatchDetails";
import useProfileData from "../hooks/useProfileData";
import Loading from "@/components/Loading";

const MatchPage = () => {
	const searchParams = useSearchParams();
	const matchId = searchParams.get("matchId");
	const { matchDetails, accountData, error, isLoading, retryCountdown } =
		useProfileData();

	useEffect(() => {
		const gameName = searchParams.get("gameName");
		const tagLine = searchParams.get("tagLine");
	}, [searchParams]);

	if (isLoading) {
		return <Loading />;
	}

	if (error) {
		return (
			<div>
				<p className="text-red-500">{error}</p>
				{retryCountdown > 0 && (
					<p className="text-yellow-500">
						Failed to fetch, automatic retry in {retryCountdown} seconds
					</p>
				)}
			</div>
		);
	}

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
