import { NextResponse } from "next/server";
import { fetchTftLeaderboardFromRiot } from "@/lib/leaderboards/tftService";
import {
	buildLeaderboardCacheHeaders,
	getLeaderboardSnapshot,
	isSnapshotFresh,
	upsertLeaderboardSnapshot,
} from "@/lib/leaderboards/cache";

function isTruthy(value) {
	return ["1", "true", "yes"].includes((value || "").toLowerCase());
}

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const params = {
		tier: searchParams.get("tier") || "CHALLENGER",
		division: searchParams.get("division") || "I",
		region: searchParams.get("region") || "euw1",
	};
	const forceRefresh = isTruthy(searchParams.get("refresh"));

	const cacheKey = {
		game: "tft",
		queue: "",
		...params,
	};

	let snapshot = null;
	try {
		snapshot = await getLeaderboardSnapshot(cacheKey);
	} catch (cacheReadError) {
		console.warn("Failed to read TFT leaderboard snapshot:", cacheReadError);
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
		const data = await fetchTftLeaderboardFromRiot(params);

		try {
			await upsertLeaderboardSnapshot(cacheKey, data);
			snapshot = await getLeaderboardSnapshot(cacheKey);
		} catch (cacheWriteError) {
			console.warn("Failed to write TFT leaderboard snapshot:", cacheWriteError);
		}

		return NextResponse.json(data, {
			headers: buildLeaderboardCacheHeaders({
				cacheStatus: forceRefresh ? "refresh" : "miss",
				snapshot,
			}),
		});
	} catch (error) {
		console.error("Error in TFT leaderboard API route:", error);

		if (snapshot?.payload) {
			return NextResponse.json(snapshot.payload, {
				headers: buildLeaderboardCacheHeaders({
					cacheStatus: "stale",
					snapshot,
				}),
			});
		}

		return NextResponse.json(
			{ error: error.message || "Internal server error fetching leaderboard data." },
			{ status: error.status || 500 }
		);
	}
}
