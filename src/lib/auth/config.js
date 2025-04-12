// Simple configuration for RSO authentication

// Set the redirect URIs based on the environment
const baseUrl =
	process.env.NODE_ENV === "production"
		? "https://www.clutchgg.lol"
		: "http://localhost:3000";

const redirectUri =
	process.env.RIOT_REDIRECT_URI || `${baseUrl}/api/auth/callback`;
const postLogoutRedirectUri = process.env.POST_LOGOUT_REDIRECT_URI || baseUrl;

// Export the URIs for use in the auth routes
export const authConfig = {
	redirectUri,
	postLogoutRedirectUri,
	clientId: process.env.RIOT_CLIENT_ID,
	clientSecret: process.env.RIOT_CLIENT_SECRET,
};
