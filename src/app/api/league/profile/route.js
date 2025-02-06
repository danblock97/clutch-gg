// src/app/api/league/profile/route.js

import { supabase } from "@/lib/supabase";
import { fetchAccountData } from "@/lib/riot/riotAccountApi";
import {
	fetchSummonerData,
	fetchChampionMasteryData,
	fetchRankedData,
	fetchMatchIds,
	fetchMatchDetail,
	upsertMatchDetail,
	fetchLiveGameData,
} from "@/lib/league/leagueApi";

// Map region to platform (used for certain endpoints)
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
	OC1: "sea",
	RU: "europe",
	SG2: "sea",
	TR1: "europe",
	TW2: "sea",
	VN2: "sea",
};

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");
	const region = searchParams.get("region");
	const forceUpdate = searchParams.get("forceUpdate") === "true"; // new flag

	if (!gameName || !tagLine || !region) {
		return new Response(
			JSON.stringify({ error: "Missing required query parameters" }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}

	try {
		// 1. Look up the Riot account in the riot_accounts table.
		let { data: riotAccount, error: accountError } = await supabase
			.from("riot_accounts")
			.select("*")
			.eq("gamename", gameName)
			.eq("tagline", tagLine)
			.eq("region", region)
			.maybeSingle();

		if (accountError) throw accountError;

		if (!riotAccount) {
			// Not found — fetch account data from Riot’s API.
			const platform = regionToPlatform[region];
			const accountData = await fetchAccountData(gameName, tagLine, platform);
			if (!accountData || !accountData.puuid) {
				throw new Error("Failed to retrieve valid account data from Riot.");
			}

			const insertPayload = {
				gamename: gameName,
				tagline: tagLine,
				region,
				puuid: accountData.puuid,
			};

			const { data: insertedAccount, error: insertError } = await supabase
				.from("riot_accounts")
				.insert([insertPayload], { returning: "representation" })
				.single();
			if (insertError) throw insertError;
			riotAccount = insertedAccount;
		}

		if (!riotAccount || !riotAccount.puuid) {
			console.error("Riot account record from DB:", riotAccount);
			throw new Error("Riot account record is missing the puuid.");
		}

		// 2. If not forcing update, check if we already have League data stored in DB.
		if (!forceUpdate) {
			let { data: storedLeagueData, error: leagueDataError } = await supabase
				.from("league_data")
				.select("*")
				.eq("riot_account_id", riotAccount.id)
				.maybeSingle();
			if (leagueDataError) throw leagueDataError;
			if (storedLeagueData) {
				return new Response(JSON.stringify(storedLeagueData), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		// 3. (No league_data record or forceUpdate true) Fetch fresh data from Riot:
		const platform = regionToPlatform[region];
		const puuid = riotAccount.puuid;
		const summonerData = await fetchSummonerData(puuid, region);
		const rankedData = await fetchRankedData(summonerData.id, region);
		const matchIds = await fetchMatchIds(puuid, platform);

		// Manage match history: delete the oldest match only if there are more than 10.
		const { data: existingMatches, error: existingMatchesError } =
			await supabase
				.from("league_matches")
				.select("*")
				.eq("playerid", summonerData.puuid)
				.order("createdat", { ascending: true });
		if (existingMatchesError) {
			console.error("Error fetching existing matches:", existingMatchesError);
		}
		if (existingMatches && existingMatches.length > 10) {
			const oldestMatchId = existingMatches[0].matchid;
			const { error: deleteError } = await supabase
				.from("league_matches")
				.delete()
				.eq("matchid", oldestMatchId);
			if (deleteError) {
				console.error("Error deleting oldest match:", deleteError);
			}
		}

		const matchDetails = await Promise.all(
			matchIds.map(async (matchId) => {
				const matchDetail = await fetchMatchDetail(matchId, platform);
				if (matchDetail) {
					await upsertMatchDetail(matchId, summonerData.puuid, matchDetail);
				}
				return matchDetail;
			})
		);

		const championMasteryData = await fetchChampionMasteryData(puuid, region);
		const liveGameData = await fetchLiveGameData(
			summonerData.puuid,
			region,
			platform
		);

		const leagueDataObj = {
			profiledata: summonerData,
			accountdata: {
				gameName: riotAccount.gamename,
				tagLine: riotAccount.tagline,
			},
			rankeddata: rankedData,
			championmasterydata: championMasteryData,
			matchdata: matchIds,
			matchdetails: matchDetails,
			livegamedata: liveGameData,
			updatedat: new Date(),
		};

		// 4. Upsert League data for this Riot account.
		let { data: leagueRecord, error: leagueError } = await supabase
			.from("league_data")
			.upsert(
				{
					riot_account_id: riotAccount.id,
					...leagueDataObj,
				},
				{ onConflict: ["riot_account_id"], returning: "representation" }
			)
			.single();
		if (leagueError) throw leagueError;

		if (!leagueRecord) {
			const { data: selectedLeagueData, error: selectError } = await supabase
				.from("league_data")
				.select("*")
				.eq("riot_account_id", riotAccount.id)
				.maybeSingle();
			if (selectError) throw selectError;
			leagueRecord = selectedLeagueData;
		}

		return new Response(JSON.stringify(leagueRecord), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching profile data:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

export async function POST(req) {
	try {
		const { gameName, tagLine, region } = await req.json();
		if (!gameName || !tagLine || !region) {
			return new Response(
				JSON.stringify({ error: "Missing required parameters" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// Create a new URL including the forceUpdate flag
		const url = new URL(req.url);
		url.searchParams.set("gameName", gameName);
		url.searchParams.set("tagLine", tagLine);
		url.searchParams.set("region", region);
		url.searchParams.set("forceUpdate", "true");

		// Call GET with the updated URL
		return await GET(
			new Request(url.toString(), { method: "GET", headers: req.headers })
		);
	} catch (error) {
		console.error("Error updating profile:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
