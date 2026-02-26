import { NextResponse } from "next/server";

// Valid API keys (you should store these in environment variables)
const VALID_API_KEYS = new Set([
  process.env.NEXT_PUBLIC_UPDATE_API_KEY,
  process.env.INTERNAL_API_KEY,
]);

// Allowed origins for CORS
const ENV_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.SITE_URL,
  process.env.NEXT_PUBLIC_BASE_URL,
].filter(Boolean);

const DEFAULT_ORIGINS = [
  "https://www.clutchgg.lol",
  "https://clutchgg.lol",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const ALLOWED_ORIGINS = new Set([...DEFAULT_ORIGINS, ...ENV_ORIGINS]);

export async function securityMiddleware(req) {
  try {
    const requestUrl = new URL(req.url);
    const userAgent = req.headers.get("user-agent") || "unknown";

    const logRejectedRequest = (reason, status, extra = {}) => {
      console.warn("Rejected Request:", {
        reason,
        status,
        method: req.method,
        path: requestUrl.pathname,
        userAgent,
        timestamp: new Date().toISOString(),
        ...extra,
      });
    };

    // 1. CORS / Origin Protection
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin) {
      let isAllowed = false;
      try {
        const originUrl = new URL(origin);
        const sameHost = originUrl.host === host; // same-origin
        const exactAllowed = ALLOWED_ORIGINS.has(origin);
        const isVercelPreview = /\.vercel\.app$/i.test(originUrl.hostname);
        const isLocalhost = /^(localhost|127\.0\.0\.1)(:\\d+)?$/i.test(
          originUrl.host,
        );
        isAllowed = sameHost || exactAllowed || isVercelPreview || isLocalhost;
      } catch (_) {
        isAllowed = false;
      }
      if (!isAllowed) {
        logRejectedRequest("unauthorized_origin", 403, { origin, host });
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized origin" }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // 2. API Key Validation for POST/PUT/DELETE requests
    if (["POST", "PUT", "DELETE"].includes(req.method)) {
      const apiKey = req.headers.get("x-api-key");
      if (!apiKey || !VALID_API_KEYS.has(apiKey)) {
        logRejectedRequest("invalid_api_key", 401);
        return new NextResponse(JSON.stringify({ error: "Invalid API key" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 3. Input Validation for GET requests
    if (req.method === "GET") {
      const { searchParams } = requestUrl;
      const gameName = searchParams.get("gameName");
      const tagLine = searchParams.get("tagLine");
      const region = searchParams.get("region");

      // Validate gameName and tagLine if present
      // Riot usernames can contain letters (including international), numbers, spaces, and some special characters
      if (gameName && !/^[\p{L}\p{N}\s\-_\.]{3,16}$/u.test(gameName.trim())) {
        logRejectedRequest("invalid_game_name_format", 400);
        return new NextResponse(
          JSON.stringify({ error: "Invalid gameName format" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Tagline can contain international letters/numbers (e.g., Japanese)
      if (tagLine && !/^[\p{L}\p{N}]{3,5}$/u.test(tagLine.trim())) {
        logRejectedRequest("invalid_tag_line_format", 400);
        return new NextResponse(
          JSON.stringify({ error: "Invalid tagLine format" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Validate region if present
      // Region format: 2-4 letters optionally followed by a digit (e.g., NA1, EUW1, KR, RU)
      if (region && !/^[a-z]{2,4}[0-9]?$/i.test(region)) {
        logRejectedRequest("invalid_region_format", 400);
        return new NextResponse(
          JSON.stringify({ error: "Invalid region format" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // 4. Add security headers
    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

    return response;
  } catch (error) {
    console.error("Security middleware error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
