import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";

export async function GET(req) {
	try {
		// Setup post-logout redirect
		const POST_LOGOUT_REDIRECT_URI = authConfig.postLogoutRedirectUri;

		// Redirect to home page (client-side will handle clearing localStorage)
		return NextResponse.redirect(POST_LOGOUT_REDIRECT_URI);
	} catch (error) {
		console.error("Error logging out:", error);
		return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
	}
}
