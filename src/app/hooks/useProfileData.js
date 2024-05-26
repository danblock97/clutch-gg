import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const useProfileData = () => {
	const [profileData, setProfileData] = useState(null);
	const [accountData, setAccountData] = useState(null);
	const [rankedData, setRankedData] = useState(null);
	const [championMasteryData, setChampionMasteryData] = useState(null);
	const [matchData, setMatchesData] = useState(null);
	const [matchDetails, setMatchDetails] = useState(null);
	const [liveGameData, setLiveGameData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const router = useRouter();
	const gameName = useSearchParams().get("gameName");
	const tagLine = useSearchParams().get("tagLine");

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`/api/profile?gameName=${gameName}&tagLine=${tagLine}`
			);
			if (!response.ok) throw new Error("Failed to fetch");
			const data = await response.json();
			setProfileData(data.profileData);
			setAccountData(data.accountData);
			setRankedData(data.rankedData);
			setChampionMasteryData(data.championMasteryData);
			setMatchesData(data.matchData);
			setMatchDetails(data.matchDetails);
			setLiveGameData(data.liveGameData);
		} catch (error) {
			setError(error.message || "Failed to fetch data");
		} finally {
			setIsLoading(false);
		}
	}, [gameName, tagLine]);

	useEffect(() => {
		if (gameName && tagLine) {
			fetchData();
			const interval = setInterval(fetchData, 200000);
			return () => clearInterval(interval);
		}
	}, [fetchData, gameName, tagLine]);

	const fetchProfileBySummonerId = useCallback(async (summonerId) => {
		try {
			const response = await fetch(`/api/profile?summonerId=${summonerId}`);
			if (!response.ok) throw new Error("Failed to fetch");
			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Error fetching profile by summonerId:", error);
			return null;
		}
	}, []);

	return {
		profileData,
		accountData,
		rankedData,
		championMasteryData,
		matchData,
		matchDetails,
		liveGameData,
		isLoading,
		error,
		fetchProfileBySummonerId,
	};
};

export default useProfileData;
