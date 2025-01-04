import { supabase } from "@/lib/supabase";
import { fetchAndUpdateProfileData } from "./fetchAndUpdateProfileData";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const updateProfilesBatch = async (startIndex, batchSize) => {
	try {
		// Fetch profiles in the specified range
		const { data: profiles, error } = await supabase
			.from("profiles")
			.select("*")
			.range(startIndex, startIndex + batchSize - 1);

		if (error) {
			console.error("Error fetching profiles:", error);
			return;
		}

		if (profiles && profiles.length > 0) {
			let requestCount = 0;
			const maxRequestsPerBatch = 500; // Riot API limit: 500 requests every 10 seconds
			const requestInterval = 10 * 1000; // 10 seconds in ms
			const requestsPerProfile = 26; // Max requests per profile based on function analysis

			for (const profile of profiles) {
				try {
					console.log(
						`Updating profile: ${profile.gamename}#${profile.tagline}`
					);

					// Call the function to update a single profile
					await fetchAndUpdateProfileData(
						profile.gamename,
						profile.tagline,
						profile.region
					);

					// Increment the request count
					requestCount += requestsPerProfile;

					// If the request count exceeds the limit, pause before continuing
					if (requestCount >= maxRequestsPerBatch) {
						console.log(
							`Rate limit reached (${requestCount} requests). Pausing for ${
								requestInterval / 1000
							} seconds...`
						);
						await sleep(requestInterval); // Pause execution
						requestCount = 0; // Reset request count
					}
				} catch (error) {
					console.error(
						`Error updating profile ${profile.gamename}#${profile.tagline}:`,
						error
					);
				}
			}
		} else {
			console.log("No profiles found in the specified range.");
		}
	} catch (error) {
		console.error("Error updating profiles batch:", error);
	}
};
