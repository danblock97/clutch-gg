import { NextResponse } from "next/server";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

async function fetchPUUID(summonerId, region) {
	try {
		const response = await fetch(
			`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}`,
			{
				headers: {
					"X-Riot-Token": RIOT_API_KEY,
				},
			}
		);

		if (!response.ok) {
			console.error(
				`Failed to fetch PUUID for summonerId: ${summonerId}, status: ${response.status}`
			);
			throw new Error("Failed to fetch PUUID");
		}

		const data = await response.json();
		return {
			puuid: data.puuid,
			profileIconId: data.profileIconId,
		};
	} catch (error) {
		console.error(`Error fetching PUUID: ${error.message}`);
		throw error;
	}
}

async function fetchAccountData(puuid) {
	try {
		const response = await fetch(
			`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
			{
				headers: {
					"X-Riot-Token": RIOT_API_KEY,
				},
			}
		);

		if (!response.ok) {
			console.error(
				`Failed to fetch account data for PUUID: ${puuid}, status: ${response.status}`
			);
			throw new Error("Failed to fetch account data");
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error(`Error fetching account data: ${error.message}`);
		throw error;
	}
}

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const queue = searchParams.get("queue") || "RANKED_SOLO_5x5";
	const tier = searchParams.get("tier") || "CHALLENGER";
	const division = searchParams.get("division") || "I";
	const region = searchParams.get("region") || "euw1"; // Ensure correct region, e.g. "EUW1"

	try {
		// 1) Fetch from Riot's League-Exp endpoint
		const response = await fetch(
			`https://${region}.api.riotgames.com/lol/league-exp/v4/entries/${queue}/${tier}/${division}?page=1`,
			{
				headers: {
					"X-Riot-Token": RIOT_API_KEY,
				},
			}
		);

		// 2) If response is NOT OK, log it & return an empty array with 200
		//    so your client sees "no players" rather than 500 error
		if (!response.ok) {
			console.error(
				`Riot API returned non-OK status: ${response.status} ${response.statusText}`
			);
			return NextResponse.json([], { status: 200 });
		}

		// 3) Safely parse the JSON
		let leaderboardData = [];
		try {
			leaderboardData = await response.json();
		} catch (parseErr) {
			console.error("Failed to parse Riot API JSON:", parseErr);
			// Return empty array with 200 if JSON parse fails
			return NextResponse.json([], { status: 200 });
		}

		// 4) If it's not an array or is empty => just return []
		if (!Array.isArray(leaderboardData) || leaderboardData.length === 0) {
			console.log("Rank is empty or data not an array, returning []");
			return NextResponse.json([]);
		}

		// 5) We have an array of entries; enrich with profile data
		const detailedDataPromises = leaderboardData.map(async (entry) => {
			try {
				const { puuid, profileIconId } = await fetchPUUID(
					entry.summonerId,
					region
				);
				const accountData = await fetchAccountData(puuid);

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
					`Error fetching profile data for summonerId: ${entry.summonerId}, error: ${error.message}`
				);
				return {
					...entry,
					profileData: {
						gameName: "Unknown",
						tagLine: "Unknown",
						profileIconId: null,
					},
				};
			}
		});

		const detailedData = await Promise.all(detailedDataPromises);
		return NextResponse.json(detailedData);
	} catch (error) {
		console.error("Error in leaderboard API route:", error);
		// If truly cannot proceed, return empty array with 200
		return NextResponse.json([], { status: 200 });
	}
}
