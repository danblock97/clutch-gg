"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import LiveGame from "@/components/LiveGame";
import Loading from "@/components/Loading";
import useProfileData from "@/app/hooks/league/useProfileData";
import NoActiveGameData from "@/components/NoActiveGameData";

const LiveGamePage = () => {
	const searchParams = useSearchParams();
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");
	const region = searchParams.get("region");

	// Use the restored hook, passing gameName, tagLine, and region
	const { liveGameData, isLoading, error } = useProfileData(
		gameName,
		tagLine,
		region
	);

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
