"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LiveGame from "@/components/LiveGame";
import Loading from "@/components/Loading";

const LiveGamePage = () => {
	const [liveGameData, setLiveGameData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [retryCountdown, setRetryCountdown] = useState(0);
	const searchParams = useSearchParams();
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");

	const fetchLiveGameData = async () => {
		setIsLoading(true);
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
			setError(null);
		} catch (error) {
			setError(error.message);
			setRetryCountdown(10); // Set countdown to 10 seconds
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (gameName && tagLine) {
			fetchLiveGameData();
		}
	}, [gameName, tagLine]);

	useEffect(() => {
		if (retryCountdown > 0) {
			const timer = setTimeout(
				() => setRetryCountdown(retryCountdown - 1),
				1000
			);
			return () => clearTimeout(timer);
		} else if (retryCountdown === 0 && error) {
			fetchLiveGameData(); // Retry fetching data
		}
	}, [retryCountdown, error]);

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
			<LiveGame liveGameData={liveGameData} />
		</div>
	);
};

export default LiveGamePage;
