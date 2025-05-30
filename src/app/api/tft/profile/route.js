import { supabase, supabaseAdmin } from "@/lib/supabase";
import { fetchAccountData } from "@/lib/riot/riotAccountApi";
import {
	fetchTFTSummonerData,
	fetchTFTRankedData,
	fetchTFTMatchIds,
	fetchTFTMatchDetail,
	upsertTFTMatchDetail,
	fetchTFTLiveGameData,
} from "@/lib/tft/tftApi";

// TFT uses the same region to platform mapping as League
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
		// Normalize region to uppercase to ensure API compatibility
		const normalizedRegion = region.toUpperCase();
		// Get the corresponding platform for the region
		const platform = regionToPlatform[normalizedRegion];

		if (!platform) {
			return new Response(
				JSON.stringify({ error: `Invalid region: ${region}` }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// Fetch account data to get the puuid.
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
					// If the error is a duplicate key violation, it means someone else inserted the record
					// in the time between our check and insert. So we should just fetch the existing record.
					if (
						insertError.code === "23505" &&
						insertError.message.includes("puuid")
					) {
						// Race condition detected, fetching existing record instead
					} else {
						// For other errors, we should still throw
						throw insertError;
					}
				}
			} catch (error) {
				// We'll continue to fetch the account even if insertion failed due to duplication
			}

			// In either case (successful insert or duplicate key), fetch the account
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

		// Remove match_participants select and logic in forceUpdate === false block
		if (!forceUpdate) {
			let { data: storedGameData, error: gameDataError } = await supabase
				.from("game_data")
				.select("*")
				.eq("riot_account_id", riotAccount.id)
				.eq("game_type", "tft")
				.maybeSingle();
			if (gameDataError) throw gameDataError; // Fetch recent matches from match_details - we'll filter client-side for now
			// TODO: Optimize with proper JSON query when we have more matches in DB
			let { data: matchDetailsRows, error: matchDetailsError } = await supabase
				.from("match_details")
				.select("*")
				.order("matchid", { ascending: false })
				.limit(200); // Get more matches to ensure we find enough for the user
			if (matchDetailsError) throw matchDetailsError;

			// Filter matches where user participated and limit to 50
			const userMatchDetails = (matchDetailsRows || [])
				.map((md) => md.details)
				.filter(
					(match) =>
						match &&
						match.metadata &&
						match.metadata.participants &&
						match.metadata.participants.includes(riotAccount.puuid)
				)
				.slice(0, 50); // Limit to 50 matches for the user
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

		// Fetch summoner data once and use it for ranked data.
		const summonerData = await fetchTFTSummonerData(puuid, region);
		const [rankedData, matchIds, liveGameData] = await Promise.all([
			fetchTFTRankedData(summonerData.id, region),
			fetchTFTMatchIds(puuid, platform),
			fetchTFTLiveGameData(puuid, region, platform),
		]);

		// Fetch match details concurrently and upsert them
		const matchDetails = await Promise.all(
			matchIds.map(async (matchId) => {
				const matchDetail = await fetchTFTMatchDetail(matchId, platform);
				if (matchDetail) {
					try {
						await upsertTFTMatchDetail(
							matchId,
							summonerData.puuid,
							matchDetail
						);
					} catch (upsertErr) {
						console.error("Error upserting TFT match detail:", {
							matchId,
							upsertErr,
						});
					}
				}
				return matchDetail;
			})
		);
		console.log("[TFT] matchIds:", matchIds);
		console.log("[TFT] matchDetails:", matchDetails);
		if (!matchDetails || matchDetails.length === 0) {
			console.warn("[TFT] No match details found for user", riotAccount.id);
		}
		// Filter matchDetails for those where the user's puuid is a participant
		const allMatchDetails = matchDetails.filter(
			(md) =>
				md &&
				md.metadata &&
				md.metadata.participants &&
				md.metadata.participants.includes(summonerData.puuid)
		);

		const tftDataObj = {
			profiledata: summonerData,
			accountdata: {
				gameName: riotAccount.gamename,
				tagLine: riotAccount.tagline,
			},
			rankeddata: rankedData,
			livegamedata: liveGameData,
			updated_at: new Date(),
			game_type: "tft",
		};

		// Use supabaseAdmin for write operations
		let { data: tftRecord, error: tftError } = await supabaseAdmin
			.from("game_data")
			.upsert(
				{
					riot_account_id: riotAccount.id,
					...tftDataObj,
				},
				{
					onConflict: ["riot_account_id", "game_type"],
					returning: "representation",
				}
			)
			.single();
		if (tftError) throw tftError;

		if (!tftRecord) {
			const { data: selectedGameData, error: selectError } = await supabase
				.from("game_data")
				.select("*")
				.eq("riot_account_id", riotAccount.id)
				.eq("game_type", "tft")
				.maybeSingle();
			if (selectError) throw selectError;
			tftRecord = selectedGameData;
		}
		return new Response(
			JSON.stringify({ ...tftRecord, matchdetails: allMatchDetails }),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		// Error fetching TFT profile data
		console.error("TFT Profile API Error:", error);

		// Provide detailed error information
		let errorMessage = error.message || "Unknown error occurred";
		let errorDetails = { error: errorMessage };

		// Include additional error details if available (e.g., from Supabase)
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

		return new Response(JSON.stringify(errorDetails), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

export async function POST(req) {
	try {
		// First validate the API key for security
		const apiKey = req.headers.get("x-api-key");

		// Use the same environment variable as the League implementation
		const validApiKey = process.env.NEXT_PUBLIC_UPDATE_API_KEY;

		if (apiKey !== validApiKey) {
			return new Response(
				JSON.stringify({ error: "Unauthorized: Invalid API key" }),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		}

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
		// Error updating TFT profile
		console.error("TFT Profile Update API Error:", error);

		// Provide detailed error information
		let errorMessage = error.message || "Unknown error occurred";
		let errorDetails = { error: errorMessage };

		// Include additional error details if available (e.g., from Supabase)
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

		return new Response(JSON.stringify(errorDetails), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
