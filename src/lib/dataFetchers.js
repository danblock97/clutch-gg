import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const fetchAdditionalData = async (summonerId, puuid, region) => {
    try {
        const rankedResponse = await fetch(
            `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY },
            }
        );

        if (!rankedResponse.ok) {
            throw new Error("Failed to fetch ranked data");
        }

        const rankedData = await rankedResponse.json();
        const soloQueueData = rankedData.find(
            (queue) => queue.queueType === "RANKED_SOLO_5x5"
        );

        const accountResponse = await fetch(
            `https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY },
            }
        );

        if (!accountResponse.ok) {
            throw new Error("Failed to fetch account data");
        }

        const accountData = await accountResponse.json();

        const summonerResponse = await fetch(
            `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY },
            }
        );

        if (!summonerResponse.ok) {
            throw new Error("Failed to fetch summoner data");
        }

        const summonerData = await summonerResponse.json();

        return {
            rank: soloQueueData
                ? soloQueueData.tier + " " + soloQueueData.rank
                : "Unranked",
            lp: soloQueueData ? soloQueueData.leaguePoints : 0,
            wins: soloQueueData ? soloQueueData.wins : 0,
            losses: soloQueueData ? soloQueueData.losses : 0,
            gameName: accountData.gameName,
            tagLine: accountData.tagLine,
            summonerLevel: summonerData.summonerLevel,
        };
    } catch (error) {
        console.error("Error fetching additional data:", error);
        return {
            rank: "Unranked",
            lp: 0,
            wins: 0,
            losses: 0,
            gameName: "",
            tagLine: "",
            summonerLevel: 0,
        };
    }
};

const fetchAndUpdateLiveGameData = async (profileData, region, gameName, tagLine) => {
    const client = await clientPromise;
    const db = client.db("clutch-gg");
    const profilesCollection = db.collection("profiles");

    const liveGameResponse = await fetch(
        `https://${region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${profileData.puuid}`,
        {
            headers: { "X-Riot-Token": RIOT_API_KEY },
        }
    );

    let liveGameData = null;
    if (liveGameResponse.ok) {
        liveGameData = await liveGameResponse.json();
        liveGameData.participants = await Promise.all(
            liveGameData.participants.map(async (participant) => {
                const additionalData = await fetchAdditionalData(
                    participant.summonerId,
                    participant.puuid,
                    region
                );
                return { ...participant, ...additionalData };
            })
        );
    }

    const existingProfile = await profilesCollection.findOne({ gameName, tagLine });

    if (!existingProfile) {
        console.error(`Profile not found for ${gameName}#${tagLine}`);
        return;
    }

    let updateData = {
        liveGameData,
        updatedAt: new Date(),
    };

    if (
        JSON.stringify(existingProfile.liveGameData) !== JSON.stringify(liveGameData)
    ) {
        updateData.liveGameStateChangedAt = new Date(); // Update the state change timestamp
    }

    await profilesCollection.updateOne(
        { gameName, tagLine },
        { $set: updateData }
    );
};

export { fetchAndUpdateLiveGameData };
