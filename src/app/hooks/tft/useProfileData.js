import { useState, useEffect } from "react";

export default function useTFTProfileData(profileData) {
	const [summonerData, setSummonerData] = useState(null);
	const [rankedData, setRankedData] = useState([]);
	const [matchData, setMatchData] = useState([]);
	const [matchDetails, setMatchDetails] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (profileData) {
			setSummonerData({
				name: profileData.accountdata?.gameName || "Unknown",
				tagLine: profileData.accountdata?.tagLine || "Unknown",
				profileIconId: profileData.profiledata?.profileIconId || 1,
				summonerLevel: profileData.profiledata?.summonerLevel || 0,
				puuid: profileData.profiledata?.puuid || "",
			});

			// Handle rankeddata - TFT ranked data is a single object, not an array like League
			let processedRankedData = [];
			if (profileData.rankeddata) {
				if (Array.isArray(profileData.rankeddata)) {
					// Legacy format: array of rank objects
					processedRankedData = profileData.rankeddata;
				} else if (typeof profileData.rankeddata === "object" && profileData.rankeddata.rank) {
					// New format: single TFT rank object from additionalData
					processedRankedData = [profileData.rankeddata]; // Wrap in array for consistency
				} else if (typeof profileData.rankeddata === "object") {
					// Fallback: JSONB object, convert to array
					processedRankedData = Object.values(profileData.rankeddata).filter(Boolean);
				}
			}
			setRankedData(processedRankedData);
			setMatchData(profileData.matchdata || []);
			setMatchDetails(
				profileData.matchdetails?.filter(Boolean).map((match) => {
					return {
						...match,
						metadata: match.metadata || {},
						info: match.info || {},
					};
				}) || []
			);

			setIsLoading(false);
		}
	}, [profileData]);

	return {
		summonerData,
		rankedData,
		matchData,
		matchDetails,
		isLoading,
	};
}
