import { supabase } from "@/lib/supabase";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

/**
 * Fetch League summoner data using an encrypted PUUID.
 */
export const fetchSummonerData = async (encryptedPUUID, region) => {
	// Ensure region is uppercase for API compatibility
	const normalizedRegion = region.toUpperCase();

	const summonerResponse = await fetch(
		`https://${normalizedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encryptedPUUID}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	);
	if (!summonerResponse.ok) {
		throw new Error("Failed to fetch summoner data");
	}
	return summonerResponse.json();
};

/**
 * Fetch champion mastery data.
 */
export const fetchChampionMasteryData = async (encryptedPUUID, region) => {
	// Ensure region is uppercase for API compatibility
	const normalizedRegion = region.toUpperCase();

	const url = `https://${normalizedRegion}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encryptedPUUID}`;
	const championMasteryResponse = await fetch(url, {
		headers: { "X-Riot-Token": RIOT_API_KEY },
	});
	if (!championMasteryResponse.ok) {
		const errorText = await championMasteryResponse.text();
		throw new Error(
			`Failed to fetch champion mastery data. Status: ${championMasteryResponse.status} - ${errorText}`
		);
	}
	const masteryData = await championMasteryResponse.json();
	return masteryData.slice(0, 6);
};

/**
 * Fetch ranked data.
 */
export const fetchRankedData = async (summonerId, region) => {
	// Ensure region is uppercase for API compatibility
	const normalizedRegion = region.toUpperCase();

	const rankedResponse = await fetch(
		`https://${normalizedRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	);
	if (!rankedResponse.ok) {
		throw new Error("Failed to fetch ranked data");
	}
	return rankedResponse.json();
};

/**
 * Fetch match IDs.
 */
export const fetchMatchIds = async (encryptedPUUID, platform) => {
	const matchResponse = await fetch(
		`https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encryptedPUUID}/ids?start=0&count=20`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	);
	if (!matchResponse.ok) {
		throw new Error("Failed to fetch match data");
	}
	return matchResponse.json();
};

/**
 * Fetch detailed match data.
 */
export const fetchMatchDetail = async (matchId, platform) => {
	const matchDetailResponse = await fetch(
		`https://${platform}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	);
	if (!matchDetailResponse.ok) {
		return null;
	}
	return matchDetailResponse.json();
};

/**
 * Upsert match detail into the matches table.
 */
export const upsertMatchDetail = async (matchId, puuid, matchDetail) => {
	const { error: insertMatchError } = await supabase
		.from("league_matches")
		.upsert(
			{
				matchid: matchId,
				playerid: puuid,
			},
			{ onConflict: ["matchid"] }
		);
	if (insertMatchError) {
		console.error("Error inserting match:", insertMatchError);
	}
};

/**
 * Fetch live game data.
 */
export const fetchLiveGameData = async (puuid, region, platform) => {
	// Ensure region is uppercase for API compatibility
	const normalizedRegion = region.toUpperCase();

	const liveGameResponse = await fetch(
		`https://${normalizedRegion}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	);
	if (!liveGameResponse.ok) return null;

	const liveGameData = await liveGameResponse.json();
	// Enrich each participant with additional League-specific data concurrently.
	liveGameData.participants = await Promise.all(
		liveGameData.participants.map(async (participant) => {
			const additionalData = await fetchAdditionalData(
				participant.summonerId,
				participant.puuid,
				normalizedRegion
			);
			return { ...participant, ...additionalData };
		})
	);
	return liveGameData;
};

/**
 * Fetch additional data for live game enrichment.
 */
export const fetchAdditionalData = async (summonerId, puuid, region) => {
	try {
		// Ensure region is uppercase for API compatibility
		const normalizedRegion = region.toUpperCase();

		const [rankedResponse, accountResponse, summonerResponse] =
			await Promise.all([
				fetch(
					`https://${normalizedRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
					{ headers: { "X-Riot-Token": RIOT_API_KEY } }
				),
				fetch(
					`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
					{ headers: { "X-Riot-Token": RIOT_API_KEY } }
				),
				fetch(
					`https://${normalizedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
					{ headers: { "X-Riot-Token": RIOT_API_KEY } }
				),
			]);

		if (!rankedResponse.ok || !accountResponse.ok || !summonerResponse.ok) {
			throw new Error("Failed to fetch additional data");
		}

		const [rankedData, accountData, summonerData] = await Promise.all([
			rankedResponse.json(),
			accountResponse.json(),
			summonerResponse.json(),
		]);
		const soloQueueData = rankedData.find(
			(queue) => queue.queueType === "RANKED_SOLO_5x5"
		);
		return {
			rank: soloQueueData
				? `${soloQueueData.tier} ${soloQueueData.rank}`
				: "Unranked",
			lp: soloQueueData ? soloQueueData.leaguePoints : 0,
			wins: soloQueueData ? soloQueueData.wins : 0,
			losses: soloQueueData ? soloQueueData.losses : 0,
			gameName: accountData.gameName,
			tagLine: accountData.tagLine,
			summonerLevel: summonerData.summonerLevel,
		};
	} catch (error) {
		return {
			rank: "Unranked",
			lp: 0,
			wins: 0,
			losses: 0,
			gameName: "",
			tagLine: "",
			summonerLevel: 0,
		};
	}
};

/* =====================================================
   NEW HELPER FUNCTIONS (for leaderboard, if needed)
   ===================================================== */

/**
 * Fetch summoner details to get the PUUID and profile icon.
 */
export const fetchSummonerPUUID = async (summonerId, region) => {
	const response = await fetch(
		`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	);
	if (!response.ok) {
		throw new Error(`Failed to fetch PUUID for summonerId: ${summonerId}`);
	}
	const data = await response.json();
	return { puuid: data.puuid, profileIconId: data.profileIconId };
};

/**
 * Fetch account data using a player's PUUID.
 */
export const fetchAccountDataByPUUID = async (puuid) => {
	const response = await fetch(
		`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	);
	if (!response.ok) {
		throw new Error(`Failed to fetch account data for puuid: ${puuid}`);
	}
	return response.json();
};
