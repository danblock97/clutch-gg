export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
const RIOT_API_KEY = process.env.RIOT_API_KEY;

const regions = [
	"BR1",
	"EUW1",
	"EUN1",
	"JP1",
	"KR",
	"LA1",
	"LA2",
	"ME1",
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
	ME1: "europe",
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
		const [rankedResponse, accountResponse, summonerResponse] =
			await Promise.all([
				fetch(
					`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
					{
						headers: { "X-Riot-Token": RIOT_API_KEY },
					}
				),
				fetch(
					`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
					{
						headers: { "X-Riot-Token": RIOT_API_KEY },
					}
				),
				fetch(
					`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
					{
						headers: { "X-Riot-Token": RIOT_API_KEY },
					}
				),
			]);

		if (!rankedResponse.ok || !accountResponse.ok || !summonerResponse.ok) {
			throw new Error("Failed to fetch additional data");
		}

		const [rankedData, accountData, summonerData] = await Promise.all([
			rankedResponse.json(),
			accountResponse.json(),
			summonerResponse.json(),
		]);

		const soloQueueData = rankedData.find(
			(queue) => queue.queueType === "RANKED_SOLO_5x5"
		);

		return {
			rank: soloQueueData
				? `${soloQueueData.tier} ${soloQueueData.rank}`
				: "Unranked",
			lp: soloQueueData ? soloQueueData.leaguePoints : 0,
			wins: soloQueueData ? soloQueueData.wins : 0,
			losses: soloQueueData ? soloQueueData.losses : 0,
			gameName: accountData.gameName,
			tagLine: accountData.tagLine,
			summonerLevel: summonerData.summonerLevel,
		};
	} catch (error) {
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
	if (!gameName || !tagLine) {
		throw new Error("Missing required query parameters");
	}

	const client = await clientPromise;
	const db = client.db("clutch-gg");
	const profilesCollection = db.collection("profiles");

	const accountResponse = await fetch(
		`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
		{
			headers: { "X-Riot-Token": RIOT_API_KEY },
		}
	);

	if (!accountResponse.ok) {
		throw new Error("Failed to fetch profile");
	}

	const accountData = await accountResponse.json();
	const encryptedPUUID = accountData.puuid;

	let profileResponse;
	let profileDataFetched;
	let region;

	// Try fetching the profile data from different regions in parallel
	const regionFetchPromises = regions.map((r) =>
		fetch(
			`https://${r}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encryptedPUUID}`,
			{ headers: { "X-Riot-Token": RIOT_API_KEY } }
		).then((res) => ({ res, region: r }))
	);

	const regionFetchResults = await Promise.all(regionFetchPromises);
	for (const result of regionFetchResults) {
		if (result.res.ok) {
			profileResponse = result.res;
			profileDataFetched = await profileResponse.json();
			region = result.region;
			break;
		}
	}

	if (!profileResponse || !profileResponse.ok) {
		throw new Error("Failed to fetch profile from any region");
	}

	const platform = regionToPlatform[region];

	// Fetching ranked data, champion mastery, and match history in parallel
	const [rankedResponse, championMasteryResponse, matchResponse] =
		await Promise.all([
			fetch(
				`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${profileDataFetched.id}`,
				{
					headers: { "X-Riot-Token": RIOT_API_KEY },
				}
			),
			fetch(
				`https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encryptedPUUID}`,
				{
					headers: { "X-Riot-Token": RIOT_API_KEY },
				}
			),
			fetch(
				`https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encryptedPUUID}/ids?start=0&count=10`,
				{
					headers: { "X-Riot-Token": RIOT_API_KEY },
				}
			),
		]);

	if (!rankedResponse.ok || !championMasteryResponse.ok || !matchResponse.ok) {
		throw new Error("Failed to fetch profile details");
	}

	const [rankedData, championMasteryDataRaw, matchData] = await Promise.all([
		rankedResponse.json(),
		championMasteryResponse.json(),
		matchResponse.json(),
	]);

	const championMasteryData = championMasteryDataRaw.slice(0, 5);

	const matchDetails = await Promise.all(
		matchData.map(async (matchId) => {
			const matchDetailResponse = await fetch(
				`https://${platform}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
				{
					headers: { "X-Riot-Token": RIOT_API_KEY },
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
		`https://${region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${profileDataFetched.puuid}`,
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
		profileData: profileDataFetched,
		accountData,
		rankedData,
		championMasteryData,
		matchData,
		matchDetails,
		liveGameData,
		region,
		updatedAt: new Date(),
	};

	await profilesCollection.updateOne(
		{ gameName, tagLine },
		{ $set: data },
		{ upsert: true }
	);

	return data;
};

export async function GET(req) {
	const gameName = req.nextUrl.searchParams.get("gameName");
	const tagLine = req.nextUrl.searchParams.get("tagLine");

	if (!gameName || !tagLine) {
		return NextResponse.json(
			{ error: "Missing required query parameters" },
			{ status: 400 }
		);
	}

	try {
		const profileData = await fetchAndUpdateProfileData(gameName, tagLine);
		return NextResponse.json(profileData);
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] Error fetching and updating profile data:`,
			error
		);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
