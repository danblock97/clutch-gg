import clientPromise, { fetchProfileData } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req, res) {
	if (typeof window === "undefined") {
		const gameName = req.nextUrl.searchParams.get("gameName");
		const tagLine = req.nextUrl.searchParams.get("tagLine");

		if (!gameName || !tagLine) {
			return NextResponse.json(
				{ error: "Missing required query parameters" },
				{ status: 400 }
			);
		}

		const client = await clientPromise;
		const db = client.db("lol-tracker");
		const profilesCollection = db.collection("profiles");

		// Check if profile is cached
		const cachedProfile = await profilesCollection.findOne({
			gameName,
			tagLine,
		});
		if (cachedProfile) {
			return NextResponse.json(cachedProfile);
		}

		try {
			const data = await fetchProfileData(gameName, tagLine);
			return NextResponse.json(data);
		} catch (error) {
			return NextResponse.json(
				{ error: error.message || "Failed to fetch data" },
				{ status: 500 }
			);
		}
	}
	return NextResponse.json(
		{ error: "This route is for server-side only" },
		{ status: 400 }
	);
}
