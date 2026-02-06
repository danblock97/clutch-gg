import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { buildProfileUrl } from "@/lib/utils/urlHelpers";
import { FaShieldAlt, FaDesktop } from "react-icons/fa";

/* -------------------- GAME MODE & RANK HELPER -------------------- */
function getModeAndRankStatus(gameMode, queueId) {
	let modeName = "";
	let isRanked = false;
	const normalizedMode = (gameMode || "").toUpperCase();

	switch (normalizedMode) {
		case "CLASSIC":
			modeName = "Summoner's Rift";
			// Check if queue is Solo/Duo or Flex
			if (queueId === 420 || queueId === 440) {
				isRanked = true;
			}
			break;
		case "ARAM":
			modeName = "ARAM";
			break;
		case "KIWI":
		case "ARAMMAYHEM":
			modeName = "ARAM Mayhem";
			break;
		case "URF":
			modeName = "URF";
			break;
		case "ONEFORALL":
			modeName = "One For All";
			break;
		case "ODIN":
			modeName = "Dominion";
			break;
		case "ASCENSION":
			modeName = "Ascension";
			break;
		case "KINGPORO":
			modeName = "Legend of the Poro King";
			break;
		case "NEXUSBLITZ":
			modeName = "Nexus Blitz";
			break;
		case "ULTBOOK":
			modeName = "Ultimate Spellbook";
			break;
		case "RUBY":
			modeName = "Doombots";
			break;
		case "PRACTICETOOL":
			modeName = "Practice Tool";
			break;
		case "TUTORIAL":
			modeName = "Tutorial";
			break;
		case "CHERRY":
			// Riot calls it "CHERRY", but it's actually Arena
			modeName = "Arena";
			break;
		default:
			modeName = gameMode || normalizedMode || "Unknown Mode";
			break;
	}

	return { modeName, isRanked };
}

/* -------------------- CDRAGON PATH -------------------- */
function mapCDragonAssetPath(p) {
	if (!p) return null;
	const lower = p.toLowerCase().replace("/lol-game-data/assets", "");
	return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${lower}`;
}

/* -------------------- FETCH PERKS -------------------- */
async function fetchPerks() {
	const r = await fetch(
		"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perks.json"
	);
	return r.json();
}

/* -------------------- HELPER FUNCTIONS -------------------- */
// Map rank to theme color variables for borders and accents
function getRankColorVar(shortRank) {
	switch ((shortRank || "").toLowerCase()) {
		case "iron":
			return "var(--iron)";
		case "bronze":
			return "var(--bronze)";
		case "silver":
			return "var(--silver)";
		case "gold":
			return "var(--gold)";
		case "platinum":
			return "var(--platinum)";
		case "emerald":
			return "var(--emerald)";
		case "diamond":
			return "var(--diamond)";
		case "master":
			return "var(--master)";
		case "grandmaster":
			return "var(--grandmaster)";
		case "challenger":
			return "var(--challenger)";
		default:
			return "#4b5563";
	}
}

function getRankBorderColor(shortRank) {
	const base = getRankColorVar(shortRank);
	return `color-mix(in srgb, ${base} 45%, transparent)`;
}

// Normalize Riot ID and provide streamer mode fallback
function formatRiotId(gameName, tagLine) {
	const name = (gameName || "").trim();
	const tag = (tagLine || "").trim();
	if (!name && !tag) {
		return { name: "STREAMER MODE", tag: "" };
	}
	return { name: name || "STREAMER MODE", tag };
}

/* -------------------- MAIN COMPONENT -------------------- */
export default function LiveGame({ liveGameData, region }) {
	const [perkList, setPerkList] = useState([]);
	const [showSpectateInfo, setShowSpectateInfo] = useState(false);
	const [champMap, setChampMap] = useState({});

	const handleSpectate = () => {
		try {
			const encryptionKey = liveGameData?.observers?.encryptionKey;
			const platformId = (region || "").toUpperCase();
			const gameId = liveGameData?.gameId;
			if (!encryptionKey || !platformId || !gameId) return;
			const params = new URLSearchParams({
				platformId,
				encryptionKey,
				gameId: String(gameId),
			});
			if (typeof window !== "undefined") {
				window.open(`/api/league/spectate?${params.toString()}`);
				setShowSpectateInfo(true);
			}
		} catch (e) {}
	};

	// Load perks
	useEffect(() => {
		(async () => {
			try {
				const perks = await fetchPerks();
				setPerkList(perks);
			} catch (err) {
				console.error("Error fetching perks:", err);
				setPerkList([]);
			}
		})();
	}, [liveGameData]);

	// Load champion mapping (ddragon id lookup by numeric championId)
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
					map[c.key] = c.id; // key is numeric string
				}
				if (!cancelled) setChampMap(map);
			} catch (e) {
				if (!cancelled) setChampMap({});
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const getPerkById = (id) => perkList.find((x) => x.id === id) || null;
	const fmtRank = (r) => {
		if (!r || typeof r !== "string") return "Unranked";
		return r;
	};

	const { modeName, isRanked } = getModeAndRankStatus(
		liveGameData.gameMode,
		liveGameData.gameQueueConfigId
	);

	const isArenaQueue =
		liveGameData.gameQueueConfigId === 1700 || liveGameData.gameQueueConfigId === 1710;

	// Order participants by team then by common role order
	const sortedParticipants = [...(liveGameData.participants || [])].sort((a, b) => {
		if (a.teamId !== b.teamId) return a.teamId - b.teamId;
		const roleOrder = { TOP: 1, JUNGLE: 2, MIDDLE: 3, BOTTOM: 4, UTILITY: 5 };
		const aPosition = a.individualPosition || a.teamPosition || "";
		const bPosition = b.individualPosition || b.teamPosition || "";
		return (roleOrder[aPosition] || 99) - (roleOrder[bPosition] || 99);
	});

	const getLoadscreenUrl = (championId) => {
		const ddId = champMap?.[String(championId)];
		if (!ddId) return null;
		const folder = String(ddId).toLowerCase().replace(/[^a-z0-9]/g, "");
		return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/${folder}/skins/base/images/${folder}_splash_centered_0.jpg`;
	};

	// Known loadscreens that do not reside in skins/base
	const LOADSCREEN_OVERRIDES = {
		hwei: [`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/hwei/skins/skin1/images/hwei_splash_centered_1.jpg`]
	};

	// Cache resolved urls to avoid repeat probing and flicker
	const LOADSCREEN_CACHE = new Map();

	// Resilient loadscreen image that tries multiple CDragon paths
	const ChampionLoadscreen = React.memo(function ChampionLoadscreen({ championId }) {
		const ddId = champMap?.[String(championId)];
		const name = ddId ? String(ddId).toLowerCase().replace(/[^a-z0-9]/g, "") : null;
		const defaultCandidates = name
			? [
				`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/${name}/skins/base/images/${name}_splash_centered_0.jpg`,
				(ddId ? `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${ddId}_0.jpg` : null)
			].filter(Boolean)
			: [];
		const candidates = name && LOADSCREEN_OVERRIDES[name] ? LOADSCREEN_OVERRIDES[name] : defaultCandidates;
		const fallbackIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${championId}.png`;
		const cached = LOADSCREEN_CACHE.get(championId);
		const [resolvedSrc, setResolvedSrc] = useState(cached || null);

		useEffect(() => {
			if (resolvedSrc) return; // already have one
			let cancelled = false;
			const tryUrlsSequentially = (list, i = 0) => {
				if (cancelled) return;
				if (!list || i >= list.length) {
					LOADSCREEN_CACHE.set(championId, fallbackIcon);
					setResolvedSrc(fallbackIcon);
					return;
				}
				const test = new window.Image();
				test.onload = () => {
					if (!cancelled) {
						LOADSCREEN_CACHE.set(championId, list[i]);
						setResolvedSrc(list[i]);
					}
				};
				test.onerror = () => tryUrlsSequentially(list, i + 1);
				test.src = list[i];
			};
			tryUrlsSequentially(candidates);
			return () => {
				cancelled = true;
			};
		}, [championId, name, resolvedSrc]);

		if (!resolvedSrc) {
			return <div className="w-full h-full" />; // avoid initial swap flicker
		}
		return <Image src={resolvedSrc} alt="" fill className="object-cover object-center opacity-80" loading="eager" priority sizes="300px" />;
	}, (prev, next) => prev.championId === next.championId);

	// Participant card component, memoized to ignore timer re-renders
	const ParticipantCard = React.memo(function ParticipantCard({ p, perkList, champMapProp, regionProp, isArena }) {
		const getPerkByIdLocal = (id) => perkList.find((x) => x.id === id) || null;
		const getGamesAndWrLocal = (pp) => {
			const total = (pp.wins || 0) + (pp.losses || 0);
			const wr = total > 0 ? Math.round((pp.wins / total) * 1000) / 10 : 0;
			return { total, wr };
		};
		const runeIcons = (Array.isArray(p?.perks?.perkIds) ? p.perks.perkIds : [])
			.slice(0, 4)
			.map((id) => {
				const obj = getPerkByIdLocal(id);
				return obj?.iconPath ? mapCDragonAssetPath(obj.iconPath) : null;
			})
			.filter(Boolean);
		const primaryRuneIcon = runeIcons[0] || null;
		const additionalRuneIcons = runeIcons.slice(1);
		const { total, wr } = getGamesAndWrLocal(p);
		const rankTxt = fmtRank(p.rank);
		const shortRank = rankTxt !== "Unranked" ? rankTxt.split(" ")[0].toLowerCase() : null;
		const spells = [p.spell1Id, p.spell2Id];
		const riotId = formatRiotId(p.gameName, p.tagLine);
		const hasProfileLink = !!(p.gameName && p.gameName.trim() && p.tagLine && p.tagLine.trim());

		return (
			<div className="relative group rounded-xl border bg-[#0f1117] shadow-sm hover:shadow-md transition-shadow overflow-visible" style={{ borderColor: getRankBorderColor(shortRank || "") }}>
				<div className="absolute inset-px z-0 rounded-[inherit] overflow-hidden">
					{!isArena ? (
						<ChampionLoadscreen championId={p.championId} />
					) : (
						<Image src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`} alt="" fill className="object-cover object-center opacity-80" />
					)}
				</div>
				<div className="absolute inset-px z-10 rounded-[inherit] bg-gradient-to-b from-black/15 via-black/40 to-black/80" />
				<div className="absolute inset-px z-20 rounded-[inherit] pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_52%,_rgba(17,17,27,0.65)_100%)]" />
				{rankTxt !== "Unranked" && (
					<div className="absolute -top-1 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
						{/* Short connectors to visually merge with the top border */}
						<span className="absolute right-full top-1/2 -translate-y-1/2 h-px w-3" style={{ backgroundColor: getRankBorderColor(shortRank || "") }}></span>
						<span className="absolute left-full top-1/2 -translate-y-1/2 h-px w-3" style={{ backgroundColor: getRankBorderColor(shortRank || "") }}></span>
						{/* Mask only the section under the text so the top border appears cut */}
						<span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-px w-12" style={{ backgroundColor: 'var(--background)' }}></span>
						{/* Tier text */}
						<span className="relative px-1.5 text-[12px] font-black uppercase tracking-widest" style={{ color: getRankColorVar(shortRank || "") }}>
							{(rankTxt.match(/\b(I{1,4})\b/) || [null, ""])?.[1]}
						</span>
					</div>
				)}
				<div className="relative z-30 h-96 pt-6 px-3 pb-3 sm:pt-6 sm:px-3 flex flex-col">
					<div className="text-[10px] sm:text-xs text-gray-300 flex flex-col items-center">
						<div className="font-semibold truncate max-w-[80%] text-center text-gray-300">
							{p.championName || champMapProp[String(p.championId)] || ""}
						</div>
						<div className="opacity-95 mt-0.5 text-center text-gray-400">
							{rankTxt !== "Unranked" ? (total > 0 ? `${total} games • ${wr}% WR` : "No champion stats") : "No ranked games"}
						</div>
					</div>
					<div className="mt-auto" />
					<div className="flex items-center gap-1">
						{spells.map((id, i) => (
							<div key={`s-${i}`} className="relative w-4 h-4 rounded overflow-hidden border border-black/30">
								<Image src={`/images/league/summonerSpells/${id}.png`} alt="" fill className="object-cover" />
							</div>
						))}
						<div className="relative w-4 h-4 rounded overflow-hidden border border-black/30">
							{primaryRuneIcon ? (
								<Image src={primaryRuneIcon} alt="" fill className="object-cover" />
							) : (
								<div className="w-full h-full bg-gray-700" />
							)}
						</div>
						{additionalRuneIcons.map((src, i) => (
							<div key={`r-${i}`} className="relative w-4 h-4 rounded overflow-hidden border border-black/30">
								<Image src={src} alt="" fill className="object-cover" />
							</div>
						))}
					</div>
					<div className="mt-2">
						{hasProfileLink ? (
							<Link
								href={buildProfileUrl("league", regionProp, p.gameName, p.tagLine) || 
									`/league/profile?gameName=${encodeURIComponent(p.gameName)}&tagLine=${encodeURIComponent(p.tagLine)}&region=${encodeURIComponent(regionProp)}`}
								className="text-white font-semibold text-[13px] sm:text-[15px] hover:underline truncate block text-center"
							>
								{riotId.name}
								{riotId.tag && <span className="text-gray-400 text-xs ml-1">#{riotId.tag}</span>}
							</Link>
						) : (
							<div className="text-white font-semibold text-[13px] sm:text-[15px] truncate text-center">
								{riotId.name}
							</div>
						)}
						<div className="text-[10px] text-gray-300/90 mt-0.5 flex items-center justify-center gap-1 leading-tight">
							{rankTxt !== "Unranked" && (
								<span className="relative inline-block w-8 h-8 mr-1 align-middle">
									<Image src={`/images/league/rankedEmblems/${shortRank}.webp`} alt="" fill className="object-contain" />
								</span>
							)}
							<span className="text-[--primary] font-semibold whitespace-nowrap">{rankTxt !== "Unranked" ? `${p.lp} LP` : "Unranked"}</span>
							{rankTxt !== "Unranked" && <span className="text-gray-500">•</span>}
							<span className="text-[9px] whitespace-nowrap">{wr}%</span>
							<span className="text-[9px] text-gray-400 whitespace-nowrap">({p.wins}W-{p.losses}L)</span>
						</div>
					</div>
				</div>
			</div>
		);
	}, (prev, next) => prev.p === next.p && prev.perkList === next.perkList && prev.champMapProp === next.champMapProp && prev.regionProp === next.regionProp && prev.isArena === next.isArena);

	// --- Card grid view (replaces table)
	const renderCardGrid = () => {
		const blueTeam = sortedParticipants.filter((p) => p.teamId === 100).slice(0, 5);
		const redTeam = sortedParticipants.filter((p) => p.teamId === 200).slice(0, 5);
		return (
			<div className="space-y-3">
				<div className="grid grid-cols-5 gap-3">
					{blueTeam.map((p) => (
						<ParticipantCard key={`${p.teamId}-${p.summonerId || p.puuid || p.gameName}-${p.championId}`} p={p} perkList={perkList} champMapProp={champMap} regionProp={region} isArena={isArenaQueue} />
					))}
				</div>
				<div className="grid grid-cols-5 gap-3">
					{redTeam.map((p) => (
						<ParticipantCard key={`${p.teamId}-${p.summonerId || p.puuid || p.gameName}-${p.championId}`} p={p} perkList={perkList} champMapProp={champMap} regionProp={region} isArena={isArenaQueue} />
					))}
				</div>
			</div>
		);
	};

	// Timer displayed in header only; isolates 1s updates from the card grid
	const Timer = React.memo(function Timer({ start }) {
		const [txt, setTxt] = useState("");
		useEffect(() => {
			const update = () => {
				const now = Date.now();
				const dur = now - start;
				const s = Math.floor((dur / 1000) % 60);
				const m = Math.floor((dur / 60000) % 60);
				const h = Math.floor(dur / 3600000);
				setTxt(`${h > 0 ? h + "h " : ""}${m}m ${s}s`);
			};
			update();
			const id = setInterval(update, 1000);
			return () => clearInterval(id);
		}, [start]);
		return <span className="font-mono">{txt}</span>;
	});

	/* -------------------- ARENA LAYOUT (QueueID 1700) -------------------- */
	if (
		liveGameData.gameQueueConfigId === 1700 ||
		liveGameData.gameQueueConfigId === 1710
	) {
		// Arena typically has 8 or 16 participants. We just place them in a responsive grid.
		return (
			<div className="bg-[#13151b] text-white rounded-md shadow-lg w-full max-w-screen-xl mx-auto mt-4">
				{/* Enhanced Header with Mode, Time, and View Toggle */}
				<div className="py-3 px-4 text-sm font-bold bg-gray-900 rounded-t-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
					<div className="flex items-center">
						<div className="flex items-center gap-2">
							<span className="px-2 py-0.5 bg-[--primary]/20 text-[--primary] rounded">
								LIVE
							</span>
							<span>{modeName}</span>
						</div>
						<div className="hidden md:flex items-center ml-4 text-xs bg-black/30 rounded px-2 py-0.5">
							<FaShieldAlt className="text-[--secondary] mr-1" />
							<span>{liveGameData.participants.length} Players</span>
						</div>
					</div>

					<div className="flex items-center gap-4">
						{/* Time Counter */}
						<div className="flex items-center">
							<div className="flex h-2 w-2 relative mr-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
							</div>
							<Timer start={liveGameData.gameStartTime} />
						</div>
					<button
						onClick={handleSpectate}
						disabled={!liveGameData?.observers?.encryptionKey}
						className={`btn-spectate ml-2 text-xs`}
					>
							Spectate
						</button>
					</div>
				</div>

				{/* Card grid view for Arena as well */}
				{renderCardGrid()}

				{/* Footer with game details */}
				<div className="py-2 px-4 text-[11px] text-[--text-secondary] border-t border-gray-700/30 flex justify-between">
					<div>
						Game started{" "}
						{new Date(liveGameData.gameStartTime).toLocaleTimeString()}
					</div>
					<div>Mode: {modeName}</div>
				</div>
			</div>
		);
	}

	/* -------------------- STANDARD LAYOUT (Summoner's Rift, ARAM, etc) -------------------- */
	return (
		<div className="bg-[#13151b] text-white rounded-md shadow-lg w-full max-w-screen-xl mx-auto mt-4">
			{/* Enhanced Header with Mode, Time, and View Toggle */}
			<div className="py-3 px-4 text-sm font-bold bg-gray-900 rounded-t-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
				<div className="flex items-center">
					<div className="flex items-center gap-2">
						<span className="px-2 py-0.5 bg-[--primary]/20 text-[--primary] rounded">
							LIVE
						</span>
						<span>
							{modeName}
							{isRanked ? " (Ranked)" : ""}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-4">
					{/* Time Counter */}
					<div className="flex items-center">
						<div className="flex h-2 w-2 relative mr-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
						</div>
						<Timer start={liveGameData.gameStartTime} />
					</div>
					<button
						onClick={handleSpectate}
						disabled={!liveGameData?.observers?.encryptionKey}
						className={`btn-spectate ml-2`}
					>
						<FaDesktop className="w-4 h-4" />
						Spectate
					</button>
				</div>
			</div>

			{/* Card grid view */}
			{renderCardGrid()}

			{/* Footer with game details */}
			<div className="py-2 px-4 text-[11px] text-[--text-secondary] border-t border-gray-700/30 flex justify-between">
				<div>
					Game started{" "}
					{new Date(liveGameData.gameStartTime).toLocaleTimeString()}
				</div>
				<div>
					Mode: {modeName}
					{isRanked ? " (Ranked)" : ""}
				</div>
			</div>
			{showSpectateInfo && (
				<div className="fixed inset-0 z-[10000] bg-black/70" onClick={() => setShowSpectateInfo(false)}>
					<div className="absolute left-1/2 -translate-x-1/2 top-6 w-full max-w-lg px-4">
						<div className="bg-[#1b1b2d] text-white rounded-xl border border-gray-700 shadow-2xl overflow-hidden animate-fade-down" onClick={(e) => e.stopPropagation()}>
							<div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
								<h3 className="text-base font-semibold tracking-wide">How to spectate</h3>
								<button aria-label="Close" className="text-gray-400 hover:text-white transition" onClick={() => setShowSpectateInfo(false)}>✕</button>
							</div>
							<div className="px-4 py-4 text-sm space-y-3">
								<ol className="list-decimal ml-5 space-y-1.5">
									<li>Double‑click the downloaded file</li>
									<li>If SmartScreen appears: More info → Run anyway</li>
									<li>Wait for the spectator delay, then the game will open</li>
								</ol>
								<p className="text-xs text-gray-400">You can open the file to inspect its contents anytime.</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
