import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import cron from "node-cron";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

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

const fetchAndUpdateProfileData = async (gameName, tagLine) => {
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
			revalidatePath: revalidatePath(
				`/api/profile?gameName=${gameName}&tagLine=${tagLine}`
			),
		}
	);

	if (!accountResponse.ok) {
		throw new Error("Failed to fetch profile");
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
				revalidatePath: revalidatePath(
					`/api/profile?gameName=${gameName}&tagLine=${tagLine}`
				),
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
			revalidatePath: revalidatePath(
				`/api/profile?gameName=${gameName}&tagLine=${tagLine}`
			),
		}
	);

	if (!rankedResponse.ok) {
		throw new Error("Failed to fetch ranked data");
	}

	const rankedData = await rankedResponse.json();

	const championMasteryResponse = await fetch(
		`https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encryptedPUUID}`,
		{
			headers: { "X-Riot-Token": RIOT_API_KEY },
			revalidatePath: revalidatePath(
				`/api/profile?gameName=${gameName}&tagLine=${tagLine}`
			),
		}
	);

	if (!championMasteryResponse.ok) {
		throw new Error("Failed to fetch champion mastery data");
	}

	let championMasteryData = await championMasteryResponse.json();
	championMasteryData = championMasteryData.slice(0, 5);

	const matchResponse = await fetch(
		`https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encryptedPUUID}/ids?start=0&count=10`,
		{
			headers: { "X-Riot-Token": RIOT_API_KEY },
			revalidatePath: revalidatePath(
				`/api/profile?gameName=${gameName}&tagLine=${tagLine}`
			),
		}
	);

	if (!matchResponse.ok) {
		throw new Error("Failed to fetch match data");
	}

	const matchData = await matchResponse.json();

	const matchDetails = await Promise.all(
		matchData.map(async (matchId) => {
			const matchDetailResponse = await fetch(
				`https://${platform}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
				{
					headers: { "X-Riot-Token": RIOT_API_KEY },
					revalidatePath: revalidatePath(
						`/api/profile?gameName=${gameName}&tagLine=${tagLine}`
					),
				}
			);

			if (!matchDetailResponse.ok) {
				return null;
			}

			return matchDetailResponse.json();
		})
	);

	// Fetch live game data
	const liveGameResponse = await fetch(
		`https://${region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${encryptedPUUID}`,
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
};

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

export async function GET(req) {
    const gameName = req.nextUrl.searchParams.get("gameName");
    const tagLine = req.nextUrl.searchParams.get("tagLine");

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
            return NextResponse.json({error: error.message}, {status: 500});
        }
    }

    const updatedProfile = await profilesCollection.findOne({
        gameName,
        tagLine,
    });

    if (updatedProfile) {
        return NextResponse.json(updatedProfile);
    } else {
        return NextResponse.json({error: "Profile not found"}, {status: 404});
    }
}