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

		// Return stored TFT data if forceUpdate isn't requested.
		if (!forceUpdate) {
			let { data: storedTFTData, error: tftDataError } = await supabase
				.from("tft_data")
				.select("*")
				.eq("riot_account_id", riotAccount.id)
				.maybeSingle();
			if (tftDataError) throw tftDataError;
			if (storedTFTData) {
				return new Response(JSON.stringify(storedTFTData), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
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

		// Fetch match details concurrently.
		const matchDetails = await Promise.all(
			matchIds.map(async (matchId) => {
				const matchDetail = await fetchTFTMatchDetail(matchId, platform);
				if (matchDetail)
					await upsertTFTMatchDetail(matchId, summonerData.puuid, matchDetail);
				return matchDetail;
			})
		);

		// Fetch all stored matches for this player from the database
		const { data: storedMatches, error: storedMatchesError } = await supabase
			.from("tft_matches")
			.select("matchid")
			.eq("playerid", summonerData.puuid);

		if (storedMatchesError) throw storedMatchesError;

		// Get match IDs that are in the database but not in the current matchIds
		const storedMatchIds = storedMatches.map(match => match.matchid);
		const additionalMatchIds = storedMatchIds.filter(id => !matchIds.includes(id));

		// Fetch details for additional matches
		const additionalMatchDetails = await Promise.all(
			additionalMatchIds.map(async (matchId) => {
				const matchDetail = await fetchTFTMatchDetail(matchId, platform);
				return matchDetail;
			})
		);

		// Combine all match details
		const allMatchDetails = [...matchDetails, ...additionalMatchDetails.filter(Boolean)];

		const tftDataObj = {
			profiledata: summonerData,
			accountdata: {
				gameName: riotAccount.gamename,
				tagLine: riotAccount.tagline,
			},
			rankeddata: rankedData,
			matchdata: matchIds,
			matchdetails: allMatchDetails,
			livegamedata: liveGameData,
			updatedat: new Date(),
		};

		// Use supabaseAdmin for write operations
		let { data: tftRecord, error: tftError } = await supabaseAdmin
			.from("tft_data")
			.upsert(
				{
					riot_account_id: riotAccount.id,
					...tftDataObj,
				},
				{ onConflict: ["riot_account_id"], returning: "representation" }
			)
			.single();
		if (tftError) throw tftError;

		if (!tftRecord) {
			const { data: selectedTFTData, error: selectError } = await supabase
				.from("tft_data")
				.select("*")
				.eq("riot_account_id", riotAccount.id)
				.maybeSingle();
			if (selectError) throw selectError;
			tftRecord = selectedTFTData;
		}

		return new Response(JSON.stringify(tftRecord), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		// Error fetching TFT profile data
		return new Response(JSON.stringify({ error: error.message }), {
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
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
