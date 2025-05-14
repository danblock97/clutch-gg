// Direct script to populate riot_accounts from both League and TFT data
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Create Supabase clients directly in this script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL environment variable is not set."
  );
  process.exit(1);
}

if (!supabaseKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_KEY environment variable is not set."
  );
  process.exit(1);
}

if (!RIOT_API_KEY) {
  console.error("Error: RIOT_API_KEY environment variable is not set.");
  process.exit(1);
}

// For regular operations
const supabase = createClient(supabaseUrl, supabaseKey);

// For admin operations (using service role key)
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const REGIONS = [
  "euw1",
  "na1",
  "kr",
  "eun1",
  "br1",
  "jp1",
  "tr1",
  "la1",
  "la2",
  "oc1",
  "ru",
];
const MATCH_COUNT_PER_SOURCE = 50; // Split between League and TFT

/**
 * Store a Riot account in the database
 */
async function storeRiotAccount(accountData, region) {
  try {
    const { gameName, tagLine, puuid } = accountData;

    // Check if the account already exists
    const { data: existingAccount, error: selectError } = await supabase
      .from("riot_accounts")
      .select("*")
      .eq("puuid", puuid)
      .maybeSingle();

    if (selectError) {
      console.error(`Error checking if account exists: ${selectError.message}`);
      return;
    }

    // If account doesn't exist, insert it
    if (!existingAccount) {
      const { error: insertError } = await supabaseAdmin
        .from("riot_accounts")
        .insert([
          {
            gamename: gameName,
            tagline: tagLine,
            region: region,
            puuid: puuid,
          },
        ]);

      if (insertError) {
        console.error(`Error inserting account: ${insertError.message}`);
        return;
      }

      console.log(`Added account: ${gameName}#${tagLine} (${region})`);
      return true;
    } else {
      console.log(`Account already exists: ${gameName}#${tagLine} (${region})`);
      return false;
    }
  } catch (error) {
    console.error(`Error storing account: ${error.message}`);
    return false;
  }
}

/**
 * Fetch account data by PUUID
 */
async function fetchAccountByPuuid(puuid) {
  try {
    const response = await fetch(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch account data for PUUID ${puuid}: ${response.status}`
      );
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching account data: ${error.message}`);
    return null;
  }
}

/**
 * Map region to routing value for Riot API
 */
function getRoutingValue(region) {
  const regionMapping = {
    euw1: "europe",
    eun1: "europe",
    tr1: "europe",
    ru: "europe",
    na1: "americas",
    br1: "americas",
    la1: "americas",
    la2: "americas",
    kr: "asia",
    jp1: "asia",
    oc1: "sea",
  };

  return regionMapping[region] || "europe";
}

/**
 * Get recent League of Legends match IDs
 */
async function getLeagueMatchIds(region, routingValue) {
  try {
    // Get top players from the leaderboard
    const rankedResponse = await fetch(
      `https://${region}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    if (!rankedResponse.ok) {
      console.error(
        `Failed to fetch LoL leaderboard for ${region}: ${rankedResponse.status}`
      );
      return [];
    }

    const rankedData = await rankedResponse.json();
    const topPlayers = rankedData.entries.slice(0, 5); // Take top 5 players

    // Get puuids for these players
    const puuids = [];
    for (const player of topPlayers) {
      const summonerResponse = await fetch(
        `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/${player.summonerId}`,
        { headers: { "X-Riot-Token": RIOT_API_KEY } }
      );

      if (summonerResponse.ok) {
        const summonerData = await summonerResponse.json();
        puuids.push(summonerData.puuid);
      }
    }

    // Get matches for these players
    const matchIds = new Set();
    for (const puuid of puuids) {
      const matchesResponse = await fetch(
        `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${Math.ceil(
          MATCH_COUNT_PER_SOURCE / puuids.length
        )}`,
        { headers: { "X-Riot-Token": RIOT_API_KEY } }
      );

      if (matchesResponse.ok) {
        const matches = await matchesResponse.json();
        matches.forEach((matchId) => matchIds.add(matchId));
      }

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`Fetched ${matchIds.size} League matches for ${region}`);
    return Array.from(matchIds);
  } catch (error) {
    console.error(
      `Error fetching League matches for ${region}: ${error.message}`
    );
    return [];
  }
}

/**
 * Get recent TFT match IDs
 */
async function getTFTMatchIds(region, routingValue) {
  try {
    // Get top TFT players
    const rankedResponse = await fetch(
      `https://${region}.api.riotgames.com/tft/league/v1/challenger`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    if (!rankedResponse.ok) {
      console.error(
        `Failed to fetch TFT leaderboard for ${region}: ${rankedResponse.status}`
      );
      return [];
    }

    const rankedData = await rankedResponse.json();
    const topPlayers = rankedData.entries.slice(0, 5); // Take top 5 players

    // Get puuids for these players
    const puuids = [];
    for (const player of topPlayers) {
      const summonerResponse = await fetch(
        `https://${region}.api.riotgames.com/tft/summoner/v1/summoners/${player.summonerId}`,
        { headers: { "X-Riot-Token": RIOT_API_KEY } }
      );

      if (summonerResponse.ok) {
        const summonerData = await summonerResponse.json();
        puuids.push(summonerData.puuid);
      }
    }

    // Get TFT matches for these players
    const matchIds = new Set();
    for (const puuid of puuids) {
      const matchesResponse = await fetch(
        `https://${routingValue}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?start=0&count=${Math.ceil(
          MATCH_COUNT_PER_SOURCE / puuids.length
        )}`,
        { headers: { "X-Riot-Token": RIOT_API_KEY } }
      );

      if (matchesResponse.ok) {
        const matches = await matchesResponse.json();
        matches.forEach((matchId) => matchIds.add(matchId));
      }

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`Fetched ${matchIds.size} TFT matches for ${region}`);
    return Array.from(matchIds);
  } catch (error) {
    console.error(`Error fetching TFT matches for ${region}: ${error.message}`);
    return [];
  }
}

/**
 * Extract player PUUIDs from a League match
 */
async function getLeagueMatchParticipants(matchId, routingValue) {
  try {
    const response = await fetch(
      `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch League match ${matchId}: ${response.status}`
      );
      return [];
    }

    const matchData = await response.json();
    return matchData.metadata.participants || [];
  } catch (error) {
    console.error(`Error fetching League match ${matchId}: ${error.message}`);
    return [];
  }
}

/**
 * Extract player PUUIDs from a TFT match
 */
async function getTFTMatchParticipants(matchId, routingValue) {
  try {
    const response = await fetch(
      `https://${routingValue}.api.riotgames.com/tft/match/v1/matches/${matchId}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    if (!response.ok) {
      console.error(`Failed to fetch TFT match ${matchId}: ${response.status}`);
      return [];
    }

    const matchData = await response.json();
    return matchData.metadata.participants || [];
  } catch (error) {
    console.error(`Error fetching TFT match ${matchId}: ${error.message}`);
    return [];
  }
}

/**
 * Process a region to collect accounts from both League and TFT
 */
async function processRegion(region) {
  console.log(`\n=== Processing region: ${region} ===`);
  const routingValue = getRoutingValue(region);
  const uniquePuuids = new Set();
  let newAccountsAdded = 0;

  // Get League match IDs
  const leagueMatchIds = await getLeagueMatchIds(region, routingValue);

  // Process League matches
  console.log(`Processing ${leagueMatchIds.length} League matches...`);
  for (const matchId of leagueMatchIds) {
    const puuids = await getLeagueMatchParticipants(matchId, routingValue);
    puuids.forEach((puuid) => uniquePuuids.add(puuid));
    await new Promise((resolve) => setTimeout(resolve, 100)); // Rate limit delay
  }

  // Get TFT match IDs
  const tftMatchIds = await getTFTMatchIds(region, routingValue);

  // Process TFT matches
  console.log(`Processing ${tftMatchIds.length} TFT matches...`);
  for (const matchId of tftMatchIds) {
    const puuids = await getTFTMatchParticipants(matchId, routingValue);
    puuids.forEach((puuid) => uniquePuuids.add(puuid));
    await new Promise((resolve) => setTimeout(resolve, 100)); // Rate limit delay
  }

  console.log(`Found ${uniquePuuids.size} unique players in ${region}`);

  // Process accounts in batches to avoid rate limiting
  const batchSize = 10;
  const puuidArray = Array.from(uniquePuuids);

  for (let i = 0; i < puuidArray.length; i += batchSize) {
    const batch = puuidArray.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        puuidArray.length / batchSize
      )}`
    );

    // Process each PUUID in the batch
    for (const puuid of batch) {
      const accountData = await fetchAccountByPuuid(puuid);

      if (accountData) {
        const isNew = await storeRiotAccount(accountData, region);
        if (isNew) newAccountsAdded++;
      }

      // Small delay between API calls
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Larger delay between batches
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`Added ${newAccountsAdded} new accounts from ${region}`);
  return newAccountsAdded;
}

/**
 * Main function to run the script
 */
async function main() {
  console.log("=== Starting Riot Account Population Script ===");
  let totalAccountsAdded = 0;

  for (const region of REGIONS) {
    const accountsAdded = await processRegion(region);
    totalAccountsAdded += accountsAdded;

    // Add a longer delay between regions
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(`\n=== Script completed ===`);
  console.log(`Total new accounts added: ${totalAccountsAdded}`);

  // Check total count in the database
  const { data, error } = await supabase
    .from("riot_accounts")
    .select("count", { count: "exact" });

  if (!error) {
    console.log(`Total accounts in database: ${data.count}`);
  }

  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
