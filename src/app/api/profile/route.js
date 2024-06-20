import clientPromise from "@/lib/mongodb";
import { fetchAndUpdateProfileData } from "@/lib/updateProfile";
import { NextResponse } from "next/server";
import "@/lib/cronJob"; // Import cron job setup to ensure it runs

export async function GET(req) {
    const gameName = req.nextUrl.searchParams.get("gameName");
    const tagLine = req.nextUrl.searchParams.get("tagLine");

    if (!gameName || !tagLine) {
        return NextResponse.json({ error: "Missing gameName or tagLine" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("lol-tracker");
        const profilesCollection = db.collection("profiles");

        const cachedProfile = await profilesCollection.findOne({
            gameName,
            tagLine,
        });

        if (
            !cachedProfile ||
            new Date() - new Date(cachedProfile.createdAt) > 180 * 1000
        ) {
            try {
                await fetchAndUpdateProfileData(gameName, tagLine);
            } catch (error) {
                console.error("Error fetching and updating profile data:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }

        const updatedProfile = await profilesCollection.findOne({
            gameName,
            tagLine,
        });

        if (updatedProfile) {
            return NextResponse.json(updatedProfile);
        } else {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Error in GET /api/profile handler:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
