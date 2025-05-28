import { supabase, supabaseAdmin } from "@/lib/supabase";
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

const regionToMatchPlatform = {
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
	const forceUpdate = searchParams.get("forceUpdate") === "true";

	if (!gameName || !tagLine || !region) {
		return new Response(
			JSON.stringify({ error: "Missing required query parameters" }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}

	try {
		const normalizedRegion = region.toUpperCase();
		const platform = regionToPlatform[normalizedRegion];
		const matchPlatform = regionToMatchPlatform[normalizedRegion];

		if (!platform || !matchPlatform) {
			return new Response(
				JSON.stringify({ error: `Invalid region: ${region}` }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// Fetch account data to get the puuid. Uses 'platform'
		const accountData = await fetchAccountData(gameName, tagLine, platform);

		if (!accountData?.puuid) {
			return new Response(
				JSON.stringify({ error: "Invalid Riot account data." }),
				{ status: 404, headers: { "Content-Type": "application/json" } }
			);
		}

		// Check and insert the Riot account as needed.
		let { data: riotAccount, error: puuidCheckError } = await supabase
			.from("riot_accounts")
			.select("*")
			.eq("puuid", accountData.puuid)
			.maybeSingle();
		if (puuidCheckError) throw puuidCheckError;

		if (!riotAccount) {
			const insertPayload = {
				gamename: gameName,
				tagline: tagLine,
				region,
				puuid: accountData.puuid,
			};
			try {
				// Use supabaseAdmin for write operations when RLS is enabled
				const { error: insertError } = await supabaseAdmin
					.from("riot_accounts")
					.insert([insertPayload], { returning: "representation" });

				if (insertError) {
					if (
						insertError.code === "23505" &&
						insertError.message.includes("puuid")
					) {
					} else {
						throw insertError;
					}
				}
			} catch (error) {}

			const { data: fetchedAccount, error: fetchError } = await supabase
				.from("riot_accounts")
				.select("*")
				.eq("puuid", accountData.puuid)
				.maybeSingle();
			if (fetchError) throw fetchError;
			riotAccount = fetchedAccount;
		}

		if (!riotAccount?.puuid) {
			throw new Error("Riot account record is missing the puuid.");
		}

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

		const puuid = riotAccount.puuid;

		const summonerData = await fetchSummonerData(puuid, region);
		const [rankedData, matchIds] = await Promise.all([
			fetchRankedData(summonerData.id, region),
			fetchMatchIds(puuid, matchPlatform),
		]);

		const matchDetails = await Promise.all(
			matchIds.map(async (matchId) => {
				const matchDetail = await fetchMatchDetail(matchId, matchPlatform);
				if (matchDetail)
					await upsertMatchDetail(matchId, summonerData.puuid, matchDetail);
				return matchDetail;
			})
		);

		const { data: storedMatches, error: storedMatchesError } = await supabase
			.from("league_matches")
			.select("matchid")
			.eq("playerid", summonerData.puuid);

		if (storedMatchesError) throw storedMatchesError;

		const storedMatchIds = storedMatches.map((match) => match.matchid);
		const additionalMatchIds = storedMatchIds.filter(
			(id) => !matchIds.includes(id)
		);

		const additionalMatchDetails = await Promise.all(
			additionalMatchIds.map(async (matchId) => {
				const matchDetail = await fetchMatchDetail(matchId, matchPlatform);
				return matchDetail;
			})
		);

		const allMatchDetails = [
			...matchDetails,
			...additionalMatchDetails.filter(Boolean),
		];

		const [championMasteryData, liveGameData] = await Promise.all([
			fetchChampionMasteryData(puuid, region),
			fetchLiveGameData(summonerData.puuid, region, platform),
		]);

		const leagueDataObj = {
			profiledata: summonerData,
			accountdata: {
				gameName: riotAccount.gamename,
				tagLine: riotAccount.tagline,
			},
			rankeddata: rankedData,
			championmasterydata: championMasteryData,
			matchdata: matchIds,
			matchdetails: allMatchDetails,
			livegamedata: liveGameData,
			updatedat: new Date(),
		};

		let { data: leagueRecord, error: leagueError } = await supabaseAdmin
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

		const { error: updateTsError } = await supabaseAdmin
			.from("riot_accounts")
			.update({ updated_at: new Date() })
			.eq("id", riotAccount.id);

		if (updateTsError) {
			console.error(
				`Failed to update timestamp for riot_account ${riotAccount.id}:`,
				updateTsError
			);
		}

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
		console.error("League Profile API Error:", error);

		let errorMessage = error.message || "Unknown error occurred";
		let errorDetails = { error: errorMessage };

		if (error.code) {
			errorDetails.code = error.code;
		}
		if (error.details) {
			errorDetails.details = error.details;
		}
		if (error.hint) {
			errorDetails.hint = error.hint;
		}

		if (process.env.NODE_ENV === "development") {
			errorDetails.stack = error.stack;
		}

		return new Response(JSON.stringify(errorDetails), {
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
		const url = new URL(req.url);
		url.searchParams.set("gameName", gameName);
		url.searchParams.set("tagLine", tagLine);
		url.searchParams.set("region", region);
		url.searchParams.set("forceUpdate", "true");

		return await GET(
			new Request(url.toString(), { method: "GET", headers: req.headers })
		);
	} catch (error) {
		console.error("League Profile Update API Error:", error);

		let errorMessage = error.message || "Unknown error occurred";
		let errorDetails = { error: errorMessage };

		if (error.code) {
			errorDetails.code = error.code;
		}
		if (error.details) {
			errorDetails.details = error.details;
		}
		if (error.hint) {
			errorDetails.hint = error.hint;
		}

		if (process.env.NODE_ENV === "development") {
			errorDetails.stack = error.stack;
		}

		return new Response(JSON.stringify(errorDetails), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
