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
	"TR1",
	"RU",
];

export async function GET(req, res) {
	const gameName = req.nextUrl.searchParams.get("gameName");
	const tagLine = req.nextUrl.searchParams.get("tagLine");

	if (!gameName || !tagLine) {
		return NextResponse.error("Missing required query parameters");
	}

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

	const encryptedPUUID = accountData.puuid;

	let profileResponse;
	let profileData;
	let region; // Store the region here
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

	const data = {
		profileData,
		accountData,
		rankedData,
	};

	return NextResponse.json(data);
}
