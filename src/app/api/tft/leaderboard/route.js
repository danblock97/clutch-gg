import { NextResponse } from "next/server";
import { fetchTFTSummonerPUUID } from "@/lib/tft/tftApi";
import { fetchAccountDataByPUUID } from "@/lib/league/leagueApi";

const TFT_API_KEY = process.env.TFT_API_KEY;

async function fetchWithRetry(fn, args, retries = 1) {
	try {
		return await fn(...args);
	} catch (error) {
		if (retries > 0) {
			console.warn(`Retrying ${fn.name} after error: ${error.message}`);
			await new Promise((resolve) => setTimeout(resolve, 500));
			return fetchWithRetry(fn, args, retries - 1);
		}
		console.error(`Failed ${fn.name} after multiple retries:`, error);
		throw error;
	}
}

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const tier = searchParams.get("tier") || "CHALLENGER";
	const division = searchParams.get("division") || "I";
	const region = searchParams.get("region") || "euw1";

	if (!TFT_API_KEY) {
		return NextResponse.json(
			{ error: "TFT API key is not configured." },
			{ status: 500 }
		);
	}

	let apiUrl;
	const upperTier = tier.toUpperCase();
	if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(upperTier)) {
		apiUrl = `https://${region}.api.riotgames.com/tft/league/v1/${tier.toLowerCase()}`;
	} else {
		const validDivision = ["I", "II", "III", "IV"].includes(
			division.toUpperCase()
		)
			? division.toUpperCase()
			: "I";
		apiUrl = `https://${region}.api.riotgames.com/tft/league/v1/entries/${upperTier}/${validDivision}?page=1`;
	}

	try {
		const response = await fetch(apiUrl, {
			headers: { "X-Riot-Token": TFT_API_KEY },
			next: { revalidate: 300 },
		});

		if (!response.ok) {
			if (response.status === 429) {
				console.error("TFT API rate limit exceeded.");
				return NextResponse.json(
					{ error: "Rate limit exceeded. Please try again later." },
					{ status: 429 }
				);
			}
			console.error(
				`TFT API error: ${response.status} - ${response.statusText}`
			);
			return NextResponse.json(
				{
					error: `Failed to fetch leaderboard data from Riot API (${response.status})`,
				},
				{ status: response.status }
			);
		}

		let rawData = await response.json();
		let leaderboardData = [];

		if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(upperTier)) {
			leaderboardData = rawData.entries || [];
		} else {
			leaderboardData = Array.isArray(rawData) ? rawData : [];
		}

		if (leaderboardData.length === 0) {
			return NextResponse.json([]);
		}

		leaderboardData.sort((a, b) => b.leaguePoints - a.leaguePoints);

		leaderboardData = leaderboardData.slice(0, 100);
		const detailedResults = await Promise.allSettled(
			leaderboardData
				.filter((entry) => entry && entry.summonerId) // Filter out null/undefined entries
				.map(async (entry) => {
					try {
						const { puuid, profileIconId } = await fetchWithRetry(
							fetchTFTSummonerPUUID,
							[entry.summonerId, region]
						);

						// Fetch account data using PUUID (Game Agnostic)
						const accountData = await fetchWithRetry(fetchAccountDataByPUUID, [
							puuid,
						]);

						return {
							...entry,
							profileData: {
								gameName: accountData.gameName,
								tagLine: accountData.tagLine,
								profileIconId: profileIconId,
							},
						};
					} catch (error) {
						console.error(
							`Error enriching data for summonerId ${entry.summonerId}:`,
							error.message
						);
						return {
							...entry,
							profileData: {
								gameName: entry.summonerName || "Unknown",
								tagLine: "error",
								profileIconId: null,
							},
						};
					}
				})
		);
		// Filter out rejected promises and extract values
		const enrichedData = detailedResults
			.filter(
				(result) => result && result.status === "fulfilled" && result.value
			)
			.map((result) => result.value);

		return NextResponse.json(enrichedData);
	} catch (error) {
		console.error("Error fetching or processing TFT leaderboard:", error);

		// Provide detailed error information
		let errorMessage =
			error.message || "Internal server error fetching leaderboard data.";
		let errorDetails = { error: errorMessage };

		// Include additional error details if available
		if (error.code) {
			errorDetails.code = error.code;
		}
		if (error.details) {
			errorDetails.details = error.details;
		}
		if (error.hint) {
			errorDetails.hint = error.hint;
		}

		// Include stack trace in development
		if (process.env.NODE_ENV === "development") {
			errorDetails.stack = error.stack;
		}

		return NextResponse.json(errorDetails, { status: 500 });
	}
}
