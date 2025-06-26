import { supabase, supabaseAdmin } from "../supabase.js";

const TFT_API_KEY = process.env.TFT_API_KEY;

/**
 * Fetch TFT summoner data using an encrypted PUUID.
 */
export const fetchTFTSummonerData = async (encryptedPUUID, region) => {
	const summonerResponse = await fetch(
		`https://${region}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${encryptedPUUID}`,
		{ headers: { "X-Riot-Token": TFT_API_KEY } }
	);
	if (!summonerResponse.ok) {
		throw new Error("Failed to fetch TFT summoner data");
	}
	return summonerResponse.json();
};

/**
 * Fetch TFT ranked data by summoner ID.
 * Note: TFT API doesn't have a by-puuid endpoint for ranked entries yet.
 * We need to get the summoner ID first, then fetch ranked data.
 */
export const fetchTFTRankedData = async (puuid, region) => {
	// First get the summoner data to get the summoner ID
	const summonerData = await fetchTFTSummonerData(puuid, region);
	if (!summonerData?.id) {
		// If summonerData or its ID is not available, return empty array.
		return [];
	}

	const rankedResponse = await fetch(
		`https://${region}.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerData.id}`,
		{ headers: { "X-Riot-Token": TFT_API_KEY } }
	);
	if (!rankedResponse.ok) {
		if (rankedResponse.status === 404) {
			return []; // Player is unranked or has no ranked data.
		}
		const errorBody = await rankedResponse.text();
		console.error(
			`Failed to fetch TFT ranked data for summonerId ${summonerData.id} in region ${region}. Status: ${rankedResponse.status}, Body: ${errorBody}`
		);
		throw new Error("Failed to fetch TFT ranked data");
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
	const matchDetailResponse = await fetch(
		`https://${platform}.api.riotgames.com/tft/match/v1/matches/${matchId}`,
		{ headers: { "X-Riot-Token": TFT_API_KEY } }
	);
	if (!matchDetailResponse.ok) {
		return null;
	}
	return matchDetailResponse.json();
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
 * Fetch additional data for TFT player enrichment.
 */
export const fetchTFTAdditionalData = async (summonerId, puuid, region) => {
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
				// Ranked TFT uses the summoner-id, *not* the puuid
				fetch(
					`https://${region}.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerId}`,
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

		if (!rankedResponse.ok || !accountResponse.ok || !summonerResponse.ok) {
			throw new Error("Failed to fetch additional TFT data");
		}

		const [rankedData, accountData, summonerData] = await Promise.all([
			rankedResponse.json(),
			accountResponse.json(),
			summonerResponse.json(),
		]);

		// TFT ranked data structure is different from League
		const rankedTftData = rankedData.find(
			(queue) => queue.queueType === "RANKED_TFT"
		);

		return {
			rank: rankedTftData
				? `${rankedTftData.tier} ${rankedTftData.rank}`
				: "Unranked",
			lp: rankedTftData ? rankedTftData.leaguePoints : 0,
			wins: rankedTftData ? rankedTftData.wins : 0,
			losses: rankedTftData ? rankedTftData.losses : 0,
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
export const fetchTFTLiveGameData = async (puuid, region, platform) => {
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
				participant.summonerId,
				participant.puuid,
				region
			);
			return { ...participant, ...additionalData };
		})
	);
	return liveGameData;
};

/**
 * Fetch additional data for TFT live game enrichment.
 * Similar to fetchTFTAdditionalData but specific for live game context
 */
export const fetchTFTAdditionalGameData = async (summonerId, puuid, region) => {
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
				fetch(
					`https://${region}.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerId}`,
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

		if (!rankedResponse.ok || !accountResponse.ok || !summonerResponse.ok) {
			throw new Error("Failed to fetch additional TFT data");
		}

		const [rankedData, accountData, summonerData] = await Promise.all([
			rankedResponse.json(),
			accountResponse.json(),
			summonerResponse.json(),
		]);

		// TFT ranked data structure is different from League
		const rankedTftData = rankedData.find(
			(queue) => queue.queueType === "RANKED_TFT"
		);

		return {
			rank: rankedTftData
				? `${rankedTftData.tier} ${rankedTftData.rank}`
				: "Unranked",
			lp: rankedTftData ? rankedTftData.leaguePoints : 0,
			wins: rankedTftData ? rankedTftData.wins : 0,
			losses: rankedTftData ? rankedTftData.losses : 0,
			gameName: accountData.gameName,
			tagLine: accountData.tagLine,
			summonerLevel: summonerData.summonerLevel,
			profileIconId: summonerData.profileIconId,
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
			profileIconId: null,
		};
	}
};
