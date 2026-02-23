import {
	fetchSummonerData,
	fetchAccountDataByPUUID,
} from "../league/leagueApi.js";
import { mapWithConcurrency } from "./async.js";
import {
	DEFAULT_DIVISION,
	DEFAULT_TIER,
	LOL_DEFAULT_QUEUE,
} from "./constants.js";

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const ENRICH_CONCURRENCY = Number(process.env.LOL_LEADERBOARD_ENRICH_CONCURRENCY || 8);

function createHttpError(status, message) {
	const error = new Error(message);
	error.status = status;
	return error;
}

async function fetchWithRetry(fn, args, retries = 1) {
	try {
		return await fn(...args);
	} catch (error) {
		if (retries > 0) {
			return fetchWithRetry(fn, args, retries - 1);
		}
		throw error;
	}
}

export function normalizeLeagueLeaderboardParams(input = {}) {
	return {
		queue: (input.queue || LOL_DEFAULT_QUEUE).toString().toUpperCase(),
		tier: (input.tier || DEFAULT_TIER).toString().toUpperCase(),
		division: (input.division || DEFAULT_DIVISION).toString().toUpperCase(),
		region: (input.region || "EUW1").toString().toLowerCase(),
	};
}

export async function fetchLeagueLeaderboardFromRiot(input = {}) {
	if (!RIOT_API_KEY) {
		throw createHttpError(500, "RIOT_API_KEY is not configured.");
	}

	const { queue, tier, division, region } = normalizeLeagueLeaderboardParams(input);
	const apiUrl = `https://${region}.api.riotgames.com/lol/league-exp/v4/entries/${queue}/${tier}/${division}?page=1&limit=200`;

	const response = await fetch(apiUrl, {
		headers: { "X-Riot-Token": RIOT_API_KEY },
		cache: "no-store",
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw createHttpError(
			response.status,
			`Riot API Error (${response.status}): ${errorBody || response.statusText}`
		);
	}

	let leaderboardData = [];
	try {
		leaderboardData = await response.json();
	} catch {
		return [];
	}

	if (!Array.isArray(leaderboardData) || leaderboardData.length === 0) {
		return [];
	}

	const detailedData = await mapWithConcurrency(
		leaderboardData,
		ENRICH_CONCURRENCY,
		async (entry) => {
			try {
				const [accountData, summonerData] = await Promise.all([
					fetchWithRetry(fetchAccountDataByPUUID, [entry.puuid]),
					fetchWithRetry(fetchSummonerData, [entry.puuid, region]),
				]);

				return {
					...entry,
					profileData: {
						gameName: accountData.gameName,
						tagLine: accountData.tagLine,
						profileIconId: summonerData.profileIconId,
					},
				};
			} catch {
				return {
					...entry,
					profileData: {
						gameName: "Unknown",
						tagLine: "Unknown",
						profileIconId: null,
					},
				};
			}
		}
	);

	return detailedData.filter(Boolean);
}
