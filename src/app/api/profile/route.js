import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const regions = [
	"BR1",
	"EUN1",
	"EUW1",
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

export async function GET(req, res) {
	const client = await clientPromise;
	const db = client.db("lol-tracker");
	const profilesCollection = db.collection("profiles");

	const gameName = req.nextUrl.searchParams.get("gameName");
	const tagLine = req.nextUrl.searchParams.get("tagLine");

	if (!gameName || !tagLine) {
		return NextResponse.json(
			{ error: "Missing required query parameters" },
			{ status: 400 }
		);
	}

	// Check if profile is cached
	const cachedProfile = await profilesCollection.findOne({ gameName, tagLine });
	if (cachedProfile) {
		return NextResponse.json(cachedProfile);
	}

	// Fetch data from Riot API
	const accountResponse = await fetch(
		`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
		{
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
			revalidatePath: revalidatePath(req.nextUrl.pathname),
		}
	);

	if (!accountResponse.ok) {
		return NextResponse.json(
			{ error: "Failed to fetch profile" },
			{ status: accountResponse.status }
		);
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
				headers: {
					"X-Riot-Token": process.env.RIOT_API_KEY,
				},
				revalidatePath: revalidatePath(req.nextUrl.pathname),
			}
		);
		if (profileResponse.ok) {
			profileData = await profileResponse.json();
			region = r;
			break;
		}
	}

	if (!profileResponse || !profileResponse.ok) {
		return NextResponse.json(
			{ error: "Failed to fetch profile from any region" },
			{ status: 404 }
		);
	}

	const rankedResponse = await fetch(
		`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${profileData.id}`,
		{
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
			revalidatePath: revalidatePath(req.nextUrl.pathname),
		}
	);

	if (!rankedResponse.ok) {
		return NextResponse.json(
			{ error: "Failed to fetch ranked data" },
			{ status: rankedResponse.status }
		);
	}

	const rankedData = await rankedResponse.json();

	const championMasteryResponse = await fetch(
		`https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encryptedPUUID}`,
		{
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
			revalidatePath: revalidatePath(req.nextUrl.pathname),
		}
	);

	if (!championMasteryResponse.ok) {
		return NextResponse.json(
			{ error: "Failed to fetch champion mastery data" },
			{ status: championMasteryResponse.status }
		);
	}

	let championMasteryData = await championMasteryResponse.json();
	championMasteryData = championMasteryData.slice(0, 5);

	const matchResponse = await fetch(
		`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${encryptedPUUID}/ids?start=0&count=10`,
		{
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
			revalidatePath: revalidatePath(req.nextUrl.pathname),
		}
	);

	if (!matchResponse.ok) {
		return NextResponse.json(
			{ error: "Failed to fetch match data" },
			{ status: matchResponse.status }
		);
	}

	const matchData = await matchResponse.json();

	const matchDetails = await Promise.all(
		matchData.map(async (matchId) => {
			const matchDetailResponse = await fetch(
				`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`,
				{
					headers: {
						"X-Riot-Token": process.env.RIOT_API_KEY,
					},
					revalidatePath: revalidatePath(req.nextUrl.pathname),
				}
			);

			if (!matchDetailResponse.ok) {
				return null;
			}

			return matchDetailResponse.json();
		})
	);

	const data = {
		profileData,
		accountData,
		rankedData,
		championMasteryData,
		matchData,
		matchDetails,
		createdAt: new Date(),
	};

	// Upsert data in MongoDB
	await profilesCollection.updateOne(
		{ gameName, tagLine },
		{ $set: data },
		{ upsert: true }
	);

	return NextResponse.json(data);
}
