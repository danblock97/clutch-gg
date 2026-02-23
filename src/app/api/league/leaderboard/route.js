import { NextResponse } from "next/server";
import { fetchLeagueLeaderboardFromRiot } from "@/lib/leaderboards/leagueService";
import {
	buildLeaderboardCacheHeaders,
	getLeaderboardSnapshot,
	isSnapshotFresh,
	upsertLeaderboardSnapshot,
} from "@/lib/leaderboards/cache";
import { LOL_DEFAULT_QUEUE } from "@/lib/leaderboards/constants";

function isTruthy(value) {
	return ["1", "true", "yes"].includes((value || "").toLowerCase());
}

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const params = {
		queue: searchParams.get("queue") || LOL_DEFAULT_QUEUE,
		tier: searchParams.get("tier") || "CHALLENGER",
		division: searchParams.get("division") || "I",
		region: searchParams.get("region") || "euw1",
	};
	const forceRefresh = isTruthy(searchParams.get("refresh"));

	const cacheKey = {
		game: "lol",
		...params,
	};

	let snapshot = null;
	try {
		snapshot = await getLeaderboardSnapshot(cacheKey);
	} catch (cacheReadError) {
		console.warn("Failed to read LOL leaderboard snapshot:", cacheReadError);
	}

	if (!forceRefresh && snapshot && isSnapshotFresh(snapshot)) {
		return NextResponse.json(snapshot.payload || [], {
			headers: buildLeaderboardCacheHeaders({
				cacheStatus: "hit",
				snapshot,
			}),
		});
	}

	try {
		const data = await fetchLeagueLeaderboardFromRiot(params);

		try {
			await upsertLeaderboardSnapshot(cacheKey, data);
			snapshot = await getLeaderboardSnapshot(cacheKey);
		} catch (cacheWriteError) {
			console.warn("Failed to write LOL leaderboard snapshot:", cacheWriteError);
		}

		return NextResponse.json(data, {
			headers: buildLeaderboardCacheHeaders({
				cacheStatus: forceRefresh ? "refresh" : "miss",
				snapshot,
			}),
		});
	} catch (error) {
		console.error("Error in LOL leaderboard API route:", error);

		if (snapshot?.payload) {
			return NextResponse.json(snapshot.payload, {
				headers: buildLeaderboardCacheHeaders({
					cacheStatus: "stale",
					snapshot,
				}),
			});
		}

		return NextResponse.json(
			{ error: error.message || "Internal Server Error" },
			{ status: error.status || 500 }
		);
	}
}
