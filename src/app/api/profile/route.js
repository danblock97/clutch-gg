import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

//List of regions for looping through
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
	const gameName = req.nextUrl.searchParams.get("gameName");
	const tagLine = req.nextUrl.searchParams.get("tagLine");

	if (!gameName || !tagLine) {
		return NextResponse.error("Missing required query parameters");
	}

	//ACCOUNT-V1
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
		return NextResponse.error("Failed to fetch profile");
	}

	const accountData = await accountResponse.json();

	// Get the encrypted PUUID from the account data
	const encryptedPUUID = accountData.puuid;

	// Loop through regions to find the profile
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
			region = r; // Store the region if profile is found
			break;
		}
	}

	if (!profileResponse || !profileResponse.ok) {
		return NextResponse.error("Failed to fetch profile");
	}

	if (!region) {
		return NextResponse.error("Region not found");
	}

	//LEAGUE-V4
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
		return NextResponse.error("Failed to fetch ranked data");
	}

	const rankedData = await rankedResponse.json();

	//CHAMPION-MASTERY-V4
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
		return NextResponse.error("Failed to fetch champion mastery data");
	}

	let championMasteryData = await championMasteryResponse.json();

	// Slice the champion mastery data to return only the first 5 champions
	championMasteryData = championMasteryData.slice(0, 5);

	//MATCH-V5 - Get the last 10 matches
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
		return NextResponse.error("Failed to fetch match data");
	}

	const matchData = await matchResponse.json();

	//MATCH-V5 - Get the match details for each match
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

	//Combine all data and return
	const data = {
		profileData,
		accountData,
		rankedData,
		championMasteryData,
		matchData,
		matchDetails,
	};

	return NextResponse.json(data);
}
