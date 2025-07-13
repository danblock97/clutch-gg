import { NextResponse } from "next/server";

// Valid API keys (you should store these in environment variables)
const VALID_API_KEYS = new Set([
	process.env.NEXT_PUBLIC_UPDATE_API_KEY,
	process.env.INTERNAL_API_KEY,
]);

// Allowed origins for CORS
const ALLOWED_ORIGINS = ["https://www.clutchgg.lol", "http://localhost:3000"];

export async function securityMiddleware(req) {
	try {
		// 1. CORS Protection
		const origin = req.headers.get("origin");
		if (origin && !ALLOWED_ORIGINS.includes(origin)) {
			return new NextResponse(
				JSON.stringify({ error: "Unauthorized origin" }),
				{ status: 403, headers: { "Content-Type": "application/json" } }
			);
		}

		// 2. Request Logging (optional - can be removed if not needed)
		const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
		const userAgent = req.headers.get("user-agent") || "unknown";
		const requestPath = new URL(req.url).pathname;

		console.log("Request Info:", {
			ip,
			userAgent,
			path: requestPath,
			method: req.method,
			timestamp: new Date().toISOString(),
		});

		// 3. API Key Validation for POST/PUT/DELETE requests
		if (["POST", "PUT", "DELETE"].includes(req.method)) {
			const apiKey = req.headers.get("x-api-key");
			if (!apiKey || !VALID_API_KEYS.has(apiKey)) {
				return new NextResponse(JSON.stringify({ error: "Invalid API key" }), {
					status: 401,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		// 4. Input Validation for GET requests
		if (req.method === "GET") {
			const { searchParams } = new URL(req.url);
			const gameName = searchParams.get("gameName");
			const tagLine = searchParams.get("tagLine");
			const region = searchParams.get("region");

			// Validate gameName and tagLine if present
			// Riot usernames can contain letters (including international), numbers, spaces, and some special characters
			if (gameName && !/^[\p{L}\p{N}\s\-_\.]{3,16}$/u.test(gameName.trim())) {
				return new NextResponse(
					JSON.stringify({ error: "Invalid gameName format" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			// Tagline can be 3-5 characters, letters and numbers only
			if (tagLine && !/^[a-zA-Z0-9]{3,5}$/.test(tagLine)) {
				return new NextResponse(
					JSON.stringify({ error: "Invalid tagLine format" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			// Validate region if present
			if (region && !/^[a-z]{2,4}[0-9]$/i.test(region)) {
				return new NextResponse(
					JSON.stringify({ error: "Invalid region format" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}
		}

		// 5. Add security headers
		const response = NextResponse.next();
		response.headers.set("X-Content-Type-Options", "nosniff");
		response.headers.set("X-Frame-Options", "DENY");
		response.headers.set("X-XSS-Protection", "1; mode=block");
		response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
		response.headers.set(
			"Permissions-Policy",
			"camera=(), microphone=(), geolocation=()"
		);
		response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

		return response;
	} catch (error) {
		console.error("Security middleware error:", error);
		return new NextResponse(
			JSON.stringify({ error: "Internal server error" }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}
