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

export { fetchAdditionalData };
