import { updateAllProfiles } from "@/lib/updateAllProfiles";

const SECRET_TOKEN = process.env.UPDATE_PROFILES_SECRET;

export const config = {
	runtime: "nodejs",
};

export async function POST(req) {
	const authHeader = req.headers.get("Authorization");

	if (authHeader !== `Bearer ${SECRET_TOKEN}`) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});
	}

	try {
		// Call the function to update all profiles
		await updateAllProfiles();
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (error) {
		// Return a 500 status on error
		return new Response(
			JSON.stringify({ success: false, error: error.message }),
			{ status: 500 }
		);
	}
}

export function GET() {
	return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
		status: 405,
	});
}
