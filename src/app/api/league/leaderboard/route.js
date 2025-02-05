import { NextResponse } from "next/server";
import {
	fetchSummonerPUUID,
	fetchAccountDataByPUUID,
} from "@/lib/league/leagueApi";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const queue = searchParams.get("queue") || "RANKED_SOLO_5x5";
	const tier = searchParams.get("tier") || "CHALLENGER";
	const division = searchParams.get("division") || "I";
	const region = searchParams.get("region") || "euw1";

	try {
		const response = await fetch(
			`https://${region}.api.riotgames.com/lol/league-exp/v4/entries/${queue}/${tier}/${division}?page=1`,
			{ headers: { "X-Riot-Token": RIOT_API_KEY } }
		);

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

		const detailedData = await Promise.all(
			leaderboardData.map(async (entry) => {
				try {
					const { puuid, profileIconId } = await fetchSummonerPUUID(
						entry.summonerId,
						region
					);
					const accountData = await fetchAccountDataByPUUID(puuid);
					return {
						...entry,
						profileData: {
							gameName: accountData.gameName,
							tagLine: accountData.tagLine,
							profileIconId,
						},
					};
				} catch (error) {
					console.error(
						`Error enriching entry for summonerId ${entry.summonerId}: ${error.message}`
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
			})
		);

		return NextResponse.json(detailedData);
	} catch (error) {
		console.error("Error in leaderboard API route:", error);
		return NextResponse.json([], { status: 200 });
	}
}
