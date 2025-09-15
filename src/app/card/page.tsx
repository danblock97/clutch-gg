import { supabase } from "@/lib/supabase";
import ProfileCard from "@/components/profile-card/ProfileCard";
import React from "react";

async function getClaim(gameName: string, tagLine: string, region: string, mode: "league" | "tft") {
  const { data: account } = await supabase
    .from("riot_accounts")
    .select("id, gamename, tagline, region")
    .eq("gamename", gameName)
    .eq("tagline", tagLine)
    .eq("region", region.toLowerCase())
    .maybeSingle();
  if (!account) return null;
  const { data: claim } = await supabase
    .from("profile_claims")
    .select("id")
    .eq("riot_account_id", account.id)
    .eq("mode", mode)
    .maybeSingle();
  return claim || null;
}

async function fetchProfile(mode: "league" | "tft", gameName: string, tagLine: string, region: string) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/${mode}/profile?` +
    new URLSearchParams({ gameName, tagLine, region: region.toUpperCase() }).toString();
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function CardPage({ searchParams }: { searchParams: { [k: string]: string } }) {
  const gameName = searchParams.gameName || "";
  const tagLine = searchParams.tagLine || "";
  const region = (searchParams.region || "euw1").toLowerCase();
  const mode = (searchParams.mode || "league").toLowerCase() as "league" | "tft";

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

  const data = await fetchProfile(mode, gameName, tagLine, region);
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

  if (mode === "league") {
    const solo = data.rankeddata?.RANKED_SOLO_5x5 || null;
    if (solo) {
      const wr = solo.wins + solo.losses > 0 ? ((solo.wins / (solo.wins + solo.losses)) * 100).toFixed(1) : "0.0";
      title = `${solo.tier} ${solo.rank} • ${solo.leaguePoints} LP`;
      status = `${solo.wins}W-${solo.losses}L • ${wr}% WR`;
    } else {
      title = "Unranked";
      status = "Ranked Solo";
    }
  } else {
    const tft = Array.isArray(data.rankeddata)
      ? data.rankeddata.find((q: any) => q.queueType === "RANKED_TFT")
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

  async function copyLink() {
    // no-op on server; this gets overridden client-side by default button behaviors
  }

  return (
    <main className="min-h-[60vh] grid place-items-center p-6">
      <ProfileCard
        name={name}
        title={title}
        handle={handle}
        status={status}
        contactText="Copy Link"
        avatarUrl={avatarUrl}
        showUserInfo={true}
        enableTilt={true}
        enableMobileTilt={false}
        onContactClick={copyLink}
      />
      <div className="mt-4 text-center text-sm text-white/70">
        <a
          className="underline hover:text-white"
          href={`/${mode}/profile?` + new URLSearchParams({ gameName, tagLine, region: region.toUpperCase() }).toString()}
        >
          View full profile
        </a>
      </div>
      <script dangerouslySetInnerHTML={{__html: `
        (function(){
          const btn=document.querySelector('.pc-contact-btn');
          if(!btn) return;
          btn.addEventListener('click', async function(){
            const url = window.location.href;
            try { await navigator.clipboard.writeText(url); btn.textContent = 'Copied!'; setTimeout(()=>btn.textContent='Copy Link', 2000);} catch(e){ console.error(e); }
          });
        })();
      `}} />
    </main>
  );
}

