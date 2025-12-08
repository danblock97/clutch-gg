import { supabase } from "@/lib/supabase";
import ShareCardClient from "@/components/profile-card/ShareCardClient";
import LeagueShareCard from "@/components/profile-card/LeagueShareCard";
import TFTShareCard from "@/components/profile-card/TFTShareCard";
import CardPageChrome from "@/components/card/CardPageChrome";
import React from "react";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function getParam(params, key, fallback = "") {
  if (!params) return fallback;
  const value =
    typeof params.get === "function"
      ? params.get(key) ?? params.get(key.toLowerCase()) ?? params.get(key.toUpperCase())
      : params[key] ?? params[key.toLowerCase()] ?? params[key.toUpperCase()];
  if (Array.isArray(value)) {
    return (value[0] ?? fallback).toString();
  }
  if (value == null) return fallback;
  const str = value.toString().trim();
  return str || fallback;
}

function normalizeParam(value, fallback = "") {
  const trimmed = (value || "").trim();
  return trimmed || fallback;
}

function getParamAny(params, keys = [], fallback = "") {
  for (const key of keys) {
    const val = getParam(params, key);
    if (val !== "" && val != null) return val;
  }
  return fallback;
}

function parseHandle(handle) {
  const clean = normalizeParam(handle);
  if (!clean || !clean.includes("#")) return { gameName: "", tagLine: "" };
  const [gn, tl] = clean.split("#");
  return { gameName: normalizeParam(gn), tagLine: normalizeParam(tl) };
}

async function getClaim(gameName, tagLine, region, mode) {
  // Resolve the riot account (case-insensitive) and include claimed flags
  const { data: account } = await supabase
    .from("riot_accounts")
    .select("id, gamename, tagline, region, claimed_league, claimed_tft")
    .ilike("gamename", gameName)
    .ilike("tagline", tagLine)
    .ilike("region", region)
    .maybeSingle();
  if (!account) return null;

  // Prefer the claimed flags on riot_accounts (source of truth)
  const claimedByFlag = mode === "league" ? account.claimed_league : account.claimed_tft;
  if (claimedByFlag) return { id: account.id };

  // Fallback to legacy profile_claims row if present
  const { data: claim } = await supabase
    .from("profile_claims")
    .select("id")
    .eq("riot_account_id", account.id)
    .eq("mode", mode)
    .maybeSingle();
  return claim || null;
}

function getHeader(headersLike, key) {
  if (!headersLike) return null;
  if (typeof headersLike.get === "function") return headersLike.get(key);
  return headersLike[key] ?? headersLike[key?.toLowerCase?.()] ?? headersLike[key?.toUpperCase?.()] ?? null;
}

export default async function CardPage({ searchParams }) {
  // In Next 13/14+ searchParams may be a promise; normalize it before use
  const params = await searchParams;

  const fromHandle = parseHandle(
    getParamAny(params, ["handle", "summoner", "summonerName", "player", "ign", "name"])
  );

  const gameName = normalizeParam(
    getParamAny(params, ["gameName", "gamename", "name"], fromHandle.gameName)
  );
  const tagLine = normalizeParam(getParamAny(params, ["tagLine", "tagline"], fromHandle.tagLine));
  const region = normalizeParam(getParamAny(params, ["region", "platform", "shard"], "euw1")).toLowerCase();
  const mode = normalizeParam(getParamAny(params, ["mode"], "league")).toLowerCase();

  if (!gameName || !tagLine || !region || !["league", "tft"].includes(mode)) {
    return (
      <main className="min-h-[60vh] grid place-items-center text-center p-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Invalid card link</h1>
          <p className="text-white/70">Missing or invalid parameters.</p>
        </div>
      </main>
    );
  }

  const claim = await getClaim(gameName, tagLine, region, mode);
  if (!claim) {
    return (
      <main className="min-h-[60vh] grid place-items-center text-center p-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Card not available</h1>
          <p className="text-white/70">This profile has not been claimed for {mode.toUpperCase()} yet.</p>
        </div>
      </main>
    );
  }

  // Build absolute URL for server-side fetch to API
  const hdrs = headers();
  const proto = getHeader(hdrs, "x-forwarded-proto") || "https";
  const host = getHeader(hdrs, "x-forwarded-host") || getHeader(hdrs, "host");
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    vercelUrl ||
    (host ? `${proto}://${host}` : null) ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://www.clutchgg.lol");
  const profileUrl = `${baseUrl}/api/${mode}/profile?` + new URLSearchParams({ gameName, tagLine, region: region.toUpperCase() }).toString();
  const res = await fetch(profileUrl, { cache: "no-store" });
  const data = res.ok ? await res.json() : null;
  if (!data) {
    return (
      <main className="min-h-[60vh] grid place-items-center text-center p-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Failed to load card</h1>
          <p className="text-white/70">Please try again later.</p>
        </div>
      </main>
    );
  }

  // Map API data to card props
  const account = data.accountdata || {};
  const profile = data.profiledata || {};
  let title = "";
  let status = "";
  let avatarUrl = profile.profileIconId
    ? `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profile.profileIconId}.jpg`
    : "/images/default-avatar.png";

  let solo = null;
  if (mode === "league") {
    solo = data.rankeddata?.RANKED_SOLO_5x5 || null;
    if (solo) {
      const wr = solo.wins + solo.losses > 0 ? ((solo.wins / (solo.wins + solo.losses)) * 100).toFixed(1) : "0.0";
      title = `${solo.tier} ${solo.rank} • ${solo.leaguePoints} LP`;
      status = `${solo.wins}W-${solo.losses}L • ${wr}% WR`;
    } else {
      title = "Unranked";
      status = "Ranked Solo";
    }
    var flex = data.rankeddata?.RANKED_FLEX_SR || null;
  } else {
    const tft = Array.isArray(data.rankeddata)
      ? data.rankeddata.find((q) => q.queueType === "RANKED_TFT")
      : null;
    if (tft) {
      const wr = tft.wins + tft.losses > 0 ? ((tft.wins / (tft.wins + tft.losses)) * 100).toFixed(1) : "0.0";
      title = `${tft.tier}${tft.rank ? ` ${tft.rank}` : ""} • ${tft.leaguePoints} LP`;
      status = `${tft.wins}W-${tft.losses}L • ${wr}% WR`;
    } else {
      title = "Unranked";
      status = "Ranked TFT";
    }
  }

  const name = account.gameName || "";
  const handle = `${account.gameName || ""}#${account.tagLine || ""}`;
  const level = profile.summonerLevel || null;
  const regionUpper = region.toUpperCase();

  return (
    <CardPageChrome mode={mode} gameName={name} tagLine={account.tagLine} region={regionUpper}>
      {mode === "league" ? (
        <LeagueShareCard
          name={name}
          handle={handle}
          avatarUrl={avatarUrl}
          solo={solo}
          flex={flex}
          matchDetails={Array.isArray(data.matchdetails) ? data.matchdetails : []}
          puuid={account.puuid}
          region={regionUpper}
          level={level}
          titleText={title}
          statusText={status}
          mastery={Array.isArray(data.championmasterydata) ? data.championmasterydata : []}
        />
      ) : (
        <TFTShareCard
          handle={handle}
          region={regionUpper}
          level={level}
          tftRank={(() => {
            if (Array.isArray(data.rankeddata)) {
              const list = data.rankeddata;
              return (
                list.find((q) => q.queueType === "RANKED_TFT") ||
                list.find((q) => (q.queueType || "").includes("RANKED_TFT")) ||
                list[0] || null
              );
            }
            return data.rankeddata || null;
          })()}
          matchDetails={Array.isArray(data.matchdetails) ? data.matchdetails : []}
          puuid={profile.puuid || data.profiledata?.puuid}
        />
      )}
    </CardPageChrome>
  );
}
