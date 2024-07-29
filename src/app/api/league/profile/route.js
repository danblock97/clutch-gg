import { fetchAndUpdateProfileData } from "@/lib/fetchAndUpdateProfileData";
import { supabase } from "@/lib/supabase";

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");

	if (!gameName || !tagLine) {
		return new Response(
			JSON.stringify({ error: "Missing required query parameters" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	try {
		// Check if profile exists in Supabase
		let { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("gamename", gameName)
			.eq("tagline", tagLine)
			.maybeSingle();

		if (error) throw error;

		if (!data) {
			// Profile doesn't exist, fetch from Riot API and update Supabase
			data = await fetchAndUpdateProfileData(gameName, tagLine);
		}

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching and updating profile data:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

export async function POST(req) {
	try {
		const { gameName, tagLine } = await req.json();
		if (!gameName || !tagLine) {
			return new Response(
				JSON.stringify({ error: "Missing required parameters" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		const data = await fetchAndUpdateProfileData(gameName, tagLine);
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error updating profile:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
