import { useState, useEffect, useCallback } from "react";

const useProfileData = (gameName, tagLine, region) => {
	const [profileData, setProfileData] = useState(null);
	const [accountData, setAccountData] = useState(null);
	const [rankedData, setRankedData] = useState(null);
	const [championMasteryData, setChampionMasteryData] = useState(null);
	const [matchDetails, setMatchDetails] = useState(null);
	const [liveGameData, setLiveGameData] = useState(null);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchProfileData = useCallback(async () => {
		if (!gameName || !tagLine || !region) {
			setError("Missing gameName, tagLine, or region");
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch(
				`/api/league/profile?gameName=${gameName}&tagLine=${tagLine}&region=${region}`
			);
			if (!response.ok) {
				throw new Error(`Failed to fetch profile data: ${response.statusText}`);
			}

			const data = await response.json();

			setProfileData(data.profiledata);
			setAccountData(data.accountdata);
			setRankedData(data.rankeddata);
			setChampionMasteryData(data.championmasterydata);
			setMatchDetails(data.matchdetails);
			setLiveGameData(data.livegamedata);
		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	}, [gameName, tagLine, region]);

	useEffect(() => {
		fetchProfileData();
	}, [fetchProfileData]);

	return {
		profileData,
		accountData,
		rankedData,
		championMasteryData,
		matchDetails,
		liveGameData,
		error,
		isLoading,
	};
};

export default useProfileData;
