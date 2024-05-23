import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import cron from "node-cron";

// Define regions
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

// Function to fetch and update profile data
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
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
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
				headers: {
					"X-Riot-Token": process.env.RIOT_API_KEY,
				},
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

	const rankedResponse = await fetch(
		`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${profileData.id}`,
		{
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
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
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
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
		`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${encryptedPUUID}/ids?start=0&count=10`,
		{
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
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
				`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`,
				{
					headers: {
						"X-Riot-Token": process.env.RIOT_API_KEY,
					},
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

	const data = {
		profileData,
		accountData,
		rankedData,
		championMasteryData,
		matchData,
		matchDetails,
		createdAt: new Date(),
	};

	await profilesCollection.updateOne(
		{ gameName, tagLine },
		{ $set: data },
		{ upsert: true }
	);
};

// Schedule the task to run every minute and check document age
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

export async function GET(req, res) {
	if (typeof window === "undefined") {
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
				return NextResponse.json({ error: error.message }, { status: 500 });
			}
		}

		const updatedProfile = await profilesCollection.findOne({
			gameName,
			tagLine,
		});

		if (updatedProfile) {
			return NextResponse.json(updatedProfile);
		} else {
			return NextResponse.json({ error: "Profile not found" }, { status: 404 });
		}
	}
	return NextResponse.json(
		{ error: "This route is for server-side only" },
		{ status: 400 }
	);
}
