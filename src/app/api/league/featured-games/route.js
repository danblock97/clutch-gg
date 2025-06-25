import {
	getFeaturedGames,
	fetchAccountDataByPUUID,
	fetchRankedData,
} from "@/lib/league/leagueApi";
import { NextResponse } from "next/server";

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

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const region = searchParams.get("region");

	if (!region) {
		return NextResponse.json(
			{ error: "Region query parameter is required" },
			{ status: 400 }
		);
	}

	const platform = regionToPlatform[region.toUpperCase()];
	if (!platform) {
		return NextResponse.json(
			{ error: `Invalid region: ${region}` },
			{ status: 400 }
		);
	}

	try {
		const data = await getFeaturedGames(region);

		if (data.gameList && data.gameList.length > 0) {
			for (const game of data.gameList) {
				const participants = game.participants;
				const promises = participants.map((p) =>
					fetchRankedData(p.puuid, region)
				);

				const rankedResults = await Promise.all(promises);

				for (let i = 0; i < participants.length; i++) {
					const [gameName, tagLine] = participants[i].riotId.split("#");
					participants[i].accountData = {
						gameName: gameName,
						tagLine: tagLine,
					};
					participants[i].rankedData = rankedResults[i];
				}
			}
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error(`[API - Featured Games] ${error.message}`);
		return NextResponse.json(
			{ error: "Failed to fetch featured games." },
			{ status: 500 }
		);
	}
}
