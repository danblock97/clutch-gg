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

  const cacheKey = `tftLadderRanking_${gameName}_${tagLine}_${region}`;

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

    // Note the different URL structure for TFT profiles on OP.GG
    const opggUrl = `https://op.gg/tft/summoners/${opggRegion}/${encodeURIComponent(
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

    // Looking for TFT ladder ranking in the format:
    // <div class="text-[12px] leading-[16px] text-darkpurple-300">
    //   <a class="flex items-center gap-1 no-underline" href="/leaderboards/ranked?region=euw&amp;summoner=Goldiez%230001">
    //     <span>TFT Ladder Ranking</span>
    //     <span class="text-blue-500">439,384th</span>
    //     <span>(63% of top)</span>
    //   </a>
    // </div>

    // First try to find the TFT ladder ranking text
    // The TFT ladder ranking is in an anchor tag with text containing "TFT Ladder Ranking"
    // Format: <a class="flex items-center gap-1 no-underline" href="/leaderboards/ranked?region=euw&amp;summoner=Goldiez%230001">
    //           <span>TFT Ladder Ranking</span>
    //           <span class="text-blue-500">439,384th</span>
    //           <span>(63% of top)</span>
    //         </a>

    const ladderRankElement = $('a:contains("TFT Ladder Ranking")');
    let ladderRankText = '';

    if (ladderRankElement.length > 0) {
      ladderRankText = ladderRankElement.text();
      console.log("Found TFT ladder ranking text:", ladderRankText);

      // Also log the HTML to help debug
      console.log("Ladder rank element HTML:", ladderRankElement.html());
    } else {
      console.log("TFT ladder ranking element not found");

      // Try a more general selector to see if we can find anything related
      const anyLadderText = $('*:contains("Ladder")');
      if (anyLadderText.length > 0) {
        console.log("Found some ladder-related text:", anyLadderText.first().text());
      }
    }

    // Extract the rank and percentile using a more flexible regex pattern
    // The format might be something like: "TFT Ladder Ranking 439,384th (63% of top)"
    console.log("Raw ladder rank text:", ladderRankText);

    // Try different regex patterns to match the text
    let match = null;

    // Pattern 1: Look for numbers followed by ordinal suffix
    const pattern1 = /TFT Ladder Ranking\s*([0-9,]+)(?:st|nd|rd|th)\s*\(\s*([0-9.]+)%\s*of top\s*\)/i;
    match = ladderRankText.match(pattern1);

    if (!match) {
      // Pattern 2: More flexible pattern with optional spaces
      const pattern2 = /TFT Ladder Ranking.*?([0-9,]+)(?:st|nd|rd|th)?.*?\(\s*([0-9.]+)%\s*of top\s*\)/i;
      match = ladderRankText.match(pattern2);
    }

    if (!match) {
      // Pattern 3: Try to extract numbers directly
      const rankMatch = ladderRankText.match(/([0-9,]+)(?:st|nd|rd|th)/);
      const percentileMatch = ladderRankText.match(/\(\s*([0-9.]+)%\s*of top\s*\)/);

      if (rankMatch && percentileMatch) {
        match = [null, rankMatch[1], percentileMatch[1]];
      }
    }

    // If still no match, try to extract from spans directly
    if (!match && ladderRankElement.length > 0) {
      const rankSpan = ladderRankElement.find('span.text-blue-500');
      const percentileSpan = ladderRankElement.find('span:contains("% of top")');

      if (rankSpan.length > 0 && percentileSpan.length > 0) {
        const rankText = rankSpan.text().replace(/[^\d,]/g, ''); // Remove non-digit characters except commas
        const percentileText = percentileSpan.text().match(/(\d+(?:\.\d+)?)/); // Extract number

        if (rankText && percentileText && percentileText[1]) {
          match = [null, rankText, percentileText[1]];
        }
      }
    }

    // If still no match, try a more general approach to find any ladder ranking text
    if (!match) {
      // Look for any text containing both a number and "% of top"
      $('*').each((i, el) => {
        if (match) return; // Skip if we already found a match

        const text = $(el).text();
        if (text.includes('% of top')) {
          console.log("Found text with '% of top':", text);

          // Try to extract rank and percentile
          const rankMatch = text.match(/([0-9,]+)(?:st|nd|rd|th)/);
          const percentileMatch = text.match(/(\d+(?:\.\d+)?)%\s*of top/);

          if (rankMatch && percentileMatch) {
            match = [null, rankMatch[1], percentileMatch[1]];
            console.log("Extracted from general text:", match);
          }
        }
      });
    }


    console.log("Regex match result:", match);

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
    console.error("Error scraping TFT ladder ranking:", error);

    // Return null with appropriate status code
    return NextResponse.json(null, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Error": "Failed to fetch TFT ladder ranking",
      },
    });
  }
}
