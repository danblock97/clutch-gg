// scripts/update-profiles.js
import { supabaseAdmin } from "../src/lib/supabase.js";
import { fetchAccountData } from "../src/lib/riot/riotAccountApi.js";

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

const DELAY_MS = 5000;
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";
const UPDATE_API_KEY = process.env.NEXT_PUBLIC_UPDATE_API_KEY;

if (!UPDATE_API_KEY) {
	console.error("Error: UPDATE_API_KEY environment variable is not set.");
	process.exit(1);
}

// Validate the APP_BASE_URL to ensure it's properly set
if (!APP_BASE_URL.startsWith("http")) {
	console.error(`Error: APP_BASE_URL seems to be invalid: "${APP_BASE_URL}"`);
	console.error("Please ensure it includes the protocol (http:// or https://)");
	process.exit(1);
}

// Test that the required endpoints would be valid URLs
const testLeagueEndpoint = `${APP_BASE_URL}/api/league/profile`;
const testTftEndpoint = `${APP_BASE_URL}/api/tft/profile`;
console.log(`League API endpoint: ${testLeagueEndpoint}`);
console.log(`TFT API endpoint: ${testTftEndpoint}`);

/**
 * Simple delay function.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise<void>}
 */
async function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches missing PUUID if necessary, then triggers internal API endpoints
 * to update League and TFT profile data for a given account.
 * @param {object} account - The account object from the database.
 */
async function updateAccount(account) {
	console.log(
		`Updating: ${account.gamename}#${account.tagline} [${account.region}] (ID: ${account.id})`
	);
	const platform = regionToPlatform[account.region?.toUpperCase()];

	// Fetch PUUID if it's missing
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
				await supabaseAdmin
					.from("riot_accounts")
					.update({ puuid: puuid })
					.eq("id", account.id);
				console.log(`  > PUUID fetched and updated for account ${account.id}.`);
			} else {
				console.error(
					`  > Failed to fetch PUUID for account ${account.id}. Skipping update for now.`
				);
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

			await supabaseAdmin
				.from("riot_accounts")
				.update({ updated_at: new Date() })
				.eq("id", account.id);
			return; // Stop processing this account on error
		}
	}

	// Skip if the region is invalid or cannot be mapped to a platform
	if (!platform) {
		console.warn(
			`Skipping account ${account.id} due to invalid region: ${account.region}.`
		);
		// Update timestamp to avoid retrying this account immediately
		await supabaseAdmin
			.from("riot_accounts")
			.update({ updated_at: new Date() })
			.eq("id", account.id);
		return;
	}

	try {
		// Trigger League Profile Update via Internal API
		console.log(`  > Triggering League update via API...`);
		const leagueResponse = await fetch(`${APP_BASE_URL}/api/league/profile`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": UPDATE_API_KEY,
			},
			body: JSON.stringify({
				gameName: account.gamename,
				tagLine: account.tagline,
				region: account.region,
			}),
		});

		if (!leagueResponse.ok) {
			const errorData = await leagueResponse.text();
			console.warn(
				`  > League API update failed for ${account.id} (${leagueResponse.status}): ${errorData}`
			);
			// Log failure but continue to TFT update
		} else {
			const leagueData = await leagueResponse.json().catch((e) => {
				console.warn(`  > Could not parse League API response: ${e.message}`);
				return null;
			});
			console.log(
				`  > League API update triggered successfully.`,
				leagueData
					? `Response: ${JSON.stringify(leagueData).substring(0, 100)}...`
					: "No response data"
			);
		}

		// Trigger TFT Profile Update via Internal API
		console.log(`  > Triggering TFT update via API...`);
		const tftResponse = await fetch(`${APP_BASE_URL}/api/tft/profile`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": UPDATE_API_KEY,
			},
			body: JSON.stringify({
				gameName: account.gamename,
				tagLine: account.tagline,
				region: account.region,
			}),
		});

		if (!tftResponse.ok) {
			const errorData = await tftResponse.text();
			console.warn(
				`  > TFT API update failed for ${account.id} (${tftResponse.status}): ${errorData}`
			);
		} else {
			const tftData = await tftResponse.json().catch((e) => {
				console.warn(`  > Could not parse TFT API response: ${e.message}`);
				return null;
			});
			console.log(
				`  > TFT API update triggered successfully.`,
				tftData
					? `Response: ${JSON.stringify(tftData).substring(0, 100)}...`
					: "No response data"
			);
		}

		// Always update the account's updated_at timestamp after attempting the updates
		const { error: updateError } = await supabaseAdmin
			.from("riot_accounts")
			.update({ updated_at: new Date() })
			.eq("id", account.id);

		if (updateError) {
			console.error(
				`  > Failed to update timestamp for account ${account.id}:`,
				updateError.message
			);
		} else {
			console.log(`  > Updated timestamp for account ${account.id}`);
		}

		console.log(
			`Finished triggering updates for account ${account.id} via API.`
		);
	} catch (error) {
		console.error(
			`Failed to trigger updates for account ${account.id} (${account.gamename}#${account.tagline}):`,
			error.message
		);

		// Re-throw rate limit errors to stop the batch processing
		if (
			error.message?.includes("429") ||
			error.status === 429 ||
			error.response?.status === 429
		) {
			console.warn("Rate limit potentially hit. Re-throwing to stop batch.");
			throw error;
		}

		// For other errors, update the timestamp to avoid immediate retry
		try {
			await supabaseAdmin
				.from("riot_accounts")
				// Set timestamp slightly in the future to prevent rapid retries on persistent errors
				.update({ updated_at: new Date(Date.now() + 5 * 60000) })
				.eq("id", account.id);
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

/**
 * Main function to fetch a batch of the least recently updated accounts
 * and trigger updates for each.
 */
async function run() {
	console.log(`[${new Date().toISOString()}] Starting profile update job...`);

	// Log information about the environment
	console.log(`Using APP_BASE_URL: ${APP_BASE_URL}`);
	console.log(`Update API key present: ${UPDATE_API_KEY ? "Yes" : "No"}`);

	const { data: accounts, error: fetchError } = await supabaseAdmin
		.from("riot_accounts")
		.select("*")
		.order("updated_at", { ascending: true, nullsFirst: true });

	// Log the fetched accounts timestamps for debugging
	if (accounts && accounts.length > 0) {
		console.log("Accounts to update with timestamps:");
		accounts.forEach((acc) => {
			console.log(
				`Account ID ${acc.id}: ${acc.gamename}#${acc.tagline} - Last updated: ${
					acc.updated_at || "never"
				}`
			);
		});
	}

	if (fetchError) {
		console.error("Error fetching accounts:", fetchError.message);
		process.exit(1); // Exit if database connection fails
	}

	if (!accounts || accounts.length === 0) {
		console.log("No accounts need updating or found.");
		return;
	}

	console.log(`Processing ${accounts.length} accounts...`);

	for (const account of accounts) {
		try {
			await updateAccount(account);
			// Delay before processing the next account (if any)
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
					"Rate limit error encountered. Stopping current processing run."
				);
				break; // Exit the loop early if rate limited
			} else {
				// Log other errors (already logged within updateAccount)
				// Continue processing the rest of the batch for non-rate-limit errors
				console.error(
					`Non-rate-limit error processing account ${account.id}. Continuing batch...`
				);
			}
		}
	}

	console.log(`[${new Date().toISOString()}] Profile update job finished.`);
}

// Execute the main function and handle any top-level unhandled errors
run().catch((err) => {
	console.error("Unhandled error during cron job execution:", err);
	process.exit(1); // Exit with error code
});
