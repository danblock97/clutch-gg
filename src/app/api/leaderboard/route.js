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
	"TR1",
	"RU",
];

export async function GET(req, res) {
	//LEAGUE-EXP-V4
	for (const r of regions) {
		const leaderboardResponse = await fetch(
			`https://${r}.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/CHALLENGER/I?page=1`,
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
}
