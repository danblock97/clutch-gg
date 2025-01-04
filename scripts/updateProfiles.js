import { updateAllProfiles } from "../src/lib/updateAllProfiles.js";

(async () => {
	try {
		console.log("Starting profile updates...");
		await updateAllProfiles();
		console.log("Profile updates complete.");
	} catch (error) {
		console.error("Error updating profiles:", error);
	}
})();
