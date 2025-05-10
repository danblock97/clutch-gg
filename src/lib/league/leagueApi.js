import { supabase, supabaseAdmin } from "../supabase.js";

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

	const matchData = await matchDetailResponse.json();

	// Extract the region from the first participant's puuid
	// This is needed for fetching rank data
	if (matchData.metadata && matchData.info && matchData.info.participants && matchData.info.participants.length > 0) {
		// Get the first participant's puuid to determine the region
		const firstPuuid = matchData.info.participants[0].puuid;
		// Extract region code from the matchId (e.g., "NA1_123456789" -> "NA1")
		const regionCode = matchId.split('_')[0];

		// Enrich participants with rank data
		matchData.info.participants = await Promise.all(
			matchData.info.participants.map(async (participant) => {
				try {
					// Fetch rank data for this participant
					const rankData = await fetchParticipantRank(participant.puuid, regionCode);
					return { ...participant, ...rankData };
				} catch (error) {
					console.error(`Error fetching rank for participant ${participant.puuid}:`, error);
					return participant;
				}
			})
		);
	}

	return matchData;
};

/**
 * Upsert match detail into the matches table.
 */
export const upsertMatchDetail = async (matchId, puuid, matchDetail) => {
	const { error: insertMatchError } = await supabaseAdmin
		.from("league_matches")
		.upsert(
			{
				matchid: matchId,
				playerid: puuid,
			},
			{ onConflict: ["matchid"] }
		);
	// Silent error handling
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
	// Always try to fetch as much as possible, even if some fail
	const normalizedRegion = region.toUpperCase();
	let rankedData = [];
	let accountData = {};
	let summonerData = {};
	let soloQueueData = null;
	let errors = [];

	// Fetch all in parallel, but catch errors individually
	const rankedPromise = fetch(`https://${normalizedRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } })
		.then(r => r.ok ? r.json() : Promise.reject("ranked"))
		.then(data => { rankedData = data; soloQueueData = data.find(q => q.queueType === "RANKED_SOLO_5x5"); })
		.catch(e => { errors.push("ranked"); });

	const accountPromise = fetch(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } })
		.then(r => r.ok ? r.json() : Promise.reject("account"))
		.then(data => { accountData = data; })
		.catch(e => { errors.push("account"); });

	const summonerPromise = fetch(`https://${normalizedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } })
		.then(r => r.ok ? r.json() : Promise.reject("summoner"))
		.then(data => { summonerData = data; })
		.catch(e => { errors.push("summoner"); });

	await Promise.all([rankedPromise, accountPromise, summonerPromise]);

	// Fallbacks for missing data
	return {
		rank: soloQueueData ? `${soloQueueData.tier} ${soloQueueData.rank}` : "Unranked",
		lp: soloQueueData ? soloQueueData.leaguePoints : 0,
		wins: soloQueueData ? soloQueueData.wins : 0,
		losses: soloQueueData ? soloQueueData.losses : 0,
		gameName: accountData.gameName || "",
		tagLine: accountData.tagLine || "",
		summonerLevel: summonerData.summonerLevel || 0,
		_partialError: errors.length > 0 ? errors : undefined,
	};
};

/**
 * Fetch participant rank data for match history enrichment.
 */
// Helper to retry a fetch function with fallback
async function retryFetch(fn, args, retries = 2, fallback = null, delayMs = 500) {
	try {
		return await fn(...args);
	} catch (error) {
		if (retries > 0) {
			await new Promise((res) => setTimeout(res, delayMs));
			return retryFetch(fn, args, retries - 1, fallback, delayMs * 2);
		}
		if (fallback !== null) {
			console.error("[fetchParticipantRank] Fallback after retries:", error);
			return fallback;
		}
		throw error;
	}
}

export const fetchParticipantRank = async (puuid, region) => {
	const fallback = {
		rank: "Unranked",
		lp: 0,
		wins: 0,
		losses: 0,
		summonerLevel: 0,
	};
	return retryFetch(
		async (_puuid, _region) => {
			// Ensure region is uppercase for API compatibility
			const normalizedRegion = _region.toUpperCase();

			// First, get the summoner ID using the puuid
			const summonerResponse = await fetch(
				`https://${normalizedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${_puuid}`,
				{ headers: { "X-Riot-Token": RIOT_API_KEY } }
			);

			if (!summonerResponse.ok) {
				throw new Error(`Failed to fetch summoner data for puuid: ${_puuid}`);
			}

			const summonerData = await summonerResponse.json();
			const summonerId = summonerData.id;

			// Then, fetch ranked data using the summoner ID
			const rankedResponse = await fetch(
				`https://${normalizedRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
				{ headers: { "X-Riot-Token": RIOT_API_KEY } }
			);

			if (!rankedResponse.ok) {
				throw new Error(`Failed to fetch ranked data for summonerId: ${summonerId}`);
			}

			const rankedData = await rankedResponse.json();
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
				summonerLevel: summonerData.summonerLevel,
			};
		},
		[puuid, region],
		2, // 2 retries (3 attempts total)
		fallback
	);
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
