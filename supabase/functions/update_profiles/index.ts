import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import pLimit from "https://esm.sh/p-limit@3.1.0";

// Initialize Supabase client
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Retrieve Riot API key
const RIOT_API_KEY = Deno.env.get("RIOT_API_KEY")!;

// Retrieve FUNCTION_SECRET
const FUNCTION_SECRET = Deno.env.get("FUNCTION_SECRET")!;

// Map regions to platforms
const regionToPlatform: Record<string, string> = {
  BR1: "americas",
  EUN1: "europe",
  EUW1: "europe",
  JP1: "asia",
  KR: "asia",
  LA1: "americas",
  LA2: "americas",
  ME1: "europe",
  NA1: "americas",
  OC1: "sea",
  PH2: "sea",
  RU: "europe",
  SG2: "sea",
  TH2: "sea",
  TR1: "europe",
  TW2: "sea",
  VN2: "sea",
};

// Define interfaces for type safety
interface Profile {
  gamename: string;
  tagline: string;
  region: string;
  puuid: string;
  // Add other relevant fields as necessary
}

interface UpdateData {
  gamename: string;
  tagline: string;
  profiledata: any;
  accountdata: any;
  rankeddata: any;
  championmasterydata: any;
  matchdata: string[];
  matchdetails: any[];
  livegamedata: any;
  region: string;
  updatedat: string;
}

// Fetch additional data function
const fetchAdditionalData = async (summonerId: string, puuid: string, region: string): Promise<any> => {
  try {
    const [rankedResponse, accountResponse, summonerResponse] = await Promise.all([
      fetch(`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`, {
        headers: { "X-Riot-Token": RIOT_API_KEY },
      }),
      fetch(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`, {
        headers: { "X-Riot-Token": RIOT_API_KEY },
      }),
      fetch(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`, {
        headers: { "X-Riot-Token": RIOT_API_KEY },
      }),
    ]);

    if (!rankedResponse.ok || !accountResponse.ok || !summonerResponse.ok) {
      throw new Error("Failed to fetch additional data");
    }

    const [rankedData, accountData, summonerData] = await Promise.all([
      rankedResponse.json(),
      accountResponse.json(),
      summonerResponse.json(),
    ]);

    const soloQueueData = rankedData.find((queue: any) => queue.queueType === "RANKED_SOLO_5x5");

    return {
      rank: soloQueueData ? `${soloQueueData.tier} ${soloQueueData.rank}` : "Unranked",
      lp: soloQueueData ? soloQueueData.leaguePoints : 0,
      wins: soloQueueData ? soloQueueData.wins : 0,
      losses: soloQueueData ? soloQueueData.losses : 0,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      summonerLevel: summonerData.summonerLevel,
    };
  } catch (error) {
    console.error("Error in fetchAdditionalData:", error);
    return {
      rank: "Unranked",
      lp: 0,
      wins: 0,
      losses: 0,
      gameName: "",
      tagLine: "",
      summonerLevel: 0,
    };
  }
};

// Main function to fetch and update profile data
const fetchAndUpdateProfileData = async (gameName: string, tagLine: string, region: string): Promise<UpdateData> => {
  if (!gameName || !tagLine || !region) {
    throw new Error("Missing required query parameters");
  }

  const platform = regionToPlatform[region];
  if (!platform) {
    throw new Error(`Invalid region: ${region}`);
  }

  // Fetch account information
  const accountResponse = await fetch(`https://${platform}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  if (!accountResponse.ok) {
    throw new Error("Failed to fetch profile");
  }

  const accountData = await accountResponse.json();
  const encryptedPUUID = accountData.puuid;

  // Fetch summoner data
  const summonerResponse = await fetch(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encryptedPUUID}`, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  if (!summonerResponse.ok) {
    throw new Error("Failed to fetch summoner data");
  }

  const profileDataFetched = await summonerResponse.json();

  // Fetch ranked data
  const rankedResponse = await fetch(`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${profileDataFetched.id}`, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  if (!rankedResponse.ok) {
    throw new Error("Failed to fetch ranked data");
  }

  const rankedData = await rankedResponse.json();

  // Fetch match data
  const matchResponse = await fetch(`https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encryptedPUUID}/ids?start=0&count=20`, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  if (!matchResponse.ok) {
    throw new Error("Failed to fetch match data");
  }

  const matchData: string[] = await matchResponse.json();

  // Fetch champion mastery data
  const championMasteryResponse = await fetch(`https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encryptedPUUID}`, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  if (!championMasteryResponse.ok) {
    throw new Error("Failed to fetch champion mastery data");
  }

  const championMasteryDataRaw = await championMasteryResponse.json();
  const championMasteryData = championMasteryDataRaw.slice(0, 5);

  // Fetch existing matches from Supabase
  const { data: existingMatches, error: existingMatchesError } = await supabase
    .from("matches")
    .select("*")
    .eq("playerid", profileDataFetched.puuid)
    .order("createdat", { ascending: true });

  if (existingMatchesError) {
    console.error("Error fetching existing matches:", existingMatchesError);
  }

  // Delete oldest match if necessary
  if (existingMatches && existingMatches.length >= 10) {
    const oldestMatchId = existingMatches[0].matchid;
    const { error: deleteMatchError } = await supabase
      .from("matches")
      .delete()
      .eq("matchid", oldestMatchId);

    if (deleteMatchError) {
      console.error("Error deleting oldest match:", deleteMatchError);
    }
  }

  // Fetch and upsert match details
  const matchDetails = await Promise.all(
    matchData.map(async (matchId) => {
      try {
        const matchDetailResponse = await fetch(`https://${platform}.api.riotgames.com/lol/match/v5/matches/${matchId}`, {
          headers: { "X-Riot-Token": RIOT_API_KEY },
        });

        if (!matchDetailResponse.ok) {
          console.error(`Failed to fetch match details for match ID: ${matchId}`);
          return null;
        }

        const matchDetail = await matchDetailResponse.json();

        const { error: insertMatchError } = await supabase.from("matches").upsert(
          {
            matchid: matchId,
            playerid: profileDataFetched.puuid,
            matchdetails: matchDetail,
          },
          { onConflict: ["matchid"] }
        );

        if (insertMatchError) {
          console.error("Error inserting match:", insertMatchError);
        }

        return matchDetail;
      } catch (error) {
        console.error(`Error fetching match details for match ID: ${matchId}`, error);
        return null;
      }
    })
  );

  // Fetch live game data
  const liveGameResponse = await fetch(`https://${region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${profileDataFetched.puuid}`, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  let liveGameData: any = null;
  if (liveGameResponse.ok) {
    liveGameData = await liveGameResponse.json();
    liveGameData.participants = await Promise.all(
      liveGameData.participants.map(async (participant: any) => {
        const additionalData = await fetchAdditionalData(participant.summonerId, participant.puuid, region);
        return { ...participant, ...additionalData };
      })
    );
  }

  // Prepare data for upsert
  const data: UpdateData = {
    gamename: gameName,
    tagline: tagLine,
    profiledata: profileDataFetched,
    accountdata: accountData,
    rankeddata: rankedData,
    championmasterydata: championMasteryData,
    matchdata: matchData,
    matchdetails: matchDetails,
    livegamedata: liveGameData,
    region,
    updatedat: new Date().toISOString(),
  };

  // Upsert profile data into Supabase
  const { error } = await supabase.from("profiles").upsert(data, { onConflict: ["gamename", "tagline"] });

  if (error) {
    console.error("Error upserting profile data:", error);
    throw error;
  }

  return data;
};

// Handler for the Edge Function
serve(async (req: Request) => {
  try {
    // Authenticate the request using a custom secret header
    const secretHeader = req.headers.get("x-function-secret");
    console.log("Received x-function-secret:", secretHeader);

    if (!secretHeader) {
      console.log("Missing x-function-secret header");
      return new Response("Unauthorized: Missing x-function-secret header", { status: 401 });
    }

    if (secretHeader !== FUNCTION_SECRET) {
      console.log("Invalid x-function-secret");
      return new Response("Unauthorized: Invalid secret", { status: 401 });
    }

    // Fetch all profiles from Supabase
    const { data: profiles, error: fetchError } = await supabase.from("profiles").select("*");

    if (fetchError) {
      console.error("Error fetching profiles:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch profiles" }), { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No profiles to update." }), { status: 200 });
    }

    // Implement concurrency control using p-limit
    const limit = pLimit(40); // Adjust based on Riot API rate limits
    const results: any[] = [];

    const tasks = profiles.map((profile: Profile) =>
      limit(async () => {
        try {
          const updatedData = await fetchAndUpdateProfileData(profile.gamename, profile.tagline, profile.region);
          const { error: upsertError } = await supabase.from("profiles").upsert(updatedData, { onConflict: ["gamename", "tagline"] });
          if (upsertError) throw upsertError;
          results.push({ profile: profile.gamename, status: "success" });
        } catch (err) {
          console.error(`Error updating profile ${profile.gamename}:`, err);
          results.push({ profile: profile.gamename, status: "failed", error: err.message });
        }
      })
    );

    await Promise.all(tasks);

    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Unhandled error in Edge Function:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
});
