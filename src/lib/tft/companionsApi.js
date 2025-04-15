// Helper functions for TFT Companions
import { cache } from "react";

/**
 * Fetches TFT companions data from Community Dragon
 * This is cached to avoid multiple fetches
 */
export const fetchTFTCompanions = cache(async () => {
	try {
		const response = await fetch(
			"https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/companions.json"
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch companions data: ${response.status}`);
		}

		const companionsData = await response.json();

		// Create a map of contentId -> companion data for easy lookup
		const companionsMap = {};
		companionsData.forEach((companion) => {
			if (companion.contentId) {
				companionsMap[companion.contentId] = {
					name: companion.name,
					speciesName: companion.speciesName,
					rarity: companion.rarity,
					iconPath: companion.loadoutsIcon,
				};
			}
		});

		return companionsMap;
	} catch (error) {
		console.error("Error fetching TFT companions data:", error);
		return {};
	}
});

/**
 * Maps a Community Dragon icon path to an actual URL
 */
export function getCompanionIconUrl(iconPath) {
	if (!iconPath) return null;

	// Format the path correctly for Community Dragon
	const formattedPath = iconPath
		.replace("/lol-game-data/assets/", "")
		.toLowerCase();

	return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${formattedPath}`;
}
