import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
	tls: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
	throw new Error("Please add your MongoDB URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
	if (!global._mongoClientPromise) {
		client = new MongoClient(uri, options);
		global._mongoClientPromise = client.connect();
	}
	clientPromise = global._mongoClientPromise;
} else {
	client = new MongoClient(uri, options);
	clientPromise = client.connect();
}

clientPromise.then((client) => {
	const db = client.db("lol-tracker");
	db.collection("profiles")
		.createIndex({ createdAt: 1 }, { expireAfterSeconds: 200 })
		.catch((error) => {
			console.error("Index creation failed:", error);
		});

	// Set an interval to refresh data every 180 seconds
	setInterval(async () => {
		try {
			const profiles = await db.collection("profiles").find().toArray();
			for (const profile of profiles) {
				await fetchProfileData(profile.gameName, profile.tagLine);
			}
		} catch (error) {
			console.error("Failed to refresh data:", error);
		}
	}, 180 * 1000);
});

export async function fetchProfileData(gameName, tagLine) {
	const client = await clientPromise;
	const db = client.db("lol-tracker");
	const profilesCollection = db.collection("profiles");

	// Fetch data from Riot API
	const accountResponse = await fetch(
		`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
		{
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
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

	for (const r of regions) {
		profileResponse = await fetch(
			`https://${r}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encryptedPUUID}`,
			{
				headers: {
					"X-Riot-Token": process.env.RIOT_API_KEY,
				},
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

	const rankedResponse = await fetch(
		`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${profileData.id}`,
		{
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
		}
	);

	if (!rankedResponse.ok) {
		throw new Error("Failed to fetch ranked data");
	}

	const rankedData = await rankedResponse.json();

	const championMasteryResponse = await fetch(
		`https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encryptedPUUID}`,
		{
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
		}
	);

	if (!championMasteryResponse.ok) {
		throw new Error("Failed to fetch champion mastery data");
	}

	let championMasteryData = await championMasteryResponse.json();
	championMasteryData = championMasteryData.slice(0, 5);

	const matchResponse = await fetch(
		`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${encryptedPUUID}/ids?start=0&count=10`,
		{
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
		}
	);

	if (!matchResponse.ok) {
		throw new Error("Failed to fetch match data");
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

	return data;
}

export default clientPromise;
