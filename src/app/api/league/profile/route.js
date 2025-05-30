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

			// Fetch recent League matches for this user using the simplified schema
			let { data: recentMatches, error: matchesError } = await supabase
				.from("league_matches")
				.select("matchid, match_data, game_creation, created_at")
				.order("game_creation", { ascending: false })
				.limit(50);
			if (matchesError) throw matchesError;

			// Filter matches where the user participated
			const userMatchDetails = (recentMatches || [])
				.filter((match) => {
					const participants = match.match_data?.metadata?.participants;
					return participants && participants.includes(riotAccount.puuid);
				})
				.map((match) => match.match_data);

			if (storedLeagueData && userMatchDetails.length > 0) {
				// Check if data is still fresh (less than 5 minutes old)
				const lastUpdated = new Date(storedLeagueData.updated_at);
				const now = new Date();
				const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

				if (lastUpdated > fiveMinutesAgo) {
					// Return cached data with the proper structure
					const responseData = {
						profiledata: storedLeagueData.profiledata,
						accountdata: storedLeagueData.accountdata,
						rankeddata: storedLeagueData.rankeddata,
						championmasterydata: storedLeagueData.championmasterydata,
						livegamedata: storedLeagueData.livegamedata,
						updated_at: storedLeagueData.updated_at,
						matchdetails: userMatchDetails,
					};
					return new Response(JSON.stringify(responseData), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				}
			}
		}

		const puuid = riotAccount.puuid;

		const summonerData = await fetchSummonerData(puuid, region);
		const [rankedData, matchIds] = await Promise.all([
			fetchRankedData(summonerData.id, region),
			fetchMatchIds(puuid, matchPlatform),
		]);

		// Fetch match details concurrently and upsert them
		const matchDetails = await Promise.all(
			matchIds.map(async (matchId) => {
				const matchDetail = await fetchMatchDetail(matchId, matchPlatform);
				if (matchDetail) {
					try {
						await upsertMatchDetail(matchId, summonerData.puuid, matchDetail);
					} catch (upsertErr) {
						console.error("Error upserting League match detail:", {
							matchId,
							upsertErr,
						});
					}
				}
				return matchDetail;
			})
		);
		if (!matchDetails || matchDetails.length === 0) {
			console.warn("[LEAGUE] No match details found for user", riotAccount.id);
		}
		// Filter matchDetails for those where the user's puuid is a participant
		const userMatchDetails = matchDetails.filter(
			(md) =>
				md &&
				md.metadata &&
				md.metadata.participants &&
				md.metadata.participants.includes(summonerData.puuid)
		);
		const allMatchDetails = userMatchDetails;

		const [championMasteryData, liveGameData] = await Promise.all([
			fetchChampionMasteryData(puuid, region),
			fetchLiveGameData(summonerData.puuid, region, platform),
		]);

		// Create JSONB data structure for simplified schema
		const leagueDataObj = {
			riot_account_id: riotAccount.id,

			// Profile data as JSONB
			profiledata: {
				summonerId: summonerData.id,
				accountId: summonerData.accountId,
				puuid: summonerData.puuid,
				summonerLevel: summonerData.summonerLevel,
				profileIconId: summonerData.profileIconId,
			}, // Account data as JSONB
			accountdata: {
				gameName: riotAccount.gamename,
				tagLine: riotAccount.tagline,
				puuid: riotAccount.puuid,
				region: riotAccount.region,
			},

			// Ranked data as JSONB - organize by queue type
			rankeddata: {
				RANKED_SOLO_5x5:
					rankedData.find((r) => r.queueType === "RANKED_SOLO_5x5") || null,
				RANKED_FLEX_SR:
					rankedData.find((r) => r.queueType === "RANKED_FLEX_SR") || null,
			},

			// Champion mastery as JSONB
			championmasterydata: championMasteryData || null,

			// Live game data as JSONB
			livegamedata: liveGameData || null,

			updated_at: new Date(),
		};

		let { data: leagueRecord, error: leagueError } = await supabaseAdmin
			.from("league_data")
			.upsert(leagueDataObj, {
				onConflict: ["riot_account_id"],
				returning: "representation",
			})
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
		// Return data in the simplified JSONB format
		const responseData = {
			profiledata: leagueRecord.profiledata,
			accountdata: leagueRecord.accountdata,
			rankeddata: leagueRecord.rankeddata,
			championmasterydata: leagueRecord.championmasterydata,
			livegamedata: leagueRecord.livegamedata,
			updated_at: leagueRecord.updated_at,
			matchdetails: allMatchDetails,
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
