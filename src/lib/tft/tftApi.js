import { supabase, supabaseAdmin } from "../supabase.js";

const TFT_API_KEY = process.env.TFT_API_KEY;

/**
 * Fetch TFT summoner data using an encrypted PUUID.
 */
export const fetchTFTSummonerData = async (encryptedPUUID, region) => {
	if (!TFT_API_KEY) {
		throw new Error("TFT_API_KEY is not configured");
	}

	const url = `https://${region}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${encryptedPUUID}`;

	const summonerResponse = await fetch(url, {
		headers: { "X-Riot-Token": TFT_API_KEY }
	});

	if (!summonerResponse.ok) {
		const errorText = await summonerResponse.text();
		console.error(`TFT Summoner API Error: ${summonerResponse.status} - ${errorText}`);
		console.error(`URL: ${url}`);
		console.error(`Region: ${region}, PUUID: ${encryptedPUUID}`);
		throw new Error(`Failed to fetch TFT summoner data: ${summonerResponse.status} - ${errorText}`);
	}
	return summonerResponse.json();
};

/**
 * Fetch TFT ranked data by PUUID (updated to use by-puuid endpoint).
 */
export const fetchTFTRankedData = async (puuid, region) => {
	if (!TFT_API_KEY) {
		throw new Error("TFT_API_KEY is not configured");
	}

	const url = `https://${region}.api.riotgames.com/tft/league/v1/by-puuid/${puuid}`;

	const rankedResponse = await fetch(url, {
		headers: { "X-Riot-Token": TFT_API_KEY }
	});

	if (!rankedResponse.ok) {
		if (rankedResponse.status === 404) {
			return []; // Player is unranked or has no ranked data.
		}
		const errorBody = await rankedResponse.text();
		console.error(`TFT Ranked API Error: ${rankedResponse.status} - ${errorBody}`);
		console.error(`URL: ${url}`);
		throw new Error(`Failed to fetch TFT ranked data: ${rankedResponse.status} - ${errorBody}`);
	}
	return rankedResponse.json();
};

/**
 * Fetch TFT match IDs.
 */
export const fetchTFTMatchIds = async (encryptedPUUID, platform) => {
	const matchResponse = await fetch(
		`https://${platform}.api.riotgames.com/tft/match/v1/matches/by-puuid/${encryptedPUUID}/ids?count=20`,
		{ headers: { "X-Riot-Token": TFT_API_KEY } }
	);
	if (!matchResponse.ok) {
		throw new Error("Failed to fetch TFT match data");
	}
	return matchResponse.json();
};

/**
 * Fetch detailed TFT match data.
 */
export const fetchTFTMatchDetail = async (matchId, platform) => {
	// 1. Try fetching from Supabase cache first
	try {
		const { data: cachedMatch, error } = await supabase
			.from("tft_matches")
			.select("match_data")
			.eq("matchid", matchId)
			.maybeSingle();

		if (!error && cachedMatch?.match_data) {
			return cachedMatch.match_data;
		}
	} catch (dbError) {
		console.warn(`Failed to fetch TFT match ${matchId} from DB cache:`, dbError);
	}

	// 2. Fallback to Riot API
	try {
		const matchDetailResponse = await fetch(
			`https://${platform}.api.riotgames.com/tft/match/v1/matches/${matchId}`,
			{ headers: { "X-Riot-Token": TFT_API_KEY } }
		);
		if (!matchDetailResponse.ok) {
			console.error(`Riot API Error for TFT match ${matchId}: ${matchDetailResponse.status}`);
			return null;
		}
		return matchDetailResponse.json();
	} catch (apiError) {
		console.error(`Riot API Exception for TFT match ${matchId}:`, apiError);
		return null;
	}
};

/**
 * Upsert TFT match detail into the simplified TFT table.
 * Stores the complete match data with all participants in JSONB.
 */
export const upsertTFTMatchDetail = async (
	matchId,
	puuid,
	matchDetail,
	riotAccountId
) => {
	try {
		if (!matchDetail?.info || !matchDetail?.metadata) {
			console.error("Invalid TFT match detail structure:", {
				matchId,
				hasInfo: !!matchDetail?.info,
				hasMetadata: !!matchDetail?.metadata,
			});
			return;
		}

		// Insert into tft_matches with full match data including all participants
		const matchInfo = matchDetail.info;
		const { error: matchError } = await supabaseAdmin
			.from("tft_matches")
			.upsert(
				{
					matchid: matchId,
					tft_set_number: matchInfo.tft_set_number,
					tft_game_type: matchInfo.tft_game_type,
					game_datetime: matchInfo.game_datetime,
					game_length: matchInfo.game_length,
					queue_id: matchInfo.queue_id,
					match_data: matchDetail, // Store complete match data including all participants
				},
				{ onConflict: ["matchid"], ignoreDuplicates: true }
			);

		if (matchError) {
			console.error("Error upserting into tft_matches:", matchError);
			throw matchError;
		}
	} catch (err) {
		console.error("upsertTFTMatchDetail failed:", err);
		throw err;
	}
};

/**
 * Fetch additional data for TFT player enrichment using PUUID endpoints.
 */
export const fetchTFTAdditionalData = async (puuid, region) => {
	try {
		// Map platform region (e.g. EUW1) to the correct routing cluster (europe / americas / asia / sea)
		const regionToPlatform = {
			BR1: "americas",
			EUN1: "europe",
			EUW1: "europe",
			JP1: "asia",
			KR: "asia",
			LA1: "americas",
			LA2: "americas",
			ME1: "europe",
			NA1: "americas",
			OC1: "americas",
			RU: "europe",
			SG2: "sea",
			TR1: "europe",
			TW2: "sea",
			VN2: "sea",
		};
		const platform = regionToPlatform[region?.toUpperCase()] || "americas";

		const [rankedResponse, accountResponse, summonerResponse] =
			await Promise.all([
				// Updated to use by-puuid endpoint
				fetch(
					`https://${region}.api.riotgames.com/tft/league/v1/by-puuid/${puuid}`,
					{ headers: { "X-Riot-Token": TFT_API_KEY } }
				),
				// Account endpoint is cluster based (americas / europe / asia / sea)
				fetch(
					`https://${platform}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
					{ headers: { "X-Riot-Token": TFT_API_KEY } }
				),
				fetch(
					`https://${region}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${puuid}`,
					{ headers: { "X-Riot-Token": TFT_API_KEY } }
				),
			]);

		// Check responses and log detailed errors
		const rankedData = rankedResponse.ok ? await rankedResponse.json() : [];
		if (!rankedResponse.ok && rankedResponse.status !== 404) {
			console.error(`TFT ranked fetch failed: ${rankedResponse.status} - ${await rankedResponse.text()}`);
		}

		if (!accountResponse.ok) {
			console.error(`TFT account fetch failed: ${accountResponse.status} - ${await accountResponse.text()}`);
			throw new Error("Failed to fetch account data");
		}

		if (!summonerResponse.ok) {
			console.error(`TFT summoner fetch failed: ${summonerResponse.status} - ${await summonerResponse.text()}`);
			throw new Error("Failed to fetch summoner data");
		}

		const [accountData, summonerData] = await Promise.all([
			accountResponse.json(),
			summonerResponse.json(),
		]);

		// TFT ranked data structure is different from League
		const rankedTftData = rankedData.find?.(
			(queue) => queue.queueType === "RANKED_TFT"
		);

		// Combine tier and rank into a single field for LiveGame component compatibility
		const combinedRank = rankedTftData
			? `${rankedTftData.tier} ${rankedTftData.rank}`.trim()
			: "Unranked";

		return {
			queueType: "RANKED_TFT", // Add queueType for frontend compatibility
			tier: rankedTftData ? rankedTftData.tier : "UNRANKED",
			rank: combinedRank, // Combined format like "GOLD IV" for LiveGame compatibility
			lp: rankedTftData ? rankedTftData.leaguePoints : 0, // Add lp alias for LiveGame
			leaguePoints: rankedTftData ? rankedTftData.leaguePoints : 0,
			wins: rankedTftData ? rankedTftData.wins : 0,
			losses: rankedTftData ? rankedTftData.losses : 0,
			gameName: accountData.gameName,
			tagLine: accountData.tagLine,
			summonerLevel: summonerData.summonerLevel,
			profileIconId: summonerData.profileIconId,
		};
	} catch (error) {
		console.error("TFT Additional Data Error:", error.message);
		return {
			queueType: "RANKED_TFT",
			tier: "UNRANKED",
			rank: "Unranked", // Use consistent format
			lp: 0, // Add lp alias for LiveGame
			leaguePoints: 0,
			wins: 0,
			losses: 0,
			gameName: "",
			tagLine: "",
			summonerLevel: 0,
			profileIconId: null,
		};
	}
};

/**
 * Fetch TFT summoner details to get the PUUID and profile icon.
 */
export const fetchTFTSummonerPUUID = async (encryptedPUUID, region) => {
	const response = await fetch(
		`https://${region}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${encryptedPUUID}`,
		{ headers: { "X-Riot-Token": TFT_API_KEY } }
	);
	if (!response.ok) {
		throw new Error(`Failed to fetch PUUID for TFT puuid: ${encryptedPUUID}`);
	}
	const data = await response.json();
	return { puuid: data.puuid, profileIconId: data.profileIconId };
};



/**
 * Fetch TFT live game data.
 */
export const fetchTFTLiveGameData = async (puuid, region) => {
	const normalizedRegion = region.toUpperCase();

	const liveGameResponse = await fetch(
		`https://${normalizedRegion}.api.riotgames.com/lol/spectator/tft/v5/active-games/by-puuid/${puuid}`,
		{ headers: { "X-Riot-Token": TFT_API_KEY } }
	);
	if (!liveGameResponse.ok) return null;

	const liveGameData = await liveGameResponse.json();
	// Enrich each participant with additional TFT-specific data concurrently.
	liveGameData.participants = await Promise.all(
		liveGameData.participants.map(async (participant) => {
			const additionalData = await fetchTFTAdditionalGameData(
				participant.puuid,
				region
			);
			return { ...participant, ...additionalData };
		})
	);
	return liveGameData;
};

/**
 * Fetch additional data for TFT live game enrichment using PUUID endpoints.
 * Similar to fetchTFTAdditionalData but specific for live game context
 */
export const fetchTFTAdditionalGameData = async (puuid, region) => {
	try {
		// Same region->platform mapping to resolve the correct routing cluster
		const regionToPlatform = {
			BR1: "americas",
			EUN1: "europe",
			EUW1: "europe",
			JP1: "asia",
			KR: "asia",
			LA1: "americas",
			LA2: "americas",
			ME1: "europe",
			NA1: "americas",
			OC1: "americas",
			RU: "europe",
			SG2: "sea",
			TR1: "europe",
			TW2: "sea",
			VN2: "sea",
		};
		const platform = regionToPlatform[region?.toUpperCase()] || "americas";

		const [rankedResponse, accountResponse, summonerResponse] =
			await Promise.all([
				// Updated to use by-puuid endpoint
				fetch(
					`https://${region}.api.riotgames.com/tft/league/v1/by-puuid/${puuid}`,
					{ headers: { "X-Riot-Token": TFT_API_KEY } }
				),
				fetch(
					`https://${platform}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
					{ headers: { "X-Riot-Token": TFT_API_KEY } }
				),
				fetch(
					`https://${region}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${puuid}`,
					{ headers: { "X-Riot-Token": TFT_API_KEY } }
				),
			]);

		// Handle errors gracefully for live game data
		const rankedData = rankedResponse.ok ? await rankedResponse.json() : [];

		if (!accountResponse.ok || !summonerResponse.ok) {
			throw new Error("Failed to fetch essential TFT live game data");
		}

		const [accountData, summonerData] = await Promise.all([
			accountResponse.json(),
			summonerResponse.json(),
		]);

		// TFT ranked data structure is different from League
		const rankedTftData = rankedData.find?.(
			(queue) => queue.queueType === "RANKED_TFT"
		);

		// Combine tier and rank into a single field for LiveGame component compatibility
		const combinedRank = rankedTftData
			? `${rankedTftData.tier} ${rankedTftData.rank}`.trim()
			: "Unranked";

		return {
			queueType: "RANKED_TFT", // Add queueType for frontend compatibility
			tier: rankedTftData ? rankedTftData.tier : "UNRANKED",
			rank: combinedRank, // Combined format like "GOLD IV" for LiveGame compatibility
			lp: rankedTftData ? rankedTftData.leaguePoints : 0, // Add lp alias for LiveGame
			leaguePoints: rankedTftData ? rankedTftData.leaguePoints : 0,
			wins: rankedTftData ? rankedTftData.wins : 0,
			losses: rankedTftData ? rankedTftData.losses : 0,
			gameName: accountData.gameName,
			tagLine: accountData.tagLine,
			summonerLevel: summonerData.summonerLevel,
			profileIconId: summonerData.profileIconId,
		};
	} catch (error) {
		console.error("TFT Live Game Data Error:", error.message);
		return {
			queueType: "RANKED_TFT",
			tier: "UNRANKED",
			rank: "Unranked", // Use consistent format
			lp: 0, // Add lp alias for LiveGame
			leaguePoints: 0,
			wins: 0,
			losses: 0,
			gameName: "",
			tagLine: "",
			summonerLevel: 0,
			profileIconId: null,
		};
	}
};
