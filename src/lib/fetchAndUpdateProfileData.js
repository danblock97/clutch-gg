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
			{ headers: { "X-Riot-Token": RIOT_API_KEY } }
		);

		if (!accountResponse.ok) {
			const errorDetails = await accountResponse.json();
			throw new Error("Failed to fetch account data");
		}

		const accountData = await accountResponse.json();
		const encryptedPUUID = accountData.puuid;

		// Fetch summoner data using Summoner-V4 API
		const profileResponse = await fetch(
			`https://${selectedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encryptedPUUID}`,
			{ headers: { "X-Riot-Token": RIOT_API_KEY } }
		);

		if (!profileResponse.ok) {
			const errorDetails = await profileResponse.json();
			throw new Error("Failed to fetch summoner profile");
		}

		const profileDataFetched = await profileResponse.json();

		// Fetch match IDs using Match-V5 API
		const matchResponse = await fetch(
			`https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encryptedPUUID}/ids?start=0&count=10`,
			{ headers: { "X-Riot-Token": RIOT_API_KEY } }
		);

		if (!matchResponse.ok) {
			const errorDetails = await matchResponse.json();
			throw new Error("Failed to fetch match data");
		}

		const matchData = await matchResponse.json();

		if (matchData.length === 0) {
			throw new Error("No match data available");
		}

		// Fetch match details for each match ID
		const matchDetails = await Promise.all(
			matchData.map(async (matchId) => {
				try {
					const matchDetailResponse = await fetch(
						`https://${platform}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
						{ headers: { "X-Riot-Token": RIOT_API_KEY } }
					);

					if (!matchDetailResponse.ok) {
						console.error(
							`Failed to fetch match details for match ID ${matchId}`
						);
						return null;
					}

					const matchDetail = await matchDetailResponse.json();

					// Upsert match details into Supabase
					const { error } = await supabase.from("matches").upsert(
						{
							matchid: matchId,
							playerid: profileDataFetched.puuid,
							matchdetails: matchDetail,
						},
						{ onConflict: ["matchid"] }
					);

					if (error) {
						console.error(
							`Supabase Upsert Error for match ID ${matchId}:`,
							error
						);
					}

					return matchDetail;
				} catch (fetchError) {
					console.error(
						`Error fetching match details for match ID ${matchId}:`,
						fetchError
					);
					return null; // Continue processing even if one match fails
				}
			})
		);

		// Filter out null match details
		const validMatchDetails = matchDetails.filter((detail) => detail !== null);

		// Fetch ranked data (optional)
		const rankedResponse = await fetch(
			`https://${selectedRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${profileDataFetched.id}`,
			{ headers: { "X-Riot-Token": RIOT_API_KEY } }
		);
		const rankedData = rankedResponse.ok ? await rankedResponse.json() : null;

		// Fetch champion mastery data (optional)
		const championMasteryResponse = await fetch(
			`https://${selectedRegion}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${profileDataFetched.puuid}`,
			{ headers: { "X-Riot-Token": RIOT_API_KEY } }
		);
		const championMasteryData = championMasteryResponse.ok
			? await championMasteryResponse.json()
			: null;

		// Fetch live game data (optional)
		const liveGameResponse = await fetch(
			`https://${selectedRegion}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${profileDataFetched.id}`,
			{ headers: { "X-Riot-Token": RIOT_API_KEY } }
		);
		const liveGameData = liveGameResponse.ok
			? await liveGameResponse.json()
			: null;

		// Upsert data into Supabase
		const data = {
			gamename: gameName,
			tagline: tagLine,
			profiledata: profileDataFetched,
			accountdata: accountData,
			rankeddata: rankedData,
			championmasterydata: championMasteryData
				? championMasteryData.slice(0, 5)
				: [],
			matchdata: matchData,
			matchdetails: validMatchDetails,
			livegamedata: liveGameData,
			region: selectedRegion,
			updatedat: new Date(),
		};

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
