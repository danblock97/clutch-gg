import clientPromise from "@/lib/mongodb";
import { fetchAndUpdateLiveGameData } from "@/lib/dataFetchers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("clutch-gg");
        const profilesCollection = db.collection("profiles");

        const profiles = await profilesCollection.find({}).toArray();

        for (const profile of profiles) {
            const { gameName, tagLine, profileData, region, liveGameStateChangedAt } = profile;

            if (!region) {
                console.error(`Region is undefined for profile ${gameName}#${tagLine}`);
                continue;
            }

            // Check if the profile is stale (liveGameStateChangedAt older than 2 minutes)
            const now = new Date();
            const lastStateChangedDate = new Date(liveGameStateChangedAt);
            const differenceInMinutes = (now - lastStateChangedDate) / (1000 * 60);

            if (differenceInMinutes > 2) {
                await profilesCollection.deleteOne({ gameName, tagLine });
                console.log(`Removed stale profile for ${gameName}#${tagLine}`);
                continue;
            }

            await fetchAndUpdateLiveGameData(profileData, region, gameName, tagLine);
        }

        return NextResponse.json({ message: "Cron job executed successfully" });
    } catch (error) {
        console.error("Error during cron job execution:", error);
        return NextResponse.json({ error: "Error during cron job execution" }, { status: 500 });
    }
}
