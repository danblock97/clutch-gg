import { fetchAndUpdateProfileData } from "./fetchAndUpdateProfileData.js";
import { supabase } from "./supabase.js";

// Helper to introduce delay
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to handle retries with exponential backoff
const retryWithBackoff = async (fn: () => Promise<any>, retries = 5, delayMs = 1000): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            if (error.response?.status === 429 && i < retries - 1) {
                const backoffTime = delayMs * Math.pow(2, i);
                console.warn(`Rate limited. Retrying in ${backoffTime}ms...`);
                await delay(backoffTime);
            } else {
                throw error;
            }
        }
    }
};

Deno.serve(async (req) => {
    try {
        const { data: profiles, error } = await supabase.from("profiles").select("*");
        if (error) throw new Error("Failed to fetch profiles from the database");

        if (!profiles || profiles.length === 0) {
            return new Response(JSON.stringify({ message: "No profiles to update" }), { status: 404 });
        }

        const requestsPerBatch = 500;
        const delayBetweenBatches = 10000;

        for (let i = 0; i < profiles.length; i += requestsPerBatch) {
            const batch = profiles.slice(i, i + requestsPerBatch);

            await Promise.all(
                batch.map(async (profile) => {
                    try {
                        await retryWithBackoff(() =>
                            fetchAndUpdateProfileData(profile.gamename, profile.tagline, profile.region)
                        );
                    } catch (error) {
                        console.error(`Error updating profile ${profile.gamename}:`, error);
                    }
                })
            );

            if (i + requestsPerBatch < profiles.length) {
                console.log(`Processed ${i + requestsPerBatch} profiles. Waiting ${delayBetweenBatches}ms...`);
                await delay(delayBetweenBatches);
            }
        }

        return new Response(JSON.stringify({ message: "Profiles updated successfully" }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error updating profiles:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
});
