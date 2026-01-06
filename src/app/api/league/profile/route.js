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
		const normalizedGameName = gameName.trim();
		const normalizedTagLine = tagLine.trim();
		const platform = regionToPlatform[normalizedRegion];
		const matchPlatform = regionToMatchPlatform[normalizedRegion];

		if (!platform || !matchPlatform) {
			return new Response(
				JSON.stringify({ error: `Invalid region: ${region}` }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// DB-first: try to resolve Riot account by name/tag/region and return cached data if available
		let { data: riotAccountByName, error: accountLookupError } = await supabase
			.from("riot_accounts")
			.select("*")
			.ilike("region", normalizedRegion)
			.ilike("gamename", normalizedGameName)
			.ilike("tagline", normalizedTagLine)
			.maybeSingle();
		if (accountLookupError) throw accountLookupError;
		
		if (riotAccountByName && !forceUpdate) {
			let { data: storedLeagueDataA, error: leagueDataErrorA } = await supabase
				.from("league_data")
				.select("*")
				.eq("riot_account_id", riotAccountByName.id)
				.maybeSingle();
			if (leagueDataErrorA) throw leagueDataErrorA;
			
			if (storedLeagueDataA) {
				// Fetch matchIds from DB
				let { data: userMatchObjectsA, error: matchesErrorA } = await supabase
					.from("league_matches")
					.select("matchid, game_creation")
					.filter(
						"match_data->metadata->participants",
						"cs",
						`"${riotAccountByName.puuid}"`
					)
					.order("game_creation", { ascending: false });
				if (matchesErrorA) throw matchesErrorA;
				
				const matchIds = (userMatchObjectsA || []).map((m) => m.matchid);
				
				// Only return cached data if we have matches
				// If matches are empty, fall through to fetch from Riot
				if (matchIds.length > 0) {
					const responseDataA = {
						profiledata: storedLeagueDataA.profiledata,
						accountdata: storedLeagueDataA.accountdata,
						rankeddata: storedLeagueDataA.rankeddata,
						championmasterydata: storedLeagueDataA.championmasterydata,
						livegamedata: storedLeagueDataA.livegamedata,
						updated_at: storedLeagueDataA.updated_at,
						matchIds: matchIds,
					};
					return new Response(JSON.stringify(responseDataA), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				}
				// If no matches in DB, fall through to fetch from Riot
			}
		}

		// Fetch account data to get the puuid
		const accountData = await fetchAccountData(normalizedGameName, normalizedTagLine, platform);

		if (!accountData?.puuid) {
			return new Response(
				JSON.stringify({ error: "Invalid Riot account data." }),
				{ status: 404, headers: { "Content-Type": "application/json" } }
			);
		}

		// Check and insert the Riot account as needed
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
				const { error: insertError } = await supabaseAdmin
					.from("riot_accounts")
					.insert([insertPayload], { returning: "representation" });

				if (insertError) {
					if (
						insertError.code === "23505" &&
						insertError.message.includes("puuid")
					) {
						// Duplicate - ignore
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
		
		// Second DB-first early return after resolving by PUUID
		if (!forceUpdate) {
			let { data: storedLeagueData, error: leagueDataError } = await supabase
				.from("league_data")
				.select("*")
				.eq("riot_account_id", riotAccount.id)
				.maybeSingle();
			if (leagueDataError) throw leagueDataError;
			
			if (storedLeagueData) {
				let { data: userMatchObjects, error: matchesError } = await supabase
					.from("league_matches")
					.select("matchid, game_creation")
					.filter(
						"match_data->metadata->participants",
						"cs",
						`"${riotAccount.puuid}"`
					)
					.order("game_creation", { ascending: false });
				if (matchesError) throw matchesError;
				
				const matchIds = (userMatchObjects || []).map((m) => m.matchid);
				
				// Only return cached data if we have matches
				// If matches are empty, fall through to fetch from Riot
				if (matchIds.length > 0) {
					const responseData = {
						profiledata: storedLeagueData.profiledata,
						accountdata: storedLeagueData.accountdata,
						rankeddata: storedLeagueData.rankeddata,
						championmasterydata: storedLeagueData.championmasterydata,
						livegamedata: storedLeagueData.livegamedata,
						updated_at: storedLeagueData.updated_at,
						matchIds: matchIds,
					};
					return new Response(JSON.stringify(responseData), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				}
				// If no matches in DB, fall through to fetch from Riot
			}
		}

		const puuid = riotAccount.puuid;

		// Fetch profile data from Riot API
		const summonerData = await fetchSummonerData(puuid, normalizedRegion);
		const [rankedData, matchIds] = await Promise.all([
			fetchRankedData(puuid, normalizedRegion),
			fetchMatchIds(puuid, matchPlatform),
		]);

		// Fetch and cache match details to populate the database
		// This ensures league_matches table has data for future cached requests
		// We fetch matches sequentially in small batches to stay under subrequest limits
		const matchDetailsToCache = [];
		for (const matchId of matchIds) {
			try {
				// Check if already cached
				const { data: cached } = await supabase
					.from("league_matches")
					.select("matchid")
					.eq("matchid", matchId)
					.maybeSingle();
				
				if (!cached) {
					// Fetch from Riot API and cache
					const matchDetail = await fetchMatchDetail(matchId, matchPlatform);
					if (matchDetail) {
						matchDetailsToCache.push({ matchId, matchDetail });
					}
				}
			} catch (err) {
				console.warn(`Failed to fetch match ${matchId}:`, err);
			}
		}

		// Upsert all fetched matches to database
		for (const { matchId, matchDetail } of matchDetailsToCache) {
			try {
				await upsertMatchDetail(matchId, puuid, matchDetail);
			} catch (upsertErr) {
				console.error("Error upserting match detail:", { matchId, upsertErr });
			}
		}

		const [championMasteryData, liveGameData] = await Promise.all([
			fetchChampionMasteryData(puuid, region),
			fetchLiveGameData(puuid, region, platform),
		]);

		// Create JSONB data structure
		const leagueDataObj = {
			riot_account_id: riotAccount.id,
			profiledata: {
				summonerId: summonerData.id,
				accountId: summonerData.accountId,
				puuid: summonerData.puuid,
				summonerLevel: summonerData.summonerLevel,
				profileIconId: summonerData.profileIconId,
			},
			accountdata: {
				gameName: riotAccount.gamename,
				tagLine: riotAccount.tagline,
				puuid: riotAccount.puuid,
				region: riotAccount.region,
			},
			rankeddata: {
				RANKED_SOLO_5x5:
					rankedData.find((r) => r.queueType === "RANKED_SOLO_5x5") || null,
				RANKED_FLEX_SR:
					rankedData.find((r) => r.queueType === "RANKED_FLEX_SR") || null,
			},
			championmasterydata: championMasteryData || null,
			livegamedata: liveGameData || null,
			updated_at: new Date(),
		};

		let { data: leagueRecord, error: leagueError } = await supabaseAdmin
			.from("league_data")
			.upsert(leagueDataObj, {
				onConflict: "riot_account_id",
			})
			.select()
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

		// Fetch all matchIds from database (including newly cached ones)
		let { data: allMatchObjects, error: allMatchesError } = await supabase
			.from("league_matches")
			.select("matchid, game_creation")
			.filter(
				"match_data->metadata->participants",
				"cs",
				`"${riotAccount.puuid}"`
			)
			.order("game_creation", { ascending: false });
		if (allMatchesError) throw allMatchesError;
		
		const allMatchIds = (allMatchObjects || []).map((m) => m.matchid);
		
		const responseData = {
			profiledata: leagueRecord.profiledata,
			accountdata: leagueRecord.accountdata,
			rankeddata: leagueRecord.rankeddata,
			championmasterydata: leagueRecord.championmasterydata,
			livegamedata: leagueRecord.livegamedata,
			updated_at: leagueRecord.updated_at,
			matchIds: allMatchIds,
		};
		return new Response(JSON.stringify(responseData), {
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
