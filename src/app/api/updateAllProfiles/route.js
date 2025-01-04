import { updateProfilesBatch } from "@/lib/updateAllProfiles";

export async function POST(req) {
	const url = new URL(req.url);
	const startIndex = parseInt(url.searchParams.get("startIndex") || "0");
	const batchSize = parseInt(url.searchParams.get("batchSize") || "10");

	try {
		await updateProfilesBatch(startIndex, batchSize);
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (error) {
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
