const LINEAR_GRAPHQL_ENDPOINT = "https://api.linear.app/graphql";

export async function linearGraphql(query, variables = {}) {
	const apiKey = process.env.LINEAR_API_KEY;
	if (!apiKey) {
		throw new Error("Missing LINEAR_API_KEY");
	}

	const res = await fetch(LINEAR_GRAPHQL_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: apiKey,
		},
		body: JSON.stringify({ query, variables }),
	});

	const json = await res.json().catch(() => null);
	if (!res.ok) {
		const msg =
			json?.errors?.[0]?.message ||
			`Linear API request failed (${res.status})`;
		throw new Error(msg);
	}
	if (json?.errors?.length) {
		throw new Error(json.errors[0]?.message || "Linear API returned an error");
	}
	return json?.data;
}


