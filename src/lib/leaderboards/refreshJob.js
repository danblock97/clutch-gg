import {
	getLeaderboardSnapshot,
	isSnapshotFresh,
	upsertLeaderboardSnapshot,
} from "./cache.js";
import { fetchLeagueLeaderboardFromRiot } from "./leagueService.js";
import { fetchTftLeaderboardFromRiot } from "./tftService.js";
import {
	DEFAULT_DIVISION,
	DEFAULT_TIER,
	LOL_DEFAULT_QUEUE,
	LOL_LEADERBOARD_REGIONS,
	TFT_LEADERBOARD_REGIONS,
} from "./constants.js";

export const DEFAULT_REGION_DELAY_MS = Number(
	process.env.LEADERBOARD_CRON_REGION_DELAY_MS || 1500
);

export function isTruthy(value) {
	return ["1", "true", "yes"].includes((value || "").toLowerCase());
}

export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseRegions(raw, fallbackRegions) {
	if (!raw) return fallbackRegions;
	if (Array.isArray(raw)) {
		return raw.map((value) => value.toString().trim().toUpperCase()).filter(Boolean);
	}

	return raw
		.split(",")
		.map((value) => value.trim().toUpperCase())
		.filter(Boolean);
}

async function refreshLolRegion(region, tier, division, forceRefresh) {
	const params = {
		region,
		queue: LOL_DEFAULT_QUEUE,
		tier,
		division,
	};
	if (!forceRefresh) {
		const existing = await getLeaderboardSnapshot({ game: "lol", ...params });
		if (existing && isSnapshotFresh(existing)) {
			return { skipped: true, itemCount: existing.item_count || 0 };
		}
	}
	const payload = await fetchLeagueLeaderboardFromRiot(params);
	await upsertLeaderboardSnapshot({ game: "lol", ...params }, payload);
	return { skipped: false, itemCount: payload.length };
}

async function refreshTftRegion(region, tier, division, forceRefresh) {
	const params = {
		region,
		tier,
		division,
	};
	if (!forceRefresh) {
		const existing = await getLeaderboardSnapshot({ game: "tft", queue: "", ...params });
		if (existing && isSnapshotFresh(existing)) {
			return { skipped: true, itemCount: existing.item_count || 0 };
		}
	}
	const payload = await fetchTftLeaderboardFromRiot(params);
	await upsertLeaderboardSnapshot({ game: "tft", queue: "", ...params }, payload);
	return { skipped: false, itemCount: payload.length };
}

async function runSequentialRefresh(game, regions, tier, division, forceRefresh, regionDelayMs) {
	const startedAt = Date.now();
	const results = [];

	for (let i = 0; i < regions.length; i += 1) {
		const region = regions[i];
		const regionStart = Date.now();

		try {
			const outcome =
				game === "lol"
					? await refreshLolRegion(region, tier, division, forceRefresh)
					: await refreshTftRegion(region, tier, division, forceRefresh);

			results.push({
				region,
				ok: true,
				skipped: outcome.skipped,
				itemCount: outcome.itemCount,
				durationMs: Date.now() - regionStart,
			});
		} catch (error) {
			console.error(`Leaderboard refresh failed for ${game}:${region}:`, error);
			results.push({
				region,
				ok: false,
				error: error.message || "Unknown error",
				status: error.status || 500,
				durationMs: Date.now() - regionStart,
			});
		}

		if (i < regions.length - 1 && regionDelayMs > 0) {
			await sleep(regionDelayMs);
		}
	}

	return {
		game,
		tier,
		division,
		totalRegions: regions.length,
		successCount: results.filter((r) => r.ok).length,
		failureCount: results.filter((r) => !r.ok).length,
		skippedCount: results.filter((r) => r.ok && r.skipped).length,
		durationMs: Date.now() - startedAt,
		results,
	};
}

export async function runLeaderboardRefreshJob(options = {}) {
	const game = (options.game || "all").toLowerCase();
	const tier = (options.tier || DEFAULT_TIER).toUpperCase();
	const division = (options.division || DEFAULT_DIVISION).toUpperCase();
	const forceRefresh = Boolean(options.forceRefresh);
	const regionDelayMs =
		typeof options.regionDelayMs === "number"
			? options.regionDelayMs
			: DEFAULT_REGION_DELAY_MS;

	const summaries = [];

	if (game === "all" || game === "lol") {
		const lolRegions = parseRegions(options.lolRegions, LOL_LEADERBOARD_REGIONS);
		summaries.push(
			await runSequentialRefresh(
				"lol",
				lolRegions,
				tier,
				division,
				forceRefresh,
				regionDelayMs
			)
		);
	}

	if (game === "all" || game === "tft") {
		const tftRegions = parseRegions(options.tftRegions, TFT_LEADERBOARD_REGIONS);
		summaries.push(
			await runSequentialRefresh(
				"tft",
				tftRegions,
				tier,
				division,
				forceRefresh,
				regionDelayMs
			)
		);
	}

	return {
		ok: true,
		ranAt: new Date().toISOString(),
		regionDelayMs,
		forceRefresh,
		summaries,
	};
}
