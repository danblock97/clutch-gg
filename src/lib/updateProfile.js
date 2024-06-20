import clientPromise from "@/lib/mongodb";
import { fetchAdditionalData } from "@/lib/fetchData";

const regions = [
    "BR1",
    "EUW1",
    "EUN1",
    "JP1",
    "KR",
    "LA1",
    "LA2",
    "NA1",
    "OC1",
    "PH2",
    "RU",
    "SG2",
    "TH2",
    "TR1",
    "TW2",
    "VN2",
];

const regionToPlatform = {
    BR1: "americas",
    EUN1: "europe",
    EUW1: "europe",
    JP1: "asia",
    KR: "asia",
    LA1: "americas",
    LA2: "americas",
    NA1: "americas",
    OC1: "sea",
    PH2: "sea",
    RU: "europe",
    SG2: "sea",
    TH2: "sea",
    TR1: "europe",
    TW2: "sea",
    VN2: "sea",
};

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const fetchAndUpdateProfileData = async (gameName, tagLine) => {
    try {
        const client = await clientPromise;
        const db = client.db("lol-tracker");
        const profilesCollection = db.collection("profiles");

        if (!gameName || !tagLine) {
            throw new Error("Missing required query parameters");
        }

        const accountResponse = await fetch(
            `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY },
            }
        );

        if (!accountResponse.ok) {
            throw new Error(`Failed to fetch profile with status: ${accountResponse.status}`);
        }

        const accountData = await accountResponse.json();
        const encryptedPUUID = accountData.puuid;

        let profileResponse;
        let profileData;
        let region;

        for (const r of regions) {
            profileResponse = await fetch(
                `https://${r}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encryptedPUUID}`,
                {
                    headers: { "X-Riot-Token": RIOT_API_KEY },
                }
            );
            if (profileResponse.ok) {
                profileData = await profileResponse.json();
                region = r;
                break;
            }
        }

        if (!profileResponse || !profileResponse.ok) {
            throw new Error("Failed to fetch profile from any region");
        }

        const platform = regionToPlatform[region];

        const rankedResponse = await fetch(
            `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${profileData.id}`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY },
            }
        );

        if (!rankedResponse.ok) {
            throw new Error(`Failed to fetch ranked data with status: ${rankedResponse.status}`);
        }

        const rankedData = await rankedResponse.json();

        const championMasteryResponse = await fetch(
            `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encryptedPUUID}`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY },
            }
        );

        if (!championMasteryResponse.ok) {
            throw new Error(`Failed to fetch champion mastery data with status: ${championMasteryResponse.status}`);
        }

        let championMasteryData = await championMasteryResponse.json();
        championMasteryData = championMasteryData.slice(0, 5);

        const matchResponse = await fetch(
            `https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encryptedPUUID}/ids?start=0&count=10`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY },
            }
        );

        if (!matchResponse.ok) {
            throw new Error(`Failed to fetch match data with status: ${matchResponse.status}`);
        }

        const matchData = await matchResponse.json();

        const matchDetails = await Promise.all(
            matchData.map(async (matchId) => {
                const matchDetailResponse = await fetch(
                    `https://${platform}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
                    {
                        headers: { "X-Riot-Token": RIOT_API_KEY },
                    }
                );

                if (!matchDetailResponse.ok) {
                    console.error(`Failed to fetch match details for match ID ${matchId} with status: ${matchDetailResponse.status}`);
                    return null;
                }

                return matchDetailResponse.json();
            })
        );

        // Fetch live game data
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
        } else {
            console.error(`Failed to fetch live game data with status: ${liveGameResponse.status}`);
        }

        const data = {
            profileData,
            accountData,
            rankedData,
            championMasteryData,
            matchData,
            matchDetails,
            liveGameData,
            createdAt: new Date(),
        };

        await profilesCollection.updateOne(
            { gameName, tagLine },
            { $set: data },
            { upsert: true }
        );
    } catch (error) {
        console.error("Error in fetchAndUpdateProfileData:", error);
        throw error;
    }
};

export { fetchAndUpdateProfileData };
