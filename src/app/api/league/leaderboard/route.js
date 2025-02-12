import { NextResponse } from "next/server";
import {
	fetchSummonerPUUID,
	fetchAccountDataByPUUID,
} from "@/lib/league/leagueApi";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Simple retry helper (1 extra attempt)
async function fetchWithRetry(fn, args, retries = 1) {
	try {
		return await fn(...args);
	} catch (error) {
		if (retries > 0) {
			return await fetchWithRetry(fn, args, retries - 1);
		}
		throw error;
	}
}

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const queue = searchParams.get("queue") || "RANKED_SOLO_5x5";
	const tier = searchParams.get("tier") || "CHALLENGER";
	const division = searchParams.get("division") || "I";
	const region = searchParams.get("region") || "euw1";
	const apiUrl = `https://${region}.api.riotgames.com/lol/league-exp/v4/entries/${queue}/${tier}/${division}?page=1`;

	try {
		const response = await fetch(apiUrl, {
			headers: { "X-Riot-Token": RIOT_API_KEY },
		});

		if (!response.ok) {
			console.error(
				`Riot API returned non-OK status: ${response.status} ${response.statusText}`
			);
			return NextResponse.json([], { status: 200 });
		}

		let leaderboardData = [];
		try {
			leaderboardData = await response.json();
		} catch (parseErr) {
			console.error("Failed to parse Riot API JSON:", parseErr);
			return NextResponse.json([], { status: 200 });
		}

		if (!Array.isArray(leaderboardData) || leaderboardData.length === 0) {
			return NextResponse.json([]);
		}

		const detailedResults = await Promise.allSettled(
			leaderboardData.map(async (entry) => {
				try {
					const { puuid, profileIconId } = await fetchWithRetry(
						fetchSummonerPUUID,
						[entry.summonerId, region],
						1
					);
					const accountData = await fetchWithRetry(
						fetchAccountDataByPUUID,
						[puuid],
						1
					);
					return {
						...entry,
						profileData: {
							gameName: accountData.gameName,
							tagLine: accountData.tagLine,
							profileIconId,
						},
					};
				} catch (error) {
					// Suppressing enrichment error messages, returning fallback data instead.
					return {
						...entry,
						profileData: {
							gameName: "Unknown",
							tagLine: "Unknown",
							profileIconId: null,
						},
					};
				}
			})
		);

		const detailedData = detailedResults.map((result) =>
			result.status === "fulfilled" ? result.value : {}
		);

		return NextResponse.json(detailedData, {
			headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate" },
		});
	} catch (error) {
		console.error("Error in leaderboard API route:", error);
		return NextResponse.json([], { status: 200 });
	}
}
