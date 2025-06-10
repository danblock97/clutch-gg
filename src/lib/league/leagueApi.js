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
 * Fetch champion mastery data with retry logic.
 */
export const fetchChampionMasteryData = async (
	encryptedPUUID,
	region,
	retries = 3
) => {
	// Ensure region is uppercase for API compatibility
	const normalizedRegion = region.toUpperCase();

	const url = `https://${normalizedRegion}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encryptedPUUID}`;

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			console.log(
				`Fetching champion mastery data (attempt ${attempt}/${retries})`
			);

			const championMasteryResponse = await fetch(url, {
				headers: {
					"X-Riot-Token": RIOT_API_KEY,
					Accept: "application/json",
				},
			});

			if (championMasteryResponse.ok) {
				const masteryData = await championMasteryResponse.json();
				return masteryData.slice(0, 6);
			}

			// Handle specific error cases
			if (championMasteryResponse.status === 429) {
				const retryAfter = championMasteryResponse.headers.get("Retry-After");
				const waitTime = (retryAfter ? parseInt(retryAfter) : 2) * 1000;
				console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
				await new Promise((resolve) => setTimeout(resolve, waitTime));
				continue;
			}

			if (
				championMasteryResponse.status === 502 ||
				championMasteryResponse.status === 503
			) {
				const waitTime = attempt * 1000; // Exponential backoff
				console.log(
					`Server error (${championMasteryResponse.status}). Waiting ${waitTime}ms before retry...`
				);
				await new Promise((resolve) => setTimeout(resolve, waitTime));
				continue;
			}

			// For other errors, throw immediately
			const errorText = await championMasteryResponse.text();
			throw new Error(
				`Failed to fetch champion mastery data. Status: ${championMasteryResponse.status} - ${errorText}`
			);
		} catch (error) {
			if (attempt === retries) {
				console.error("All retry attempts failed:", error);
				throw error;
			}
			console.warn(`Attempt ${attempt} failed:`, error);
		}
	}

	throw new Error(
		"Failed to fetch champion mastery data after all retry attempts"
	);
};

/**
 * Fetch ranked data.
 */
export const fetchRankedData = async (encryptedPUUID, region) => {
	// Ensure region is uppercase for API compatibility
	const normalizedRegion = region.toUpperCase();

	const rankedResponse = await fetch(
		`https://${normalizedRegion}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encryptedPUUID}`,
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

	// Extract the region from the matchId (e.g., "NA1_123456789" -> "NA1")
	if (
		matchData.metadata &&
		matchData.info &&
		matchData.info.participants &&
		matchData.info.participants.length > 0
	) {
		// No additional processing needed
	}

	return matchData;
};

/**
 * Upsert match detail into the simplified League table.
 * Stores the complete match data with all participants in JSONB.
 */
export const upsertMatchDetail = async (
	matchId,
	puuid,
	matchDetail,
	riotAccountId
) => {
	try {
		if (!matchDetail?.info || !matchDetail?.metadata) {
			console.error("Invalid match detail structure:", {
				matchId,
				hasInfo: !!matchDetail?.info,
				hasMetadata: !!matchDetail?.metadata,
			});
			return;
		}

		// Insert into league_matches with full match data including all participants
		const matchInfo = matchDetail.info;
		const { error: matchError } = await supabaseAdmin
			.from("league_matches")
			.upsert(
				{
					matchid: matchId,
					game_mode: matchInfo.gameMode,
					game_type: matchInfo.gameType,
					game_duration: matchInfo.gameDuration,
					game_creation: matchInfo.gameCreation,
					game_start_timestamp: matchInfo.gameStartTimestamp,
					game_end_timestamp: matchInfo.gameEndTimestamp,
					platform_id: matchInfo.platformId,
					queue_id: matchInfo.queueId,
					season_id: matchInfo.seasonId,
					game_version: matchInfo.gameVersion,
					map_id: matchInfo.mapId,
					match_data: matchDetail, // Store complete match data including all participants
				},
				{ onConflict: ["matchid"], ignoreDuplicates: true }
			);

		if (matchError) {
			console.error("Error upserting into league_matches:", matchError);
			throw matchError;
		}
	} catch (err) {
		console.error("upsertMatchDetail failed:", err);
		throw err;
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
export const fetchAdditionalData = async (puuid, region) => {
	// Always try to fetch as much as possible, even if some fail
	const normalizedRegion = region.toUpperCase();
	let rankedData = [];
	let accountData = {};
	let summonerData = {};
	let soloQueueData = null;
	let errors = [];

	// Fetch all in parallel, but catch errors individually
	const rankedPromise = fetch(
		`https://${normalizedRegion}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	)
		.then((r) => (r.ok ? r.json() : Promise.reject("ranked")))
		.then((data) => {
			rankedData = data;
			soloQueueData = data.find((q) => q.queueType === "RANKED_SOLO_5x5");
		})
		.catch((e) => {
			errors.push("ranked");
		});

	const accountPromise = fetch(
		`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	)
		.then((r) => (r.ok ? r.json() : Promise.reject("account")))
		.then((data) => {
			accountData = data;
		})
		.catch((e) => {
			errors.push("account");
		});

	const summonerPromise = fetch(
		`https://${normalizedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	)
		.then((r) => (r.ok ? r.json() : Promise.reject("summoner")))
		.then((data) => {
			summonerData = data;
		})
		.catch((e) => {
			errors.push("summoner");
		});

	await Promise.all([rankedPromise, accountPromise, summonerPromise]);

	// Fallbacks for missing data
	return {
		rank: soloQueueData
			? `${soloQueueData.tier} ${soloQueueData.rank}`
			: "Unranked",
		lp: soloQueueData ? soloQueueData.leaguePoints : 0,
		wins: soloQueueData ? soloQueueData.wins : 0,
		losses: soloQueueData ? soloQueueData.losses : 0,
		gameName: accountData.gameName || "",
		tagLine: accountData.tagLine || "",
		summonerLevel: summonerData.summonerLevel || 0,
		_partialError: errors.length > 0 ? errors : undefined,
	};
};

/* =====================================================
   NEW HELPER FUNCTIONS (for leaderboard, if needed)
   ===================================================== */

/**
 * Fetch summoner details to get the PUUID and profile icon.
 */
export const fetchSummonerPUUID = async (puuid, region) => {
	const response = await fetch(
		`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	);
	if (!response.ok) {
		throw new Error(`Failed to fetch PUUID for puuid: ${puuid}`);
	}
	const data = await response.json();
	return { puuid: data.puuid, profileIconId: data.profileIconId };
};

/**
 * Convert summoner ID to PUUID and profile icon using the non-deprecated endpoint.
 * This is needed for leaderboard APIs that still return summoner IDs.
 */
export const fetchPUUIDFromSummonerId = async (summonerId, region) => {
	const response = await fetch(
		`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch summoner data for summoner ID: ${summonerId}`
		);
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
