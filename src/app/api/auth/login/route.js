import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";

export async function GET(req) {
	try {
		const RIOT_CLIENT_ID = authConfig.clientId;
		const REDIRECT_URI = authConfig.redirectUri;

		// Set the required parameters for the OAuth request
		const params = new URLSearchParams({
			client_id: RIOT_CLIENT_ID,
			redirect_uri: REDIRECT_URI,
			response_type: "code",
			scope: "openid",
		});

		// Construct the Riot authentication URL
		const riotAuthUrl = `https://auth.riotgames.com/authorize?${params.toString()}`;

		// Redirect to Riot authentication page
		return NextResponse.redirect(riotAuthUrl);
	} catch (error) {
		console.error("Error initiating Riot auth:", error);
		return NextResponse.json(
			{ error: "Failed to initiate authentication" },
			{ status: 500 }
		);
	}
}
