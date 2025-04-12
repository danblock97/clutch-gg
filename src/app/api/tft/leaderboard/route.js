import { NextResponse } from "next/server";
import { fetchTFTSummonerPUUID } from "@/lib/tft/tftApi";
import { fetchAccountDataByPUUID } from "@/lib/league/leagueApi";

const TFT_API_KEY = process.env.TFT_API_KEY;

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
	const tier = searchParams.get("tier") || "CHALLENGER";
	const division = searchParams.get("division") || "I";
	const region = searchParams.get("region") || "euw1";

	// Construct API URL based on tier
	let apiUrl;
	if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier.toUpperCase())) {
		// For higher tiers, use the specific endpoints
		apiUrl = `https://${region}.api.riotgames.com/tft/league/v1/${tier.toLowerCase()}`;
	} else {
		// For lower tiers (IRON to DIAMOND), use the entries endpoint
		apiUrl = `https://${region}.api.riotgames.com/tft/league/v1/entries/${tier}/${division}?page=1`;
	}

	try {
		const response = await fetch(apiUrl, {
			headers: { "X-Riot-Token": TFT_API_KEY },
		});

		if (!response.ok) {
			console.error(
				`TFT API returned non-OK status: ${response.status} ${response.statusText}`
			);
			return NextResponse.json([], { status: 200 });
		}

		let rawData = await response.json();
		let leaderboardData = [];

		// Handle the different response formats based on tier
		if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier.toUpperCase())) {
			// Higher tiers return an object with entries array
			leaderboardData = rawData.entries || [];
		} else {
			// Lower tiers return array directly
			leaderboardData = Array.isArray(rawData) ? rawData : [];
		}

		if (leaderboardData.length === 0) {
			return NextResponse.json([]);
		}

		// Sort by leaguePoints in descending order
		leaderboardData.sort((a, b) => b.leaguePoints - a.leaguePoints);

		// Take only top 100 entries
		leaderboardData = leaderboardData.slice(0, 100);

		const detailedResults = await Promise.allSettled(
			leaderboardData.map(async (entry) => {
				try {
					const { puuid, profileIconId } = await fetchWithRetry(
						fetchTFTSummonerPUUID,
						[entry.summonerId, region],
						1
					);
					// Use the shared account data endpoint since it's game-agnostic
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
		console.error("Error in TFT leaderboard API route:", error);
		return NextResponse.json([], { status: 200 });
	}
}
