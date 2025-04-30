import { NextResponse } from "next/server";
import { fetchTFTSummonerPUUID } from "@/lib/tft/tftApi";
import { fetchAccountDataByPUUID } from "@/lib/league/leagueApi"; // Re-use League's account fetcher

const TFT_API_KEY = process.env.TFT_API_KEY;

// Simple retry helper (1 extra attempt)
async function fetchWithRetry(fn, args, retries = 1) {
	try {
		return await fn(...args);
	} catch (error) {
		if (retries > 0) {
			console.warn(`Retrying ${fn.name} after error: ${error.message}`);
			await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retry
			return fetchWithRetry(fn, args, retries - 1);
		}
		console.error(`Failed ${fn.name} after multiple retries:`, error);
		throw error; // Re-throw the error after retries are exhausted
	}
}

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const tier = searchParams.get("tier") || "CHALLENGER";
	const division = searchParams.get("division") || "I";
	const region = searchParams.get("region") || "euw1"; // Default to EUW1

	if (!TFT_API_KEY) {
		return NextResponse.json(
			{ error: "TFT API key is not configured." },
			{ status: 500 }
		);
	}

	// Construct API URL based on tier
	let apiUrl;
	const upperTier = tier.toUpperCase();
	if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(upperTier)) {
		// For higher tiers, use the specific endpoints (no division needed)
		apiUrl = `https://${region}.api.riotgames.com/tft/league/v1/${tier.toLowerCase()}`;
	} else {
		// For lower tiers (IRON to DIAMOND), use the entries endpoint
		// Ensure division is valid (I, II, III, IV) - default to I if invalid
		const validDivision = ["I", "II", "III", "IV"].includes(
			division.toUpperCase()
		)
			? division.toUpperCase()
			: "I";
		apiUrl = `https://${region}.api.riotgames.com/tft/league/v1/entries/${upperTier}/${validDivision}?page=1`; // Assuming page 1 is sufficient for top 100
	}

	try {
		const response = await fetch(apiUrl, {
			headers: { "X-Riot-Token": TFT_API_KEY },
			next: { revalidate: 300 }, // Cache for 5 minutes
		});

		if (!response.ok) {
			// Handle specific rate limit error
			if (response.status === 429) {
				console.error("TFT API rate limit exceeded.");
				return NextResponse.json(
					{ error: "Rate limit exceeded. Please try again later." },
					{ status: 429 }
				);
			}
			// Handle other errors
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

		// Handle the different response formats based on tier
		if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(upperTier)) {
			// Higher tiers return an object with entries array
			leaderboardData = rawData.entries || [];
		} else {
			// Lower tiers return array directly
			leaderboardData = Array.isArray(rawData) ? rawData : [];
		}

		if (leaderboardData.length === 0) {
			return NextResponse.json([]); // Return empty array if no players found
		}

		// Sort by leaguePoints in descending order
		leaderboardData.sort((a, b) => b.leaguePoints - a.leaguePoints);

		// Take only top 100 entries (Riot API might return more for lower tiers)
		leaderboardData = leaderboardData.slice(0, 100);

		// Enrich with profile data (gameName, tagLine, profileIconId)
		const detailedResults = await Promise.allSettled(
			leaderboardData.map(async (entry) => {
				// Need summonerId for TFT PUUID fetch
				if (!entry.summonerId) {
					console.warn("Skipping entry due to missing summonerId:", entry);
					return { ...entry, profileData: null }; // Skip if no summonerId
				}
				try {
					// Fetch PUUID using summonerId (TFT specific)
					const { puuid, profileIconId } = await fetchWithRetry(
						fetchTFTSummonerPUUID,
						[entry.summonerId, region],
						1 // Retry once
					);

					// Fetch account data using PUUID (Game Agnostic)
					const accountData = await fetchWithRetry(
						fetchAccountDataByPUUID,
						[puuid], // Pass PUUID as an array
						1 // Retry once
					);

					return {
						...entry,
						profileData: {
							gameName: accountData.gameName,
							tagLine: accountData.tagLine,
							profileIconId: profileIconId, // Use icon from TFT summoner endpoint
						},
					};
				} catch (error) {
					console.error(
						`Error enriching data for summonerId ${entry.summonerId}:`,
						error.message
					);
					// Return entry with fallback profile data on error
					return {
						...entry,
						profileData: {
							gameName: entry.summonerName || "Unknown", // Fallback to summonerName if available
							tagLine: "error",
							profileIconId: null,
						},
					};
				}
			})
		);

		// Filter out rejected promises and extract values
		const enrichedData = detailedResults
			.filter((result) => result.status === "fulfilled" && result.value)
			.map((result) => result.value);

		return NextResponse.json(enrichedData);
	} catch (error) {
		console.error("Error fetching or processing TFT leaderboard:", error);
		return NextResponse.json(
			{ error: "Internal server error fetching leaderboard data." },
			{ status: 500 }
		);
	}
}
