// scripts/update-profiles.js
import { supabaseAdmin } from "../src/lib/supabase.js";
import {
	fetchSummonerData,
	fetchRankedData,
} from "../src/lib/league/leagueApi.js";
import {
	fetchTFTSummonerData,
	fetchTFTRankedData,
} from "../src/lib/tft/tftApi.js";
import { fetchAccountData } from "../src/lib/riot/riotAccountApi.js"; // Needed to get PUUID if missing, though ideally it exists

// TODO: Consider moving regionToPlatform to a shared lib file (e.g., src/lib/utils.js)
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

const BATCH_SIZE = 5; // Number of profiles to update per run
const DELAY_MS = 1500; // Delay between processing each account (in milliseconds) to respect Riot API rate limits

async function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateAccount(account) {
	console.log(
		`Updating: ${account.gamename}#${account.tagline} [${account.region}] (ID: ${account.id})`
	);
	const platform = regionToPlatform[account.region?.toUpperCase()];

	// Ensure we have a PUUID and a valid platform
	let puuid = account.puuid;
	if (!puuid) {
		console.warn(`Account ${account.id} missing PUUID. Attempting to fetch...`);
		try {
			const fetchedAccountData = await fetchAccountData(
				account.gamename,
				account.tagline,
				platform
			);
			if (fetchedAccountData?.puuid) {
				puuid = fetchedAccountData.puuid;
				// Update the account in the DB with the fetched PUUID
				await supabaseAdmin
					.from("riot_accounts")
					.update({ puuid: puuid })
					.eq("id", account.id);
				console.log(`  > PUUID fetched and updated for account ${account.id}.`);
			} else {
				console.error(
					`  > Failed to fetch PUUID for account ${account.id}. Skipping.`
				);
				// Update timestamp to avoid retrying immediately
				await supabaseAdmin
					.from("riot_accounts")
					.update({ updated_at: new Date() })
					.eq("id", account.id);
				return;
			}
		} catch (fetchError) {
			console.error(
				`  > Error fetching PUUID for account ${account.id}:`,
				fetchError.message
			);
			// Update timestamp to avoid retrying immediately
			await supabaseAdmin
				.from("riot_accounts")
				.update({ updated_at: new Date() })
				.eq("id", account.id);
			return;
		}
	}

	if (!platform) {
		console.warn(
			`Skipping account ${account.id} due to invalid region: ${account.region}.`
		);
		// Update timestamp to avoid retrying immediately
		await supabaseAdmin
			.from("riot_accounts")
			.update({ updated_at: new Date() })
			.eq("id", account.id);
		return;
	}

	try {
		// --- Fetch League Data ---
		// Note: Fetching match history here might be too heavy/slow and hit rate limits faster.
		// Consider only updating profile/rank data in the cron.
		const summonerData = await fetchSummonerData(puuid, account.region);
		if (!summonerData?.id) {
			console.warn(
				`  > Could not fetch League summoner data for ${puuid}. Skipping League update.`
			);
		} else {
			const rankedData = await fetchRankedData(summonerData.id, account.region);
			// Add other essential League data fetches here if needed (e.g., mastery, but be mindful of API calls)

			const leagueDataObj = {
				profiledata: summonerData,
				rankeddata: rankedData,
				// championmasterydata: ...,
				// accountdata is redundant if linking via riot_account_id
				updatedat: new Date(),
			};

			const { error: leagueError } = await supabaseAdmin
				.from("league_data")
				.upsert(
					{ riot_account_id: account.id, ...leagueDataObj },
					{ onConflict: "riot_account_id" }
				);
			if (leagueError)
				throw new Error(`League upsert error: ${leagueError.message}`);
			console.log(`  > League data updated.`);
		}

		// --- Fetch TFT Data ---
		// Note: Fetching match history here might be too heavy/slow.
		const tftSummonerData = await fetchTFTSummonerData(puuid, account.region);
		if (!tftSummonerData?.id) {
			console.warn(
				`  > Could not fetch TFT summoner data for ${puuid}. Skipping TFT update.`
			);
		} else {
			const tftRankedData = await fetchTFTRankedData(
				tftSummonerData.id,
				account.region
			);
			// Add other essential TFT data fetches here if needed

			const tftDataObj = {
				profiledata: tftSummonerData,
				rankeddata: tftRankedData,
				// accountdata is redundant if linking via riot_account_id
				updatedat: new Date(),
			};

			const { error: tftError } = await supabaseAdmin
				.from("tft_data")
				.upsert(
					{ riot_account_id: account.id, ...tftDataObj },
					{ onConflict: "riot_account_id" }
				);
			if (tftError) throw new Error(`TFT upsert error: ${tftError.message}`);
			console.log(`  > TFT data updated.`);
		}

		// --- Update Timestamp in riot_accounts ---
		const { error: updateTsError } = await supabaseAdmin
			.from("riot_accounts")
			.update({ updated_at: new Date() })
			.eq("id", account.id);
		if (updateTsError)
			throw new Error(`Timestamp update error: ${updateTsError.message}`);

		console.log(`Successfully updated account ${account.id}`);
	} catch (error) {
		console.error(
			`Failed to update account ${account.id} (${account.gamename}#${account.tagline}):`,
			error.message
		);
		// Handle 429 Rate Limit specifically
		if (
			error.message?.includes("429") ||
			error.status === 429 ||
			error.response?.status === 429
		) {
			console.warn("Rate limit potentially hit. Re-throwing to stop batch.");
			throw error; // Stop processing this batch
		}
		// Optional: Update account with error state or slightly later timestamp to avoid immediate retry loop on persistent errors
		try {
			await supabaseAdmin
				.from("riot_accounts")
				.update({ updated_at: new Date(Date.now() + 5 * 60000) })
				.eq("id", account.id); // Retry in 5 mins
			console.log(
				`  > Set account ${account.id} to retry in 5 minutes due to error.`
			);
		} catch (updateError) {
			console.error(
				`  > Failed to update timestamp after error for account ${account.id}:`,
				updateError.message
			);
		}
	}
}

async function run() {
	console.log(`[${new Date().toISOString()}] Starting profile update job...`);

	const { data: accounts, error: fetchError } = await supabaseAdmin
		.from("riot_accounts")
		.select("*")
		.order("updated_at", { ascending: true, nullsFirst: true })
		.limit(BATCH_SIZE);

	if (fetchError) {
		console.error("Error fetching accounts:", fetchError.message);
		process.exit(1); // Exit if we can't fetch accounts
	}

	if (!accounts || accounts.length === 0) {
		console.log("No accounts need updating or found.");
		return;
	}

	console.log(`Processing ${accounts.length} accounts...`);

	for (const account of accounts) {
		try {
			await updateAccount(account);
			// Only delay if we are continuing to the next account
			if (accounts.indexOf(account) < accounts.length - 1) {
				console.log(`Waiting ${DELAY_MS}ms before next account...`);
				await delay(DELAY_MS);
			}
		} catch (error) {
			// Check if it's a rate limit error re-thrown from updateAccount
			if (
				error.message?.includes("429") ||
				error.status === 429 ||
				error.response?.status === 429
			) {
				console.error(
					"Rate limit error encountered during batch processing. Stopping current run."
				);
				// Exit the loop early if rate limited
				break;
			} else {
				// Log other errors from updateAccount (already logged within the function)
				// Decide if you want to continue the batch or stop on any error
				console.error(
					`Non-rate-limit error processing account ${account.id}. Continuing batch...`
				);
				// Add a small delay even on error before the next attempt?
				// await delay(DELAY_MS / 2);
			}
		}
	}

	console.log(`[${new Date().toISOString()}] Profile update job finished.`);
}

run().catch((err) => {
	console.error("Unhandled error during cron job execution:", err);
	process.exit(1); // Exit with error code
});
