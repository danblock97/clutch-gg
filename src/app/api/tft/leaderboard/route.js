import { NextResponse } from "next/server";
import { fetchTftLeaderboardFromRiot } from "@/lib/leaderboards/tftService";

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const params = {
		tier: searchParams.get("tier") || "CHALLENGER",
		division: searchParams.get("division") || "I",
		region: searchParams.get("region") || "euw1",
	};

	try {
		const data = await fetchTftLeaderboardFromRiot(params);
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in TFT leaderboard API route:", error);

		return NextResponse.json(
			{ error: error.message || "Internal server error fetching leaderboard data." },
			{ status: error.status || 500 }
		);
	}
}
