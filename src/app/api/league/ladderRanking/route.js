import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

const CACHE = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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

  const cacheKey = `ladderRanking_${gameName}_${tagLine}_${region}`;

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
      timeout: 10000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Looking for: <span>Ladder Rank <span class="text-main-600">8,593</span> (0.341% of top)</span>
    const ladderRankText = $('span:contains("Ladder Rank")').text();
    const ladderRankRegex = /Ladder Rank ([0-9,]+) \(([0-9.]+)% of top\)/;
    const match = ladderRankText.match(ladderRankRegex);

    let ladderRanking = null;

    if (match && match.length >= 3) {
      ladderRanking = {
        rank: match[1],        // e.g., "8,593"
        percentile: match[2],  // e.g., "0.341"
      };
    }

    // Cache the data
    CACHE.set(cacheKey, {
      data: ladderRanking,
      expiresAt: Date.now() + CACHE_TTL,
    });

    // Set appropriate cache headers
    return NextResponse.json(ladderRanking, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=86400",
        "X-Cache": "MISS",
        "X-Cache-Expires": new Date(Date.now() + CACHE_TTL).toUTCString(),
      },
    });
  } catch (error) {
    console.error("Error scraping ladder ranking:", error);
    
    // Return null with appropriate status code
    return NextResponse.json(null, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Error": "Failed to fetch ladder ranking",
      },
    });
  }
}