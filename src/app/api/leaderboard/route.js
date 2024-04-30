import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(req, res) {
	const { region, tier = "CHALLENGER" } = req.params;

	// Check if the provided region is valid
	if (!isValidRegion(region)) {
		return NextResponse.error("Invalid region specified");
	}

	// Check if the provided tier is valid
	if (!isValidTier(tier)) {
		return NextResponse.error("Invalid tier specified");
	}

	const leaderboardResponse = await fetch(
		`https://${region}.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/${tier}/I?page=1`,
		{
			headers: {
				"X-Riot-Token": process.env.RIOT_API_KEY,
			},
			revalidatePath: revalidatePath(req.nextUrl.pathname),
		}
	);

	if (!leaderboardResponse.ok) {
		return NextResponse.error("Failed to fetch leaderboard");
	}

	const leaderboardData = await leaderboardResponse.json();
	return NextResponse.json(leaderboardData);
}

// Function to check if the provided region is valid
function isValidRegion(region) {
	const validRegions = [
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
	return validRegions.includes(region);
}

// Function to check if the provided tier is valid
function isValidTier(tier) {
	const validTiers = [
		"CHALLENGER",
		"GRANDMASTER",
		"MASTER",
		"DIAMOND",
		"PLATINUM",
		"GOLD",
		"SILVER",
		"BRONZE",
		"IRON",
	];
	return validTiers.includes(tier);
}
