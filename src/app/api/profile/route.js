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
	for (const region of regions) {
		profileResponse = await fetch(
			`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encryptedPUUID}`,
			{
				headers: {
					"X-Riot-Token": process.env.RIOT_API_KEY,
				},
				revalidatePath: revalidatePath(req.nextUrl.pathname),
			}
		);
		if (profileResponse.ok) {
			profileData = await profileResponse.json();
			break;
		}
	}

	if (!profileResponse || !profileResponse.ok) {
		return NextResponse.error("Failed to fetch profile");
	}

	const data = {
		profileData,
		accountData,
	};

	return NextResponse.json(data);
}
