import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const useProfileData = () => {
	const [profileData, setProfileData] = useState(null);
	const [accountData, setAccountData] = useState(null);
	const [rankedData, setRankedData] = useState(null);
	const [championMasteryData, setChampionMasteryData] = useState(null);
	const [matchData, setMatchesData] = useState(null);
	const [matchDetails, setMatchDetails] = useState(null);
	const [isLoading, setIsLoading] = useState(false); // New loading state
	const [error, setError] = useState(null);
	const router = useRouter();
	const gameName = useSearchParams().get("gameName");
	const tagLine = useSearchParams().get("tagLine");

	useEffect(() => {
		if (gameName && tagLine) {
			setIsLoading(true); // Set loading state to true when fetching data starts
			fetch(`/api/profile?gameName=${gameName}&tagLine=${tagLine}`)
				.then((response) => {
					if (!response.ok) throw new Error("Failed to fetch");
					return response.json();
				})
				.then((data) => {
					setProfileData(data.profileData);
					setAccountData(data.accountData);
					setRankedData(data.rankedData);
					setChampionMasteryData(data.championMasteryData);
					setMatchesData(data.matchData);
					setMatchDetails(data.matchDetails);
					setIsLoading(false); // Set loading state to false when data fetching completes
				})
				.catch((error) => {
					setError(error.message || "Failed to fetch data");
					setIsLoading(false); // Set loading state to false in case of error
				});
		}
	}, [router.query, gameName, tagLine]);

	return {
		profileData,
		accountData,
		rankedData,
		championMasteryData,
		matchData,
		matchDetails,
		isLoading, // Return isLoading state
		error,
	};
};

export default useProfileData;
