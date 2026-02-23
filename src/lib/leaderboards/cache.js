import { supabaseAdmin } from "../supabase.js";
import { LEADERBOARD_CACHE_TTL_MS } from "./constants.js";

function normalizeString(value, fallback = "") {
	return (value || fallback).toString().trim();
}

export function normalizeLeaderboardCacheKey(input) {
	const game = normalizeString(input.game).toLowerCase();
	const region = normalizeString(input.region).toUpperCase();
	const queue = normalizeString(input.queue).toUpperCase();
	const tier = normalizeString(input.tier, "CHALLENGER").toUpperCase();
	const division = normalizeString(input.division, "I").toUpperCase();

	return { game, region, queue, tier, division };
}

function parseDateMaybe(value) {
	if (!value) return null;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
}

export function isSnapshotFresh(snapshot) {
	const expiresAt = parseDateMaybe(snapshot?.expires_at);
	return Boolean(expiresAt && expiresAt.getTime() > Date.now());
}

export async function getLeaderboardSnapshot(keyInput) {
	const key = normalizeLeaderboardCacheKey(keyInput);
	const { data, error } = await supabaseAdmin
		.from("leaderboard_snapshots")
		.select(
			"game, region, queue, tier, division, payload, item_count, fetched_at, expires_at, updated_at"
		)
		.eq("game", key.game)
		.eq("region", key.region)
		.eq("queue", key.queue)
		.eq("tier", key.tier)
		.eq("division", key.division)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data || null;
}

export async function upsertLeaderboardSnapshot(
	keyInput,
	payload,
	{ ttlMs = LEADERBOARD_CACHE_TTL_MS } = {}
) {
	const key = normalizeLeaderboardCacheKey(keyInput);
	const now = new Date();
	const expiresAt = new Date(now.getTime() + ttlMs);

	const row = {
		...key,
		payload,
		item_count: Array.isArray(payload) ? payload.length : 0,
		fetched_at: now.toISOString(),
		expires_at: expiresAt.toISOString(),
	};

	const { error } = await supabaseAdmin.from("leaderboard_snapshots").upsert(row, {
		onConflict: "game,region,queue,tier,division",
	});

	if (error) {
		throw error;
	}

	return row;
}

export function buildLeaderboardCacheHeaders({
	cacheStatus,
	snapshot,
	ttlMs = LEADERBOARD_CACHE_TTL_MS,
}) {
	const headers = {
		"Cache-Control": `public, s-maxage=${Math.floor(ttlMs / 1000)}, stale-while-revalidate=300`,
		"X-Leaderboard-Cache": cacheStatus,
	};

	if (snapshot?.fetched_at) {
		headers["X-Leaderboard-Fetched-At"] = new Date(
			snapshot.fetched_at
		).toUTCString();
	}
	if (snapshot?.expires_at) {
		headers["X-Leaderboard-Expires-At"] = new Date(
			snapshot.expires_at
		).toUTCString();
	}

	return headers;
}
