import { supabase } from "@/lib/supabase";
import { fetchMatchDetail, upsertMatchDetail } from "@/lib/league/leagueApi";

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

/**
 * Extract the platform/region from a match ID.
 * Match IDs are formatted like "NA1_1234567890" or "EUW1_1234567890"
 */
const getPlatformFromMatchId = (matchId) => {
	if (!matchId || typeof matchId !== "string") return null;
	const parts = matchId.split("_");
	return parts.length > 0 ? parts[0].toUpperCase() : null;
};

export async function GET(req, { params }) {
	const { matchId } = await params;

	if (!matchId) {
		return new Response(
			JSON.stringify({ error: "Missing matchId parameter" }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}

	try {
		// Extract platform from matchId
		const platform = getPlatformFromMatchId(matchId);
		if (!platform) {
			return new Response(
				JSON.stringify({ error: "Invalid matchId format" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		const matchPlatform = regionToMatchPlatform[platform];
		if (!matchPlatform) {
			return new Response(
				JSON.stringify({ error: `Unsupported platform: ${platform}` }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// 1. Try fetching from Supabase cache first
		try {
			const { data: cachedMatch, error } = await supabase
				.from("league_matches")
				.select("match_data")
				.eq("matchid", matchId)
				.maybeSingle();

			if (!error && cachedMatch?.match_data) {
				return new Response(JSON.stringify(cachedMatch.match_data), {
					status: 200,
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "public, max-age=86400", // Cache for 24 hours
					},
				});
			}
		} catch (dbError) {
			console.warn(`Failed to fetch match ${matchId} from DB cache:`, dbError);
		}

		// 2. Fallback to Riot API
		const matchDetail = await fetchMatchDetail(matchId, matchPlatform);

		if (!matchDetail) {
			return new Response(
				JSON.stringify({ error: "Match not found" }),
				{ status: 404, headers: { "Content-Type": "application/json" } }
			);
		}

		// 3. Cache the match in the database for future requests
		// This runs asynchronously and doesn't block the response
		try {
			// Get the first participant's puuid for the upsert (required by the function)
			const firstParticipantPuuid = matchDetail.metadata?.participants?.[0];
			if (firstParticipantPuuid) {
				upsertMatchDetail(matchId, firstParticipantPuuid, matchDetail)
					.catch(err => console.warn(`Failed to cache match ${matchId}:`, err));
			}
		} catch (cacheError) {
			// Don't fail the request if caching fails
			console.warn(`Error caching match ${matchId}:`, cacheError);
		}

		return new Response(JSON.stringify(matchDetail), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=86400", // Cache for 24 hours
			},
		});
	} catch (error) {
		console.error(`Error fetching match ${matchId}:`, error);

		// Handle rate limiting
		if (error.message?.includes("429") || error.status === 429) {
			return new Response(
				JSON.stringify({ error: "Rate limited. Please try again later." }),
				{
					status: 429,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": "10",
					},
				}
			);
		}

		return new Response(
			JSON.stringify({ error: "Failed to fetch match details" }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}
