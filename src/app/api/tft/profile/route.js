import { supabase, supabaseAdmin } from "@/lib/supabase";
import { fetchAccountData } from "@/lib/riot/riotAccountApi";
import {
	fetchTFTMatchIds,
	fetchTFTMatchDetail,
	upsertTFTMatchDetail,
	fetchTFTLiveGameData,
	fetchTFTAdditionalData,
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
		// Normalize inputs to ensure API compatibility and consistent DB lookups
		const normalizedRegion = region.toUpperCase();
		const normalizedGameName = gameName.trim();
		const normalizedTagLine = tagLine.trim();
		// Get the corresponding platform for the region
		const platform = regionToPlatform[normalizedRegion];

		if (!platform) {
			return new Response(
				JSON.stringify({ error: `Invalid region: ${region}` }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// DB-first: try to resolve account and cached TFT data before calling external APIs
		// 1) Attempt to find Riot account by normalized name/tag/region to avoid unnecessary Riot API calls
		let { data: riotAccount, error: accountLookupError } = await supabase
			.from("riot_accounts")
			.select("*")
			.ilike("region", normalizedRegion)
			.ilike("gamename", normalizedGameName)
			.ilike("tagline", normalizedTagLine)
			.maybeSingle();
		if (accountLookupError) throw accountLookupError;

		// 2) If we found an account mapping and we're not forcing an update, return cached TFT data
		if (riotAccount && !forceUpdate) {
			let { data: storedTftData, error: tftLookupError } = await supabase
				.from("tft_data")
				.select("*")
				.eq("riot_account_id", riotAccount.id)
				.maybeSingle();
			if (tftLookupError) throw tftLookupError;
			if (storedTftData) {
				// Fetch all stored matches for this user for a complete frontend experience
				let { data: userMatchObjects, error: matchesError } = await supabase
					.from("tft_matches")
					.select("matchid, match_data, game_datetime, created_at")
					.filter(
						"match_data->metadata->participants",
						"cs",
						`"${riotAccount.puuid}"`
					)
					.order("game_datetime", { ascending: false });
				if (matchesError) throw matchesError;
				const userMatchDetails = (userMatchObjects || []).map((match) => match.match_data);
				const responseData = {
					profiledata: storedTftData.profiledata,
					accountdata: storedTftData.accountdata,
					rankeddata: storedTftData.rankeddata,
					livegamedata: storedTftData.livegamedata,
					updated_at: storedTftData.updated_at,
					game_type: "tft",
					matchdetails: userMatchDetails,
				};
				return new Response(JSON.stringify(responseData), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		// 3) Either account not found by name or forceUpdate=true: resolve account via Riot and ensure DB mapping
		const accountData = await fetchAccountData(normalizedGameName, normalizedTagLine, platform);

		if (!accountData?.puuid) {
			return new Response(
				JSON.stringify({ error: "Invalid Riot account data." }),
				{ status: 404, headers: { "Content-Type": "application/json" } }
			);
		}

		// Check and insert the Riot account as needed by PUUID (handles name changes)
		let { data: puuidAccount, error: puuidCheckError } = await supabase
			.from("riot_accounts")
			.select("*")
			.eq("puuid", accountData.puuid)
			.maybeSingle();
		if (puuidCheckError) throw puuidCheckError;

		if (!puuidAccount) {
			const insertPayload = {
				gamename: normalizedGameName,
				tagline: normalizedTagLine,
				region: normalizedRegion,
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
		}
		// In either case (successful insert or duplicate key), fetch the account by PUUID
		const { data: fetchedAccount, error: fetchError } = await supabase
			.from("riot_accounts")
			.select("*")
			.eq("puuid", accountData.puuid)
			.maybeSingle();
		if (fetchError) throw fetchError;
		riotAccount = fetchedAccount;

		if (!riotAccount?.puuid) {
			throw new Error("Riot account record is missing the puuid.");
		}

		// Second DB-first early return: after resolving via PUUID, if cache exists and not forceUpdate, return it
		if (!forceUpdate) {
			let { data: storedTftData2, error: tftLookupError2 } = await supabase
				.from("tft_data")
				.select("*")
				.eq("riot_account_id", riotAccount.id)
				.maybeSingle();
			if (tftLookupError2) throw tftLookupError2;
			if (storedTftData2) {
				let { data: userMatchObjects2, error: matchesError2 } = await supabase
					.from("tft_matches")
					.select("matchid, match_data, game_datetime, created_at")
					.filter(
						"match_data->metadata->participants",
						"cs",
						`"${riotAccount.puuid}"`
					)
					.order("game_datetime", { ascending: false });
				if (matchesError2) throw matchesError2;
				const userMatchDetails2 = (userMatchObjects2 || []).map((match) => match.match_data);
				const responseData2 = {
					profiledata: storedTftData2.profiledata,
					accountdata: storedTftData2.accountdata,
					rankeddata: storedTftData2.rankeddata,
					livegamedata: storedTftData2.livegamedata,
					updated_at: storedTftData2.updated_at,
					game_type: "tft",
					matchdetails: userMatchDetails2,
				};
				return new Response(JSON.stringify(responseData2), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		// For TFT, proceed to create the profile on initial search when cache is missing

		const puuid = riotAccount.puuid;

		// Fetch additional data, which includes ranked info and summoner data, using the PUUID.
		const additionalData = await fetchTFTAdditionalData(
			puuid,
			normalizedRegion
		);

		const [matchIds, liveGameData] = await Promise.all([
			fetchTFTMatchIds(puuid, platform),
			fetchTFTLiveGameData(puuid, normalizedRegion),
		]);

		const matchDetails = await Promise.all(
			(matchIds || []).map(async (matchId) => {
				const matchDetail = await fetchTFTMatchDetail(matchId, platform);
				if (matchDetail) {
					try {
						await upsertTFTMatchDetail(
							matchId,
							puuid,
							matchDetail,
							riotAccount.id
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

		// Store data using JSONB structure
		const tftDataObj = {
			riot_account_id: riotAccount.id,
			profiledata: {
				// TFT profile data is now derived from additionalData since we no longer fetch summoner data separately
				gameName: additionalData.gameName || riotAccount.gamename,
				tagLine: additionalData.tagLine || riotAccount.tagline,
				summonerLevel: additionalData.summonerLevel || 0,
				profileIconId: additionalData.profileIconId || null,
				puuid: riotAccount.puuid, // Include PUUID for frontend compatibility
			},
			accountdata: {
				gameName: riotAccount.gamename,
				tagLine: riotAccount.tagline,
			},
			rankeddata: additionalData, // Don't wrap in array - additionalData is already the rank object
			livegamedata: liveGameData,
			updated_at: new Date(),
		};

		// Use supabaseAdmin for write operations
		let { data: tftRecord, error: tftError } = await supabaseAdmin
			.from("tft_data")
			.upsert(tftDataObj, {
				onConflict: "riot_account_id", // Verify this matches the unique constraint column name
			})
			.select()
			.single();
		if (tftError) throw tftError;
		// After storing new matches, fetch ALL stored matches for this user from database
		const { data: allUserMatchObjects, error: allMatchesError } = await supabase // ensure variable name matches original
			.from("tft_matches")
			.select("matchid, match_data, game_datetime, created_at")
			.filter(
				"match_data->metadata->participants",
				"cs",
				`"${riotAccount.puuid}"`
			)
			.order("game_datetime", { ascending: false });
		if (allMatchesError) throw allMatchesError;
		const allUserMatchDetails = (allUserMatchObjects || []).map(
			(match) => match.match_data
		);

		// Format the response to maintain frontend compatibility using JSONB structure
		const responseData = {
			profiledata: tftRecord.profiledata,
			accountdata: tftRecord.accountdata,
			rankeddata: tftRecord.rankeddata,
			livegamedata: tftRecord.livegamedata,
			updated_at: tftRecord.updated_at,
			game_type: "tft",
			matchdetails: allUserMatchDetails,
		};

		return new Response(JSON.stringify(responseData), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
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
