const RIOT_API_KEY = process.env.RIOT_API_KEY;

export const fetchAccountData = async (gameName, tagLine, platform) => {
	try {
		if (!RIOT_API_KEY) {
			console.error('RIOT_API_KEY is not configured');
			throw new Error('Riot API key is not configured');
		}

		const url = `https://${platform}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;

		const accountResponse = await fetch(url, {
			headers: { 
				"X-Riot-Token": RIOT_API_KEY,
				"Accept": "application/json"
			}
		});

		if (!accountResponse.ok) {
			const errorText = await accountResponse.text();
			console.error('Riot API Error:', {
				status: accountResponse.status,
				statusText: accountResponse.statusText,
				error: errorText
			});

			if (accountResponse.status === 404) {
				throw new Error('Account not found');
			} else if (accountResponse.status === 429) {
				throw new Error('Rate limit exceeded');
			} else if (accountResponse.status === 403) {
				throw new Error('Invalid API key');
			} else {
				throw new Error(`Failed to fetch account profile: ${accountResponse.status} ${accountResponse.statusText}`);
			}
		}

		const data = await accountResponse.json();
		
		if (!data || !data.puuid) {
			console.error('Invalid response data:', data);
			throw new Error('Invalid response from Riot API');
		}

		return data;
	} catch (error) {
		console.error('Error in fetchAccountData:', error);
		throw error;
	}
};
