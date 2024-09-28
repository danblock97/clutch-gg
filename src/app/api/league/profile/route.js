import { fetchAndUpdateProfileData } from "@/lib/fetchAndUpdateProfileData";
import { supabase } from "@/lib/supabase";

export async function GET(req) {
	const url = new URL(req.url);
	const gameName = url.searchParams.get("gameName");
	const tagLine = url.searchParams.get("tagLine");
	const region = url.searchParams.get("region");

	console.log(`Request URL: ${req.url}`);
	console.log(`gameName: ${gameName}, tagLine: ${tagLine}, region: ${region}`);

	if (!gameName || !tagLine || !region) {
		return new Response(
			JSON.stringify({ error: "Missing required query parameters" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	try {
		// Check if profile exists in Supabase with the same region
		let { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("gamename", gameName)
			.eq("tagline", tagLine)
			.eq("region", region)
			.maybeSingle();

		if (error) throw error;

		if (!data) {
			// Profile doesn't exist in that region, fetch from Riot API and update Supabase
			data = await fetchAndUpdateProfileData(gameName, tagLine, region);
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
		const { gameName, tagLine, region } = await req.json();
		if (!gameName || !tagLine || !region) {
			return new Response(
				JSON.stringify({ error: "Missing required parameters" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		const data = await fetchAndUpdateProfileData(gameName, tagLine, region);
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
