import { NextResponse } from "next/server";
import { fetchLeagueLeaderboardFromRiot } from "@/lib/leaderboards/leagueService";
import { LOL_DEFAULT_QUEUE } from "@/lib/leaderboards/constants";

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const params = {
		queue: searchParams.get("queue") || LOL_DEFAULT_QUEUE,
		tier: searchParams.get("tier") || "CHALLENGER",
		division: searchParams.get("division") || "I",
		region: searchParams.get("region") || "euw1",
	};

	try {
		const data = await fetchLeagueLeaderboardFromRiot(params);
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in LOL leaderboard API route:", error);

		return NextResponse.json(
			{ error: error.message || "Internal Server Error" },
			{ status: error.status || 500 }
		);
	}
}
