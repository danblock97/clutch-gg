"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LiveGame from "@/components/league/LiveGame";
import Loading from "@/components/Loading";
import useProfileData from "@/app/hooks/league/useProfileData";
import NoActiveGameData from "@/components/league/NoActiveGameData";

const LiveGamePage = () => {
	const { liveGameData, isLoading, error, fetchProfileData } = useProfileData();
	const searchParams = useSearchParams();
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");

	useEffect(() => {
		if (gameName && tagLine) {
			fetchProfileData(gameName, tagLine);
		}
	}, [gameName, tagLine]);

	if (isLoading) {
		return <Loading />;
	}

	if (error) {
		return <p className="text-red-500">{error}</p>;
	}

	if (!liveGameData || !liveGameData.participants) {
		return <NoActiveGameData gameName={gameName} tagLine={tagLine} />;
	}

	return (
		<div>
			<LiveGame liveGameData={liveGameData} />
		</div>
	);
};

export default LiveGamePage;
