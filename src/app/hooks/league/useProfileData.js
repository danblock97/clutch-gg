import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const useProfileData = (gameName, tagLine) => {
	const [profileData, setProfileData] = useState(null);
	const [accountData, setAccountData] = useState(null);
	const [rankedData, setRankedData] = useState(null);
	const [championMasteryData, setChampionMasteryData] = useState(null);
	const [matchDetails, setMatchDetails] = useState(null);
	const [liveGameData, setLiveGameData] = useState(null);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchProfileData = async () => {
			if (!gameName || !tagLine) {
				setError("Missing gameName or tagLine");
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch(
					`/api/league/profile?gameName=${gameName}&tagLine=${tagLine}`
				);
				if (!response.ok) {
					throw new Error("Failed to fetch profile");
				}
				const data = await response.json();
				setProfileData(data.profiledata);
				setAccountData(data.accountdata);
				setRankedData(data.rankeddata);
				setChampionMasteryData(data.championmasterydata);
				setMatchDetails(data.matchdetails);
				setLiveGameData(data.livegamedata);
			} catch (error) {
				console.error("Error fetching profile data:", error);
				setError(error.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProfileData();
	}, [gameName, tagLine]);

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
