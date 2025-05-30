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
			let { data: storedGameData, error: gameDataError } = await supabase
				.from("game_data")
				.select("*")
				.eq("riot_account_id", riotAccount.id)
				.eq("game_type", "league")
				.maybeSingle();
			if (gameDataError) throw gameDataError;

			// Fetch recent matches for this user from match_details using JSON filtering
			let { data: matchDetailsRows, error: matchDetailsError } = await supabase
				.from("match_details")
				.select("*")
				.contains("details->metadata->participants", [riotAccount.puuid])
				.order("matchid", { ascending: false })
				.limit(50); // Get matches where user participated
			if (matchDetailsError) throw matchDetailsError;

			// Map to match JSON
			const userMatchDetails = (matchDetailsRows || []).map((md) => md.details);
			if (storedGameData) {
				return new Response(
					JSON.stringify({ ...storedGameData, matchdetails: userMatchDetails }),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					}
				);
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
		console.log("[LEAGUE] matchIds:", matchIds);
		console.log("[LEAGUE] matchDetails:", matchDetails);
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

		const leagueDataObj = {
			profiledata: summonerData,
			accountdata: {
				gameName: riotAccount.gamename,
				tagLine: riotAccount.tagline,
			},
			rankeddata: rankedData,
			championmasterydata: championMasteryData,
			livegamedata: liveGameData,
			updated_at: new Date(),
			game_type: "league",
		};
		let { data: leagueRecord, error: leagueError } = await supabaseAdmin
			.from("game_data")
			.upsert(
				{
					riot_account_id: riotAccount.id,
					...leagueDataObj,
				},
				{
					onConflict: ["riot_account_id", "game_type"],
					returning: "representation",
				}
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
			const { data: selectedGameData, error: selectError } = await supabase
				.from("game_data")
				.select("*")
				.eq("riot_account_id", riotAccount.id)
				.eq("game_type", "league")
				.maybeSingle();
			if (selectError) throw selectError;
			leagueRecord = selectedGameData;
		}

		return new Response(
			JSON.stringify({ ...leagueRecord, matchdetails: allMatchDetails }),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
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
