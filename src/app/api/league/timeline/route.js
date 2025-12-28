import { fetchMatchTimeline } from "@/lib/league/leagueApi";

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

// Helper to extract platform from matchId (e.g. "NA1_12345" -> "NA1")
const getPlatformFromMatchId = (matchId) => {
	if (!matchId || typeof matchId !== "string") return "NA1";
	const parts = matchId.split("_");
	return parts.length > 0 ? parts[0] : "NA1";
};

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const matchId = searchParams.get("matchId");

	if (!matchId) {
		return new Response(
			JSON.stringify({ error: "Missing matchId parameter" }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}

	try {
		const platform = getPlatformFromMatchId(matchId);
		const normalizedPlatform = platform.toUpperCase();
		const routingRegion = regionToPlatform[normalizedPlatform] || "americas";

		const timeline = await fetchMatchTimeline(matchId, routingRegion);

		if (!timeline) {
			return new Response(
				JSON.stringify({ error: "Timeline not found" }),
				{ status: 404, headers: { "Content-Type": "application/json" } }
			);
		}

		return new Response(JSON.stringify(timeline), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching timeline:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch timeline" }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}

