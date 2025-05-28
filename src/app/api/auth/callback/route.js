import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { authConfig } from "@/lib/auth/config";

export async function GET(req) {
	try {
		// Get authorization code from URL
		const { searchParams } = new URL(req.url);
		const code = searchParams.get("code");

		if (!code) {
			return NextResponse.redirect("/api/auth/error?error=no_code");
		}

		// Exchange the code for an access token
		const RIOT_CLIENT_ID = authConfig.clientId;
		const RIOT_CLIENT_SECRET = authConfig.clientSecret;
		const REDIRECT_URI = authConfig.redirectUri;

		// Create the Basic Auth header
		const basicAuth = Buffer.from(
			`${RIOT_CLIENT_ID}:${RIOT_CLIENT_SECRET}`
		).toString("base64");

		// Request body parameters
		const tokenParams = new URLSearchParams({
			grant_type: "authorization_code",
			code: code,
			redirect_uri: REDIRECT_URI,
		});

		// Exchange code for token
		const tokenResponse = await fetch("https://auth.riotgames.com/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${basicAuth}`,
			},
			body: tokenParams.toString(),
		});

		if (!tokenResponse.ok) {
			const errorData = await tokenResponse.json();
			console.error("Token exchange error:", errorData);
			return NextResponse.redirect(
				`/api/auth/error?error=token_exchange_failed`
			);
		}

		const tokenData = await tokenResponse.json();
		const { access_token, id_token } = tokenData;

		// Use the access token to fetch user account data from Riot Account API
		const accountResponse = await fetch(
			"https://europe.api.riotgames.com/riot/account/v1/accounts/me",
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			}
		);

		if (!accountResponse.ok) {
			console.error(
				"Error fetching account data:",
				await accountResponse.text()
			);
			return NextResponse.redirect(
				`/api/auth/error?error=account_fetch_failed`
			);
		}

		const accountData = await accountResponse.json();
		const { puuid, gameName, tagLine } = accountData;

		// Fetch additional summoner data to get the profile icon ID
		let profileIconId = null;
		try {
			// Default to EUW1 for fetching the summoner data
			const region = "euw1";
			const summonerResponse = await fetch(
				`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
				{
					headers: {
						"X-Riot-Token": process.env.RIOT_API_KEY,
					},
				}
			);

			if (summonerResponse.ok) {
				const summonerData = await summonerResponse.json();
				profileIconId = summonerData.profileIconId;
			}
		} catch (summonerError) {
			console.error("Error fetching summoner data:", summonerError);
			// Continue without profileIconId if there's an error
		}

		// Prepare the user object
		const user = {
			puuid,
			gameName,
			tagLine,
			profileIconId,
			region: "euw1", // Default to euw1, can be updated from user preferences
			access_token,
			id_token,
		};

		// Store the user data in Supabase
		try {
			// Check if user exists
			const { data: existingUser, error: selectError } = await supabase
				.from("riot_accounts")
				.select("*")
				.eq("puuid", puuid)
				.maybeSingle();

			if (selectError) throw selectError;

			// Insert or update the user - use supabaseAdmin for write operations
			if (!existingUser) {
				const { error: insertError } = await supabaseAdmin
					.from("riot_accounts")
					.insert([
						{
							gamename: gameName,
							tagline: tagLine,
							region: "euw1", // Default region
							puuid: puuid
						},
					]);

				if (insertError) throw insertError;
			}
		} catch (dbError) {
			console.error("Database error:", dbError);
			// Continue anyway since we have the user data
		}

		// Check if there's a returnUrl cookie
		const returnUrl = req.cookies.get("returnUrl")?.value;

		// Prepare the redirect URL - either the returnUrl or the home page
		const redirectUrl = returnUrl || "/";

		// Create a response that will set the user data in localStorage and redirect
		const responseHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
        </head>
        <body>
          <script>
            // Store the user data in localStorage
            localStorage.setItem("rso_user", '${JSON.stringify(user)}');
            // Redirect to the appropriate page
            window.location.href = "${redirectUrl}";
          </script>
          <p>Authentication successful. Redirecting...</p>
        </body>
      </html>
    `;

		// Create the response
		const response = new NextResponse(responseHtml, {
			headers: {
				"Content-Type": "text/html",
			},
		});

		// Clear the returnUrl cookie
		if (returnUrl) {
			response.cookies.set("returnUrl", "", {
				maxAge: 0,
				path: "/",
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
			});
		}

		return response;
	} catch (error) {
		console.error("Auth callback error:", error);
		return NextResponse.redirect(
			`/api/auth/error?error=${encodeURIComponent(error.message)}`
		);
	}
}
