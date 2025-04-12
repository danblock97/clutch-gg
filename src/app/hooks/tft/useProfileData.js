import { useState, useEffect } from "react";

export default function useTFTProfileData(profileData) {
	const [summonerData, setSummonerData] = useState(null);
	const [rankedData, setRankedData] = useState([]);
	const [matchData, setMatchData] = useState([]);
	const [matchDetails, setMatchDetails] = useState([]);
	const [liveGameData, setLiveGameData] = useState(null);
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

			setRankedData(profileData.rankeddata || []);
			setMatchData(profileData.matchdata || []);
			setLiveGameData(profileData.livegamedata);
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
		liveGameData,
		isLoading,
	};
}
