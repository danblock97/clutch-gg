"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import ProfileCard from "./ProfileCard";
import { fetchTFTCompanions, getCompanionIconUrl } from "@/lib/tft/companionsApi";

export default function TFTShareCard({
  handle,
  region,
  level,
  tftRank, // object with tier, rank, leaguePoints, wins, losses
  matchDetails = [],
  puuid,
}) {
  const [companionsMap, setCompanionsMap] = useState({});
  const [bgUrl, setBgUrl] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const map = await fetchTFTCompanions();
        setCompanionsMap(map || {});
      } catch (e) {
        setCompanionsMap({});
      }
    })();
  }, []);

  // Determine most-used companion in recent matches
  const topCompanionId = useMemo(() => {
    const counts = new Map();
    (matchDetails || []).slice(0, 20).forEach((m) => {
      try {
        const me = (m.info?.participants || []).find((p) => p.puuid === puuid);
        const cid = me?.companion?.content_ID;
        if (cid) counts.set(cid, (counts.get(cid) || 0) + 1);
      } catch {}
    });
    let best = null;
    let max = -1;
    counts.forEach((v, k) => {
      if (v > max) {
        max = v;
        best = k;
      }
    });
    return best;
  }, [matchDetails, puuid]);

  useEffect(() => {
    if (!topCompanionId) return;
    const info = companionsMap[topCompanionId];
    const url = info ? getCompanionIconUrl(info.iconPath) : null;
    setBgUrl(url);
  }, [topCompanionId, companionsMap]);

  // Placements summary (last 20)
  const placements = useMemo(() => {
    const arr = [];
    (matchDetails || []).slice(0, 20).forEach((m) => {
      try {
        const me = (m.info?.participants || []).find((p) => p.puuid === puuid);
        if (typeof me?.placement === "number") arr.push(me.placement);
      } catch {}
    });
    return arr;
  }, [matchDetails, puuid]);

  const avgPlacement = placements.length
    ? (placements.reduce((a, b) => a + b, 0) / placements.length).toFixed(1)
    : "-";
  const top4Rate = placements.length
    ? Math.round((placements.filter((x) => x <= 4).length / placements.length) * 100)
    : 0;
  const firsts = placements.filter((x) => x === 1).length;

  const wr = tftRank && (tftRank.wins + tftRank.losses > 0)
    ? Math.round((tftRank.wins / (tftRank.wins + tftRank.losses)) * 100)
    : 0;

  // Prevent tier duplication when rank already contains tier (combined format)
  const displayTier = tftRank?.tier ? String(tftRank.tier).toUpperCase() : null;
  let displayDivision = "";
  if (tftRank && typeof tftRank.rank === "string") {
    const raw = tftRank.rank.trim();
    // If rank looks like "GOLD II" and tier is GOLD, extract last token as division
    const parts = raw.split(/\s+/);
    const last = parts[parts.length - 1];
    if (/^(I|II|III|IV|V)$/i.test(last)) {
      displayDivision = last.toUpperCase();
    } else if (displayTier && raw.toUpperCase().startsWith(displayTier)) {
      // Strip tier prefix if present
      const stripped = raw.toUpperCase().replace(displayTier, "").trim();
      if (/^(I|II|III|IV|V)$/i.test(stripped)) displayDivision = stripped.toUpperCase();
    }
  }

  const placementCells = () => {
    const seq = placements.slice(0, 20); // most recent 20
    const row1 = seq.slice(0, 10);
    const row2 = seq.slice(10, 20);
    const cls = (p) => (p === 1 ? "first" : p >= 2 && p <= 4 ? "top4" : "bot4");
    const Row = ({ data }) => (
      <div className="dak-placements-row">
        {data.map((p, i) => (
          <div key={i} className={`cell ${cls(p)}`} title={`Placement ${p}`}>{p}</div>
        ))}
      </div>
    );
    return (
      <div className="dak-placements-rows">
        <Row data={row1} />
        {row2.length > 0 && <Row data={row2} />}
      </div>
    );
  };

  return (
    <ProfileCard
      className="tall dak-card"
      name={""}
      title={""}
      handle={""}
      status={""}
      avatarUrl={"/images/default-avatar.png"}
      contactText={"Copy Link"}
      onContactClick={async () => {
        try { await navigator.clipboard.writeText(window.location.href); } catch {}
      }}
      showUserInfo={false}
      showAvatar={false}
      showBehindGradient={false}
      disableGlow={true}
      enableTilt
      enableMobileTilt={false}
      backgroundUrl={bgUrl || undefined}
      topOverlay={(
        <div className="dak-topbar">
          <div className="dak-pill dak-game"><span>Teamfight Tactics</span></div>
          {region ? <div style={{ marginLeft: "auto" }} className="dak-pill">{region}</div> : null}
        </div>
      )}
      bottomOverlay={(
        <div>
          {/* Center legend (if available) */}
          {bgUrl && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 6, marginBottom: 8 }}>
              <div style={{ width: 72, height: 72, borderRadius: 9999, overflow: "hidden", border: "1px solid rgba(255,255,255,.18)", background: "rgba(0,0,0,.25)" }}>
                <img src={bgUrl} alt="Legend" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          )}

          {/* Name and Level */}
          <div className="dak-name-row">
            <div className="dak-name">{handle}</div>
            {level ? <div className="dak-level">Lv. {level}</div> : null}
          </div>

          {/* Rank + WR + W/L */}
          <div className="dak-stats">
            <div className="dak-rank">
              {tftRank?.tier ? (
                <img src={`/images/league/rankedEmblems/${String(tftRank.tier).toLowerCase()}.webp`} alt="Rank Emblem" />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 8, background: "rgba(255,255,255,.08)" }} />
              )}
              <div>
                <div className="label">Rank</div>
                <div className="value">
                  {tftRank?.tier ? (
                    <>
                      <span className="uppercase">{displayTier}</span>
                      {displayDivision ? <span> {displayDivision}</span> : null}
                      {typeof tftRank.leaguePoints === "number" ? <span> • {tftRank.leaguePoints} LP</span> : null}
                    </>
                  ) : (
                    "Unranked"
                  )}
                </div>
              </div>
            </div>
            <div className="dak-metric"><div className="label">Win</div><div className="value">{wr}%</div></div>
            <div className="dak-metric"><div className="label">Win/Loss</div><div className="value">{tftRank ? `${tftRank.wins}-${tftRank.losses}` : '0-0'}</div></div>
          </div>

          {/* Last 20 placements */}
          <div style={{ marginTop: 10 }}>
            <div className="dak-metric" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              <div><div className="label">Avg Place</div><div className="value">{avgPlacement}</div></div>
              <div><div className="label">Top 4</div><div className="value">{top4Rate}%</div></div>
              <div><div className="label">1st</div><div className="value">{firsts}</div></div>
            </div>
            {placementCells()}
          </div>

          <div className="dak-stamp">ClutchGG.LOL</div>
        </div>
      )}
    />
  );
}
