import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";

export async function GET(req) {
	try {
		const RIOT_CLIENT_ID = authConfig.clientId;
		const REDIRECT_URI = authConfig.redirectUri;

		// Get the returnUrl from the query parameters
		const { searchParams } = new URL(req.url);
		const returnUrl = searchParams.get("returnUrl");

		// Store the returnUrl in a cookie if provided
		const response = NextResponse.redirect(
			`https://auth.riotgames.com/authorize?${new URLSearchParams({
				client_id: RIOT_CLIENT_ID,
				redirect_uri: REDIRECT_URI,
				response_type: "code",
				scope: "openid",
			}).toString()}`
		);

		if (returnUrl) {
			// Set a cookie with the returnUrl that expires in 10 minutes
			response.cookies.set("returnUrl", returnUrl, {
				maxAge: 600, // 10 minutes
				path: "/",
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
			});
		}

		return response;
	} catch (error) {
		console.error("Error initiating Riot auth:", error);
		return NextResponse.json(
			{ error: "Failed to initiate authentication" },
			{ status: 500 }
		);
	}
}
