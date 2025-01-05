import { updateProfilesBatch } from "@/lib/updateAllProfiles";

export async function POST(req) {
	const url = new URL(req.url);
	const page = parseInt(url.searchParams.get("page"), 10) || 1;
	const pageSize = parseInt(url.searchParams.get("pageSize"), 10) || 10;

	try {
		await updateProfilesBatch(page, pageSize);
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
