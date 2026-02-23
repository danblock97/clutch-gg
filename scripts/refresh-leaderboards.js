import "dotenv/config";
import { runLeaderboardRefreshJob, isTruthy } from "../src/lib/leaderboards/refreshJob.js";

function parseArgs(argv) {
	const args = {};

	for (const token of argv) {
		if (!token.startsWith("--")) continue;
		const body = token.slice(2);
		const eqIndex = body.indexOf("=");

		if (eqIndex === -1) {
			args[body] = "true";
			continue;
		}

		const key = body.slice(0, eqIndex);
		const value = body.slice(eqIndex + 1);
		args[key] = value;
	}

	return args;
}

function totalFailures(summary) {
	return (summary.summaries || []).reduce(
		(sum, gameSummary) => sum + (gameSummary.failureCount || 0),
		0
	);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));

	const summary = await runLeaderboardRefreshJob({
		game: args.game || process.env.LEADERBOARD_CRON_GAME || "all",
		tier: args.tier || process.env.LEADERBOARD_CRON_TIER,
		division: args.division || process.env.LEADERBOARD_CRON_DIVISION,
		forceRefresh: isTruthy(args.force || process.env.LEADERBOARD_CRON_FORCE),
		lolRegions: args.lolRegions || process.env.LEADERBOARD_CRON_LOL_REGIONS,
		tftRegions: args.tftRegions || process.env.LEADERBOARD_CRON_TFT_REGIONS,
		regionDelayMs:
			args.regionDelayMs != null
				? Number(args.regionDelayMs)
				: process.env.LEADERBOARD_CRON_REGION_DELAY_MS
					? Number(process.env.LEADERBOARD_CRON_REGION_DELAY_MS)
					: undefined,
	});

	console.log(JSON.stringify(summary, null, 2));

	if (totalFailures(summary) > 0) {
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error("Leaderboard refresh job failed:", error);
	process.exit(1);
});
