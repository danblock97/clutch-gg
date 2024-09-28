import { fetchAndUpdateProfileData } from "@/lib/fetchAndUpdateProfileData";
import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
	const apiKey = req.headers["x-api-key"];

	if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_UPDATE_API_KEY) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { data: profiles, error } = await supabase.from("profiles").select("*");

	if (error) {
		console.error("Error fetching profiles:", error);
		return res.status(500).json({ error: "Error fetching profiles" });
	}

	for (const profile of profiles) {
		try {
			const { gameName, tagLine } = profile;
			await fetchAndUpdateProfileData(gameName, tagLine);
		} catch (error) {
			console.error(
				`Error updating profile for ${profile.gameName}#${profile.tagLine}:`,
				error
			);
		}
	}

	res.status(200).json({ message: "Profiles updated successfully" });
}
