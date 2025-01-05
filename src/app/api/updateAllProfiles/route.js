import { updateAllProfiles } from "@/lib/updateAllProfiles";

export async function POST(req) {
	try {
		await updateAllProfiles();
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
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
