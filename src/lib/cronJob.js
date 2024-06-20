import cron from "node-cron";
import clientPromise from "@/lib/mongodb";
import { fetchAndUpdateProfileData } from "@/lib/updateProfile";

cron.schedule("* * * * *", async () => {
    const client = await clientPromise;
    const db = client.db("lol-tracker");
    const profilesCollection = db.collection("profiles");

    const profiles = await profilesCollection.find({}).toArray();

    for (const profile of profiles) {
        const { gameName, tagLine, createdAt } = profile;

        // Check if the document is older than 180 seconds
        if (new Date() - new Date(createdAt) > 180 * 1000) {
            await fetchAndUpdateProfileData(gameName, tagLine);
        }
    }
});
