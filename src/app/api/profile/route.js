import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(req, res) {
	const gameName = req.nextUrl.searchParams.get("gameName");
	const tagLine = req.nextUrl.searchParams.get("tagLine");

	if (!gameName || !tagLine) {
		return NextResponse.error("Missing required query parameters");
	}

	const account = await fetch(
		`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
		{
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
			revalidatePath: revalidatePath(req.nextUrl.pathname),
		}
	);

	if (!account.ok) {
		return NextResponse.error("Failed to fetch profile");
	}

	const accountData = await account.json();
	return NextResponse.json(accountData);
}
