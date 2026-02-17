import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

const CACHE = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000;

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");
	const region = searchParams.get("region").toLowerCase();
	const forceRefresh = searchParams.get("refresh") === "true";

	if (!gameName || !tagLine || !region) {
		return NextResponse.json(
			{ error: "Missing required query parameters" },
			{ status: 400 }
		);
	}

	const cacheKey = `rankHistory_${gameName}_${tagLine}_${region}`;

	if (!forceRefresh && CACHE.has(cacheKey)) {
		const cachedData = CACHE.get(cacheKey);

		if (Date.now() < cachedData.expiresAt) {
			return NextResponse.json(cachedData.data, {
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=86400",
					"X-Cache": "HIT",
					"X-Cache-Expires": new Date(cachedData.expiresAt).toUTCString(),
				},
			});
		} else {
			CACHE.delete(cacheKey);
		}
	}

	try {
		const opggRegionMap = {
			euw1: "euw",
			na1: "na",
			kr: "kr",
			eun1: "eune",
			br1: "br",
			jp1: "jp",
			la1: "lan",
			la2: "las",
			oc1: "oce",
			ru: "ru",
			tr1: "tr",
		};

		const opggRegion = opggRegionMap[region.toLowerCase()] || region;

		const opggUrl = `https://${opggRegion}.op.gg/summoners/${opggRegion}/${encodeURIComponent(
			gameName
		)}-${encodeURIComponent(tagLine)}`;

		const response = await axios.get(opggUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
				Accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
				"Accept-Language": "en-US,en;q=0.9",
				Referer: "https://op.gg/",
				"Cache-Control": "no-cache",
				Pragma: "no-cache",
			},
			// Avoid axios proxy-from-env path, which uses deprecated url.parse().
			proxy: false,
			timeout: 10000,
		});

		const html = response.data;
		const $ = cheerio.load(html);

		const rankHistory = [];

		// Filter for the table with the caption "Ranked Solo/Duo"
		const rankedSoloDuoTable = $("table").filter((i, table) => {
			return $(table).find("caption").text().trim() === "Ranked Solo/Duo";
		});

		if (rankedSoloDuoTable.length) {
			// Iterate over each row in the tbody of the target table
			rankedSoloDuoTable.find("tbody tr").each((i, row) => {
				const season = $(row).find("td:first-child strong").text().trim();
				const tier = $(row).find("td:nth-child(2) span").first().text().trim();
				const lpText = $(row).find("td:last-child").text().trim();
				let lp = null;

				if (lpText) {
					// Clean the LP text by removing any commas and "LP" text before parsing
					const cleanLpText = lpText.replace(/,/g, "").replace(/\s*LP\s*/i, "");
					lp = parseInt(cleanLpText, 10);
				}

				if (season && tier) {
					rankHistory.push({
						season,
						tier: tier.charAt(0).toUpperCase() + tier.slice(1),
						lp,
					});
				}
			});
		}

		if (rankHistory.length > 0) {
			// Cache the data
			CACHE.set(cacheKey, {
				data: rankHistory,
				expiresAt: Date.now() + CACHE_TTL,
			});

			// Set appropriate cache headers
			return NextResponse.json(rankHistory, {
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=86400",
					"X-Cache": "MISS",
					"X-Cache-Expires": new Date(Date.now() + CACHE_TTL).toUTCString(),
				},
			});
		}

		const rankRows = [];
		$("tbody > tr").each((i, row) => {
			const seasonElem = $(row).find('strong[class*="text-[11px]"]');
			const tierElem = $(row).find('span[class*="text-xs"]');
			const lpElem = $(row).find('td[align="right"]');

			if (seasonElem.length && tierElem.length && lpElem.length) {
				const season = seasonElem.text().trim();
				const tier = tierElem.text().trim();
				const lpText = lpElem.text().trim();
				let lp = null;

				if (lpText) {
					// Clean the LP text by removing any commas and "LP" text before parsing
					const cleanLpText = lpText.replace(/,/g, "").replace(/\s*LP\s*/i, "");
					lp = parseInt(cleanLpText, 10);
				}

				if (season && tier) {
					rankRows.push({
						season,
						tier: tier.charAt(0).toUpperCase() + tier.slice(1),
						lp,
					});
				}
			}
		});

		if (rankRows.length > 0) {
			// Cache the data
			CACHE.set(cacheKey, {
				data: rankRows,
				expiresAt: Date.now() + CACHE_TTL,
			});

			return NextResponse.json(rankRows, {
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=86400",
					"X-Cache": "MISS",
					"X-Cache-Expires": new Date(Date.now() + CACHE_TTL).toUTCString(),
				},
			});
		}

		// Try direct approach as a last resort
		try {
			const fragment = cheerio.load("<table>" + html + "</table>");
			const directRows = [];

			fragment("tr").each((i, row) => {
				const season = fragment(row).find("strong").text().trim();
				const tier = fragment(row).find("span.text-xs").text().trim();
				const lpText = fragment(row).find('td[align="right"]').text().trim();
				let lp = null;

				if (lpText) {
					// Clean the LP text by removing any commas and "LP" text before parsing
					const cleanLpText = lpText.replace(/,/g, "").replace(/\s*LP\s*/i, "");
					lp = parseInt(cleanLpText, 10);
				}

				if (season && tier) {
					directRows.push({
						season,
						tier: tier.charAt(0).toUpperCase() + tier.slice(1),
						lp,
					});
				}
			});

			if (directRows.length > 0) {
				// Cache the data
				CACHE.set(cacheKey, {
					data: directRows,
					expiresAt: Date.now() + CACHE_TTL,
				});

				return NextResponse.json(directRows, {
					status: 200,
					headers: {
						"Cache-Control": "public, max-age=86400",
						"X-Cache": "MISS",
						"X-Cache-Expires": new Date(Date.now() + CACHE_TTL).toUTCString(),
					},
				});
			}
		} catch (fragmentError) {
			// Error handling silently
		}

		// If all attempts failed, return an empty array
		return NextResponse.json([], {
			status: 200,
			headers: {
				"Cache-Control": "public, max-age=21600",
				"X-Cache": "MISS",
			},
		});
	} catch (error) {
		// Return an empty array with appropriate status code
		return NextResponse.json([], {
			status: 200,
			headers: {
				"Cache-Control": "no-store",
				"X-Error": "Failed to fetch rank history",
			},
		});
	}
}
