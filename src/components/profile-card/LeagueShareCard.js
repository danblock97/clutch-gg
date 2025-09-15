"use client";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import ProfileCard from "./ProfileCard";

const championIcon = (id) =>
  `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${id}.png`;

export default function LeagueShareCard({
  name,
  handle,
  avatarUrl,
  solo,
  flex,
  region,
  level,
  statusText,
  titleText,
  mastery = [],
  matchDetails = [],
  puuid,
}) {
  const emblemUrl = solo?.tier
    ? `/images/league/rankedEmblems/${String(solo.tier).toLowerCase()}.webp`
    : null;

  const sortedMastery = useMemo(() => {
    const list = Array.isArray(mastery) ? mastery.slice() : [];
    list.sort((a,b)=> (b.championPoints||0) - (a.championPoints||0));
    return list;
  }, [mastery]);
  const top3 = useMemo(() => sortedMastery.slice(0,3), [sortedMastery]);

  // Resolve background from highest mastery champion
  const [bgUrl, setBgUrl] = useState(null);
  const [ddMap, setDdMap] = useState({});

  // Load DDragon champion mapping once (numeric key -> text id)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vr = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const versions = await vr.json();
        const latest = versions?.[0];
        if (!latest) return;
        const cr = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latest}/data/en_US/champion.json`);
        const cj = await cr.json();
        const map = {};
        for (const name in cj.data) {
          const c = cj.data[name];
          map[c.key] = c.id; // numeric string -> champion id string
        }
        if (!cancelled) setDdMap(map);
      } catch (e) {
        if (!cancelled) setDdMap({});
      }
    })();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!sortedMastery.length) return;
    const m = sortedMastery[0];
    const ddId = ddMap?.[String(m.championId)] || m.championName;
    const cname = (ddId || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!cname) return;
    const candidates = [
      `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/${cname}/skins/base/${cname}loadscreen.jpg`,
      `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/${cname}/skins/skin0/${cname}loadscreen_0.jpg`,
      `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/${cname}/skins/skin1/${cname}loadscreen_1.jpg`,
      `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${ddId}_0.jpg`,
    ];
    let cancelled = false;
    const tryNext = (i=0) => {
      if (cancelled || i>=candidates.length) return;
      const img = new Image();
      img.onload = () => { if (!cancelled) setBgUrl(candidates[i]); };
      img.onerror = () => tryNext(i+1);
      img.src = candidates[i];
    };
    tryNext(0);
    return () => { cancelled = true; };
  }, [sortedMastery, ddMap]);

  // Compute top-2 roles from recent matches
  const topRoles = useMemo(() => {
    const counts = new Map();
    const map = { MIDDLE: "MID", UTILITY: "SUPPORT" };
    (matchDetails||[]).slice(0,20).forEach((match) => {
      try {
        const me = (match.info?.participants || []).find(p => p.puuid === puuid);
        const role = map[me?.teamPosition] || me?.teamPosition;
        if (role && ["TOP","JUNGLE","MID","BOTTOM","SUPPORT"].includes(role)) {
          counts.set(role, (counts.get(role)||0)+1);
        }
      } catch {}
    });
    return Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]);
  }, [matchDetails, puuid]);

  const laneIcon = (role) => {
    const urls = {
      TOP: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-top.svg",
      JUNGLE: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-jungle.svg",
      MID: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-middle.svg",
      BOTTOM: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-bottom.svg",
      SUPPORT: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-utility.svg",
    };
    return urls[role];
  };
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, []);

  return (
    <ProfileCard
      className="tall dak-card"
      name={""}
      title={""}
      handle={""}
      status={""}
      avatarUrl={avatarUrl}
      contactText={copied ? "Copied!" : "Copy Link"}
      onContactClick={onCopy}
      showUserInfo={false}
      showAvatar={false}
      showBehindGradient={false}
      disableGlow={true}
      enableTilt
      enableMobileTilt={false}
      backgroundUrl={bgUrl || undefined}
      topOverlay={(
        <div className="dak-topbar">
          <div className="dak-pill dak-game"><span>League of Legends</span></div>
          <div style={{marginLeft:"auto", display:"flex", alignItems:"center", gap:8}}>
            {region ? <div className="dak-pill">{region}</div> : null}
            {topRoles.map((r)=> (
              <div key={r} className="dak-pill" style={{padding:"6px 8px"}}>
                <img src={laneIcon(r)} alt={r} style={{width:16,height:16,display:"block"}} />
              </div>
            ))}
          </div>
        </div>
      )}
      bottomOverlay={(
        <div>
          <div className="dak-name-row">
            <div className="dak-name">{handle}</div>
            {level ? <div className="dak-level">Lv. {level}</div> : null}
          </div>
          <div className="dak-stats">
            <div className="dak-rank">
              {emblemUrl ? <img src={emblemUrl} alt="Rank Emblem" /> : <div style={{width:44,height:44,borderRadius:8,background:'rgba(255,255,255,.08)'}}/>}
              <div>
                <div className="label">Solo Rank</div>
                <div className="value">{solo?.tier ? (<><span className="uppercase">{solo.tier}</span>{solo.rank ? <span> {solo.rank}</span> : null}</>) : 'Unranked'}</div>
              </div>
            </div>
            <div className="dak-metric"><div className="label">Win</div><div className="value">{solo && (solo.wins + solo.losses > 0) ? `${((solo.wins/(solo.wins+solo.losses))*100).toFixed(0)}%` : '0%'}</div></div>
            <div className="dak-metric"><div className="label">Win/Loss</div><div className="value">{solo ? `${solo.wins}-${solo.losses}` : '0-0'}</div></div>
          </div>
          <div className="dak-champs">
            {top3.map((m) => (
              <div className="dak-champ" key={m.championId}>
                <div className="icon"><img src={championIcon(m.championId)} alt="Champion" /></div>
                <div className="meta">{m.championName}<br/>{m.championPoints.toLocaleString()} pts</div>
              </div>
            ))}
          </div>

          {/* Footer stamp */}
          <div className="dak-stamp">ClutchGG.LOL</div>
        </div>
      )}
    />
  );
}
