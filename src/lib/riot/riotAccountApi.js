const RIOT_API_KEY = process.env.RIOT_API_KEY;

export const fetchAccountData = async (gameName, tagLine, platform) => {
	const accountResponse = await fetch(
		`https://${platform}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
		{ headers: { "X-Riot-Token": RIOT_API_KEY } }
	);
	if (!accountResponse.ok) {
		throw new Error("Failed to fetch account profile");
	}
	return await accountResponse.json();
};
