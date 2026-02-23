import { fetchAccountDataByPUUID } from "../league/leagueApi.js";
import { fetchTFTSummonerData } from "../tft/tftApi.js";
import { mapWithConcurrency } from "./async.js";
import {
	DEFAULT_DIVISION,
	DEFAULT_TIER,
	HIGH_TIERS_WITHOUT_DIVISIONS,
} from "./constants.js";

const TFT_API_KEY = process.env.TFT_API_KEY;
const ENRICH_CONCURRENCY = Number(process.env.TFT_LEADERBOARD_ENRICH_CONCURRENCY || 8);

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
			await new Promise((resolve) => setTimeout(resolve, 500));
			return fetchWithRetry(fn, args, retries - 1);
		}
		throw error;
	}
}

export function normalizeTftLeaderboardParams(input = {}) {
	return {
		tier: (input.tier || DEFAULT_TIER).toString().toUpperCase(),
		division: (input.division || DEFAULT_DIVISION).toString().toUpperCase(),
		region: (input.region || "EUW1").toString().toLowerCase(),
	};
}

function buildTftApiUrl({ tier, division, region }) {
	if (HIGH_TIERS_WITHOUT_DIVISIONS.has(tier)) {
		return `https://${region}.api.riotgames.com/tft/league/v1/${tier.toLowerCase()}`;
	}

	const validDivision = ["I", "II", "III", "IV"].includes(division)
		? division
		: "I";
	return `https://${region}.api.riotgames.com/tft/league/v1/entries/${tier}/${validDivision}?page=1`;
}

export async function fetchTftLeaderboardFromRiot(input = {}) {
	if (!TFT_API_KEY) {
		throw createHttpError(500, "TFT_API_KEY is not configured.");
	}

	const params = normalizeTftLeaderboardParams(input);
	const apiUrl = buildTftApiUrl(params);

	const response = await fetch(apiUrl, {
		headers: { "X-Riot-Token": TFT_API_KEY },
		cache: "no-store",
	});

	if (!response.ok) {
		if (response.status === 429) {
			throw createHttpError(429, "Rate limit exceeded. Please try again later.");
		}
		throw createHttpError(
			response.status,
			`Failed to fetch TFT leaderboard data from Riot API (${response.status})`
		);
	}

	const rawData = await response.json();
	let leaderboardData = [];

	if (HIGH_TIERS_WITHOUT_DIVISIONS.has(params.tier)) {
		leaderboardData = rawData?.entries || [];
	} else {
		leaderboardData = Array.isArray(rawData) ? rawData : [];
	}

	if (!leaderboardData.length) {
		return [];
	}

	leaderboardData.sort((a, b) => b.leaguePoints - a.leaguePoints);
	const topEntries = leaderboardData.slice(0, 200).filter((entry) => entry?.puuid);

	const enrichedData = await mapWithConcurrency(
		topEntries,
		ENRICH_CONCURRENCY,
		async (entry) => {
			try {
				const [accountData, summonerData] = await Promise.all([
					fetchWithRetry(fetchAccountDataByPUUID, [entry.puuid]),
					fetchWithRetry(fetchTFTSummonerData, [entry.puuid, params.region]),
				]);

				return {
					...entry,
					profileData: {
						gameName: accountData?.gameName || entry.summonerName || "Unknown",
						tagLine: accountData?.tagLine || "Unknown",
						profileIconId: summonerData?.profileIconId || null,
					},
				};
			} catch {
				return {
					...entry,
					profileData: {
						gameName: entry.summonerName || "Unknown",
						tagLine: "error",
						profileIconId: null,
					},
				};
			}
		}
	);

	return enrichedData.filter(Boolean);
}
