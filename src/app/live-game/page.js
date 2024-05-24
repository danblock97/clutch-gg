"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LiveGame from "@/components/LiveGame";
import Loading from "@/components/Loading";

const LiveGamePage = () => {
	const [liveGameData, setLiveGameData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const searchParams = useSearchParams();
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");

	useEffect(() => {
		const fetchLiveGameData = async () => {
			try {
				const response = await fetch(
					`/api/profile?gameName=${encodeURIComponent(
						gameName
					)}&tagLine=${encodeURIComponent(tagLine)}`
				);
				const data = await response.json();

				if (!data.liveGameData) {
					throw new Error("No active game found");
				}

				setLiveGameData(data.liveGameData);
			} catch (error) {
				setError(error.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchLiveGameData();
	}, [gameName, tagLine]);

	if (isLoading) {
		return <Loading />;
	}

	if (error) {
		return <p className="text-red-500">{error}</p>;
	}

	return <LiveGame liveGameData={liveGameData} />;
};

export default LiveGamePage;
