import { supabase } from "@/lib/supabase";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const regionToPlatform = {
	BR1: "americas",
	EUN1: "europe",
	EUW1: "europe",
	JP1: "asia",
	KR: "asia",
	LA1: "americas",
	LA2: "americas",
	NA1: "americas",
	OC1: "sea",
	TR1: "europe",
	RU: "europe",
	PH2: "sea",
	SG2: "sea",
	TH2: "sea",
	TW2: "sea",
	VN2: "sea",
};

export const fetchAndUpdateProfileData = async (
	gameName,
	tagLine,
	selectedRegion
) => {
	if (!gameName || !tagLine || !selectedRegion) {
		throw new Error("Missing required query parameters");
	}

	try {
		const platform = regionToPlatform[selectedRegion];
		if (!platform) {
			throw new Error("Invalid region selected");
		}

		// Fetch account data using Account-V1 API
		const accountResponse = await fetch(
			`https://${platform}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
				gameName
			)}/${encodeURIComponent(tagLine)}`,
			{
				headers: { "X-Riot-Token": RIOT_API_KEY },
			}
		);

		if (!accountResponse.ok) {
			const errorDetails = await accountResponse.json();
			console.log("Account API Error:", errorDetails);
			throw new Error("Failed to fetch account data");
		}

		const accountData = await accountResponse.json();
		const encryptedPUUID = accountData.puuid;

		// Fetch summoner data using Summoner-V4 API
		const profileResponse = await fetch(
			`https://${selectedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encryptedPUUID}`,
			{
				headers: { "X-Riot-Token": RIOT_API_KEY },
			}
		);

		if (!profileResponse.ok) {
			const errorDetails = await profileResponse.json();
			console.log("Summoner API Error:", errorDetails);
			throw new Error("Failed to fetch summoner profile");
		}

		const profileDataFetched = await profileResponse.json();

		// Fetch match IDs using Match-V5 API
		const matchResponse = await fetch(
			`https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encryptedPUUID}/ids?start=0&count=10`,
			{
				headers: { "X-Riot-Token": RIOT_API_KEY },
			}
		);
		console.log(`Match API response status: ${matchResponse.status}`);

		if (!matchResponse.ok) {
			const errorDetails = await matchResponse.json();
			console.log("Match API Error:", errorDetails);
			throw new Error("Failed to fetch match data");
		}

		const matchData = await matchResponse.json();

		if (matchData.length === 0) {
			console.log("No matches found for this summoner.");
			throw new Error("No match data available");
		}

		// Fetch match details for each match ID
		const matchDetails = await Promise.all(
			matchData.map(async (matchId) => {
				const matchDetailResponse = await fetch(
					`https://${platform}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
					{
						headers: { "X-Riot-Token": RIOT_API_KEY },
					}
				);

				if (!matchDetailResponse.ok) {
					console.log(`Failed to fetch match details for match ID ${matchId}`);
					return null;
				}

				const matchDetail = await matchDetailResponse.json();

				// Upsert match details into Supabase
				await supabase.from("matches").upsert(
					{
						matchid: matchId,
						playerid: profileDataFetched.puuid,
						matchdetails: matchDetail,
					},
					{ onConflict: ["matchid"] }
				);

				return matchDetail;
			})
		);

		// Fetch ranked data (optional, may be empty or null)
		const rankedResponse = await fetch(
			`https://${selectedRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${profileDataFetched.id}`,
			{
				headers: { "X-Riot-Token": RIOT_API_KEY },
			}
		);
		const rankedData = rankedResponse.ok ? await rankedResponse.json() : null;
		console.log(`Ranked data: ${rankedData ? "Found" : "Not available"}`);

		// Fetch champion mastery data (optional, may be empty or null)
		const championMasteryResponse = await fetch(
			`https://${selectedRegion}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${profileDataFetched.puuid}`,
			{
				headers: { "X-Riot-Token": RIOT_API_KEY },
			}
		);
		const championMasteryDataRaw = championMasteryResponse.ok
			? await championMasteryResponse.json()
			: null;
		const championMasteryData = championMasteryDataRaw
			? championMasteryDataRaw.slice(0, 5)
			: null;
		console.log(
			`Champion mastery data: ${
				championMasteryData ? "Found" : "Not available"
			}`
		);

		// Fetch live game data (optional)
		const liveGameResponse = await fetch(
			`https://${selectedRegion}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${profileDataFetched.id}`,
			{
				headers: { "X-Riot-Token": RIOT_API_KEY },
			}
		);
		let liveGameData = null;
		if (liveGameResponse.ok) {
			liveGameData = await liveGameResponse.json();
		}

		// Upsert data into Supabase
		const data = {
			gamename: gameName,
			tagline: tagLine,
			profiledata: profileDataFetched,
			accountdata: accountData,
			rankeddata: rankedData,
			championmasterydata: championMasteryData || [], // Ensure empty array instead of null
			matchdata: matchData,
			matchdetails: matchDetails.filter((detail) => detail !== null),
			livegamedata: liveGameData,
			region: selectedRegion,
			updatedat: new Date(),
		};

		// Ensure there's a unique constraint on gamename, tagline, and region
		const { error } = await supabase
			.from("profiles")
			.upsert(data, { onConflict: ["gamename", "tagline", "region"] });

		if (error) {
			console.error("Supabase Upsert Error:", error);
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error fetching profile data:", error.message);
		throw new Error(error.message);
	}
};
