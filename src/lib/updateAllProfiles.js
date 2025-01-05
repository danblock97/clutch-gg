import { supabase } from "@/lib/supabase";
import { fetchAndUpdateProfileData } from "./fetchAndUpdateProfileData";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const updateProfilesBatch = async (page, pageSize) => {
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize - 1;

	try {
		const { data: profiles, error } = await supabase
			.from("profiles")
			.select("*")
			.range(startIndex, endIndex);

		if (error) {
			console.error("Error fetching profiles:", error);
			return;
		}

		if (!profiles || profiles.length === 0) {
			console.log("No profiles found in the specified range.");
			return;
		}

		console.log(`Processing profiles ${startIndex} to ${endIndex}`);

		let requestCount = 0;
		const maxRequestsPerBatch = 500; // Riot API limit: 500 requests every 10 seconds
		const requestInterval = 10 * 1000; // 10 seconds in ms
		const requestsPerProfile = 26; // Max requests per profile based on function analysis

		for (const profile of profiles) {
			try {
				console.log(`Updating profile: ${profile.gamename}#${profile.tagline}`);

				await fetchAndUpdateProfileData(
					profile.gamename,
					profile.tagline,
					profile.region
				);

				requestCount += requestsPerProfile;

				if (requestCount >= maxRequestsPerBatch) {
					console.log(
						`Rate limit reached (${requestCount} requests). Pausing for ${
							requestInterval / 1000
						} seconds...`
					);
					await sleep(requestInterval);
					requestCount = 0;
				}
			} catch (error) {
				console.error(
					`Error updating profile ${profile.gamename}#${profile.tagline}:`,
					error
				);
			}
		}
	} catch (error) {
		console.error("Error updating profiles batch:", error);
	}
};
