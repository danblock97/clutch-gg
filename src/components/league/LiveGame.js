import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { FaChartLine, FaSkull, FaShieldAlt, FaDesktop } from "react-icons/fa";

/* -------------------- GAME MODE & RANK HELPER -------------------- */
function getModeAndRankStatus(gameMode, queueId) {
	let modeName = "";
	let isRanked = false;

	switch (gameMode) {
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
			modeName = gameMode || "Unknown Mode";
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

/* -------------------- PARSE LIVE GAME PERKS -------------------- */
function parseSpectatorPerks(perks) {
	if (!perks?.perkIds) return null;
	const { perkIds, perkStyle, perkSubStyle } = perks;
	const c = perkIds.length;

	if (c < 4) {
		return {
			styles: [
				{
					description: "primaryStyle",
					style: perkStyle,
					selections: perkIds.map((id) => ({ perk: id })),
				},
				{ description: "subStyle", style: perkSubStyle, selections: [] },
			],
			statPerks: {},
		};
	}

	const keystone = perkIds[0];
	const primaryRunes = perkIds.slice(1, 4);
	let subRunes = perkIds.slice(4, 6);
	let shards = perkIds.slice(6);

	if (c < 6) subRunes = [];
	if (c < 7) shards = [];

	return {
		styles: [
			{
				description: "primaryStyle",
				style: perkStyle,
				selections: [
					{ perk: keystone },
					...primaryRunes.map((x) => ({ perk: x })),
				],
			},
			{
				description: "subStyle",
				style: perkSubStyle,
				selections: subRunes.map((x) => ({ perk: x })),
			},
		],
		statPerks: {
			offense: shards[0],
			flex: shards[1],
			defense: shards[2],
		},
	};
}

/*
  ============================
  Refactored PortalTooltip
  ============================
*/
function PortalTooltip({ children, top, left, flipAbove }) {
	// SSR guard
	if (typeof document === "undefined") return null;

	const tooltipPosition = {
		top: top || 0,
		left: left || 0,
	};

	return ReactDOM.createPortal(
		<div
			className={`
        absolute z-[9999] 
        px-3 py-2 
        bg-gradient-to-br from-[#232337] to-[#1b1b2d] text-white 
        rounded-md shadow-lg
        text-xs sm:text-sm
        transform -translate-x-1/2
        w-[90%] max-w-xs 
        sm:w-auto sm:max-w-sm
      `}
			style={tooltipPosition}
		>
			{/* Tooltip arrow */}
			<div
				className={`
          absolute left-1/2 -translate-x-1/2 w-0 h-0
          border-x-4 border-x-transparent
          ${
						flipAbove
							? "border-b-4 border-b-gray-800"
							: "border-t-4 border-t-gray-800"
					}
        `}
				style={
					flipAbove
						? { top: "auto", bottom: "-4px" }
						: { top: "-4px", bottom: "auto" }
				}
			/>
			{children}
		</div>,
		document.body
	);
}

/* -------------------- FULL RUNE TOOLTIP -------------------- */
function FullRuneTooltip({ data, getPerk }) {
	if (!data?.styles) return null;
	const primary = data.styles.find((s) => s.description === "primaryStyle");
	const sub = data.styles.find((s) => s.description === "subStyle");
	const ps = primary?.selections || [];
	const ss = sub?.selections || [];
	const sp = data.statPerks || {};

	return (
		<div className="space-y-3">
			{primary && (
				<div>
					<div className="font-bold mb-1 text-[0.65rem] sm:text-xs uppercase">
						Primary: {getPerk(primary.style)?.name}
					</div>
					<div className="flex flex-wrap">
						{ps.map((sel, i) => {
							const perkObj = getPerk(sel.perk);
							if (!perkObj) return null;
							return (
								<div
									key={i}
									className="mr-2 mb-2 flex items-center text-[0.65rem] sm:text-xs"
								>
									<Image
										src={mapCDragonAssetPath(perkObj.iconPath)}
										alt=""
										width={16}
										height={16}
										className="mr-1"
									/>
									{perkObj.name}
								</div>
							);
						})}
					</div>
				</div>
			)}
			{sub && (
				<div>
					<div className="font-bold mb-1 text-[0.65rem] sm:text-xs uppercase">
						Secondary: {getPerk(sub.style)?.name}
					</div>
					<div className="flex flex-wrap">
						{ss.map((sel, i) => {
							const perkObj = getPerk(sel.perk);
							if (!perkObj) return null;
							return (
								<div
									key={i}
									className="mr-2 mb-2 flex items-center text-[0.65rem] sm:text-xs"
								>
									<Image
										src={mapCDragonAssetPath(perkObj.iconPath)}
										alt=""
										width={16}
										height={16}
										className="mr-1"
									/>
									{perkObj.name}
								</div>
							);
						})}
					</div>
				</div>
			)}
			{Object.values(sp).length > 0 && (
				<div>
					<div className="font-bold mb-1 text-[0.65rem] sm:text-xs uppercase">
						Stat Shards
					</div>
					<div className="flex flex-wrap">
						{Object.values(sp).map((id, i) => {
							const perkObj = getPerk(id);
							if (!perkObj) return null;
							return (
								<div
									key={i}
									className="mr-2 mb-2 flex items-center text-[0.65rem] sm:text-xs"
								>
									<Image
										src={mapCDragonAssetPath(perkObj.iconPath)}
										alt=""
										width={16}
										height={16}
										className="mr-1"
									/>
									{perkObj.name}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

/* -------------------- HOVER KEYSTONE ICON -------------------- */
function HoverableRuneIcon({ perks, getPerk }) {
	const parsed = parseSpectatorPerks(perks);
	let keystoneIcon = null;

	if (parsed?.styles) {
		const prim = parsed.styles.find((s) => s.description === "primaryStyle");
		const keyId = prim?.selections?.[0]?.perk;
		const obj = getPerk(keyId);
		if (obj?.iconPath) keystoneIcon = mapCDragonAssetPath(obj.iconPath);
	}

	const ref = useRef(null);
	const [hov, setHov] = useState(false);
	const [coord, setCoord] = useState({ top: 0, left: 0 });
	const [flip, setFlip] = useState(false);

	const onEnter = () => {
		if (!ref.current) return;
		const r = ref.current.getBoundingClientRect();
		const sy = window.scrollY || document.documentElement.scrollTop;
		const sx = window.scrollX || document.documentElement.scrollLeft;
		// Approximate potential tooltip height
		const h = 260;
		const spaceBelow = window.innerHeight - r.bottom;
		const shouldFlip = spaceBelow < h;
		setFlip(shouldFlip);

		const tooltipTop = shouldFlip ? r.top + sy - h - 8 : r.bottom + sy + 8;
		const tooltipLeft = r.left + sx + r.width / 2;

		setCoord({ top: tooltipTop, left: tooltipLeft });
		setHov(true);
	};

	return (
		<div
			ref={ref}
			onMouseEnter={onEnter}
			onMouseLeave={() => setHov(false)}
			className="inline-block"
		>
			{keystoneIcon ? (
				<Image src={keystoneIcon} alt="" width={20} height={20} />
			) : (
				<div className="w-5 h-5 bg-gray-700 rounded" />
			)}
			{hov && parsed && (
				<PortalTooltip top={coord.top} left={coord.left} flipAbove={flip}>
					<FullRuneTooltip data={parsed} getPerk={getPerk} />
				</PortalTooltip>
			)}
		</div>
	);
}

/* -------------------- HELPER FUNCTIONS -------------------- */
// Helper function to get winrate color
function getWinrateColor(winrate) {
	if (winrate >= 65) return "text-green-500";
	if (winrate >= 55) return "text-green-400";
	if (winrate >= 50) return "text-blue-400";
	if (winrate >= 45) return "text-yellow-400";
	return "text-red-400";
}

// Helper function to get team color class
function getTeamColorClass(teamId) {
	return teamId === 100 ? "text-blue-400" : "text-red-400";
}

// Helper function to get team name
function getTeamName(teamId) {
	return teamId === 100 ? "Blue Team" : "Red Team";
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
		return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/${folder}/skins/base/${folder}loadscreen.jpg`;
	};

	// --- Card helpers
	const getGamesAndWr = (p) => {
		const total = (p.wins || 0) + (p.losses || 0);
		const wr = total > 0 ? Math.round((p.wins / total) * 1000) / 10 : 0;
		return { total, wr };
	};

	const getPrimaryRuneIds = (perks) => {
		const parsed = parseSpectatorPerks(perks);
		if (!parsed?.styles) return [];
		const prim = parsed.styles.find((s) => s.description === "primaryStyle");
		const ids = prim?.selections?.slice(0, 4)?.map((s) => s.perk) || [];
		return ids;
	};

	const getRuneIconUrl = (id) => {
		const obj = getPerkById(id);
		return obj?.iconPath ? mapCDragonAssetPath(obj.iconPath) : null;
	};

	// Known loadscreens that do not reside in skins/base
	const LOADSCREEN_OVERRIDES = {
		hwei: [`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/hwei/skins/skin1/hweiloadscreen_1.jpg`]
	};

	// Cache resolved urls to avoid repeat probing and flicker
	const LOADSCREEN_CACHE = new Map();

	// Resilient loadscreen image that tries multiple CDragon paths
	const ChampionLoadscreen = React.memo(function ChampionLoadscreen({ championId }) {
		const ddId = champMap?.[String(championId)];
		const name = ddId ? String(ddId).toLowerCase().replace(/[^a-z0-9]/g, "") : null;
		const defaultCandidates = name
			? [
				`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/${name}/skins/base/${name}loadscreen.jpg`,
				`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/${name}/skins/skin0/${name}loadscreen_0.jpg`,
				`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/${name}/skins/skin1/${name}loadscreen_1.jpg`
			]
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
		return <Image src={resolvedSrc} alt="" fill className="object-cover object-center" loading="eager" priority sizes="300px" />;
	}, (prev, next) => prev.championId === next.championId);

	// Participant card component, memoized to ignore timer re-renders
	const ParticipantCard = React.memo(function ParticipantCard({ p, perkList, champMapProp, regionProp, isArena }) {
		const getPerkByIdLocal = (id) => perkList.find((x) => x.id === id) || null;
		const getGamesAndWrLocal = (pp) => {
			const total = (pp.wins || 0) + (pp.losses || 0);
			const wr = total > 0 ? Math.round((pp.wins / total) * 1000) / 10 : 0;
			return { total, wr };
		};
		const parsePrimaryRuneIds = (perks) => {
			const parsed = parseSpectatorPerks(perks);
			if (!parsed?.styles) return [];
			const prim = parsed.styles.find((s) => s.description === "primaryStyle");
			return prim?.selections?.slice(0, 4)?.map((s) => s.perk) || [];
		};
		const runeIcons = parsePrimaryRuneIds(p.perks)
			.map((id) => {
				const obj = getPerkByIdLocal(id);
				return obj?.iconPath ? mapCDragonAssetPath(obj.iconPath) : null;
			})
			.filter(Boolean);
		const { total, wr } = getGamesAndWrLocal(p);
		const rankTxt = fmtRank(p.rank);
		const shortRank = rankTxt !== "Unranked" ? rankTxt.split(" ")[0].toLowerCase() : null;
		const spells = [p.spell1Id, p.spell2Id];

		return (
			<div className="relative group rounded-xl overflow-hidden border border-gray-700/60 bg-[#0f1117] shadow-sm hover:shadow-md transition-shadow">
				<div className="absolute inset-0">
					{!isArena ? (
						<ChampionLoadscreen championId={p.championId} />
					) : (
						<Image src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`} alt="" fill className="object-cover object-center" />
					)}
				</div>
				<div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/40 to-black/80" />
				<div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_52%,_rgba(17,17,27,0.65)_100%)]" />
				<div className="relative h-80 p-3 sm:p-3 flex flex-col">
					<div className="text-[10px] sm:text-xs text-gray-300 flex flex-col items-center">
						<div className="font-semibold truncate max-w-[80%] text-center text-gray-300">
							{p.championName || champMapProp[String(p.championId)] || ""}
						</div>
						<div className="opacity-95 mt-0.5 text-center text-gray-400">
							{total > 0 ? `${total} games • ${wr}% WR` : "1st Time"}
						</div>
					</div>
					<div className="mt-auto" />
					<div className="flex items-center gap-1">
						{spells.map((id, i) => (
							<div key={`s-${i}`} className="relative w-4 h-4 rounded overflow-hidden border border-black/30">
								<Image src={`/images/league/summonerSpells/${id}.png`} alt="" fill className="object-cover" />
							</div>
						))}
						{runeIcons.map((src, i) => (
							<div key={`r-${i}`} className="relative w-4 h-4 rounded overflow-hidden border border-black/30">
								<Image src={src} alt="" fill className="object-cover" />
							</div>
						))}
					</div>
					<div className="mt-2">
						<Link href={`/league/profile?gameName=${encodeURIComponent(p.gameName)}&tagLine=${encodeURIComponent(p.tagLine)}&region=${encodeURIComponent(regionProp)}`} className="text-white font-semibold text-[13px] sm:text-[15px] hover:underline truncate block text-center">
							{p.gameName}
						</Link>
						<div className="text-[10px] text-gray-300/90 mt-0.5 flex items-center justify-center gap-1 leading-tight">
							{rankTxt !== "Unranked" && (
								<span className="relative inline-block w-4 h-4 mr-0.5 align-middle">
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

	const renderParticipantCard = (p) => {
		// kept for backward compatibility, route through ParticipantCard
		return (
			<ParticipantCard p={p} perkList={perkList} champMapProp={champMap} regionProp={region} isArena={isArenaQueue} />
		);
	};

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

	/* -------------------- TABLE VIEW -------------------- */
	const renderTableView = () => {
		// Group participants by team
		const blueTeamParticipants = sortedParticipants.filter(
			(p) => p.teamId === 100
		);
		const redTeamParticipants = sortedParticipants.filter(
			(p) => p.teamId === 200
		);

		return (
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="bg-gray-800 text-[--text-secondary] border-b border-gray-700">
							<th className="py-2 px-3 text-left">Champion</th>
							<th className="py-2 px-3 text-left">Summoner</th>
							<th className="py-2 px-3 text-left">Rank</th>
							<th className="py-2 px-3 text-right">LP</th>
							<th className="py-2 px-3 text-center">Spells</th>
							<th className="py-2 px-3 text-center">Runes</th>
							<th className="py-2 px-3 text-center">Record</th>
							<th className="py-2 px-3 text-right">Win Rate</th>
						</tr>
					</thead>
					<tbody>
						{/* Blue Team Header */}
						<tr className="bg-blue-900/30">
							<td colSpan="8" className="py-2 px-3 font-medium text-blue-400">
								<div className="flex items-center">
									<FaShieldAlt className="mr-2" />
									Blue Team
								</div>
							</td>
						</tr>

						{/* Blue Team Players */}
						{blueTeamParticipants.map((p, index) => {
							const rankTxt = fmtRank(p.rank);
							const shortRank =
								rankTxt !== "Unranked"
									? rankTxt.split(" ")[0].toLowerCase()
									: null;
							const total = p.wins + p.losses;
							const wr = total > 0 ? ((p.wins / total) * 100).toFixed(1) : 0;
							const winrateColor = getWinrateColor(wr);

							return (
								<tr
									key={`${p.puuid || p.summonerId || (p.gameName && p.tagLine ? `${p.gameName}#${p.tagLine}` : p.championId)}-${p.teamId}`}
									className={`${
										index % 2 === 0 ? "bg-gray-800/30" : "bg-gray-900"
									} hover:bg-gray-700/50`}
								>
									<td className="py-2 px-3">
										<div className="flex items-center">
											<div className={`relative ${isArenaQueue ? "w-8 h-8 rounded-full" : "w-12 h-12 rounded-md"} overflow-hidden border border-gray-700`}>
												<Image
													src={(!isArenaQueue && getLoadscreenUrl(p.championId)) || `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
													alt=""
													fill
													className="object-cover"
												/>
											</div>
										</div>
									</td>
									<td className="py-2 px-3">
										<Link
											href={`/league/profile?gameName=${encodeURIComponent(
												p.gameName
											)}&tagLine=${encodeURIComponent(
												p.tagLine
											)}&region=${encodeURIComponent(region)}`}
											className="hover:underline truncate max-w-[150px] block"
										>
											<span className="font-medium">
												{p.gameName}
												<span className="text-gray-400 text-xs ml-1">
													#{p.tagLine}
												</span>
											</span>
										</Link>
									</td>
									<td className="py-2 px-3">
										<div className="flex items-center">
											{shortRank && shortRank !== "unranked" && (
												<div className="relative w-4 h-4 mr-1.5">
													<Image
														src={`/images/league/rankedEmblems/${shortRank}.webp`}
														alt=""
														fill
														className="object-contain"
													/>
												</div>
											)}
											<span>
												{rankTxt !== "Unranked" ? rankTxt : "Unranked"}
											</span>
										</div>
									</td>
									<td className="py-2 px-3 text-right font-semibold text-[--primary]">
										{rankTxt !== "Unranked" ? p.lp : "-"}
									</td>
									<td className="py-2 px-3">
										<div className="flex items-center justify-center gap-1">
											{[p.spell1Id, p.spell2Id].map((spellId, idx) => (
												<div
													key={idx}
													className="w-6 h-6 rounded overflow-hidden"
												>
													<Image
														src={`/images/league/summonerSpells/${spellId}.png`}
														alt=""
														width={24}
														height={24}
														className="w-full h-full"
													/>
												</div>
											))}
										</div>
									</td>
									<td className="py-2 px-3 text-center">
										<HoverableRuneIcon perks={p.perks} getPerk={getPerkById} />
									</td>
									<td className="py-2 px-3 text-center">
										<span className="text-[--success]">{p.wins}W</span>
										<span className="text-gray-400 mx-1">/</span>
										<span className="text-[--error]">{p.losses}L</span>
									</td>
									<td
										className={`py-2 px-3 text-right font-semibold ${winrateColor}`}
									>
										{wr}%
									</td>
								</tr>
							);
						})}

						{/* Red Team Header */}
						<tr className="bg-red-900/30">
							<td colSpan="8" className="py-2 px-3 font-medium text-red-400">
								<div className="flex items-center">
									<FaShieldAlt className="mr-2" />
									Red Team
								</div>
							</td>
						</tr>

						{/* Red Team Players */}
						{redTeamParticipants.map((p, index) => {
							const rankTxt = fmtRank(p.rank);
							const shortRank =
								rankTxt !== "Unranked"
									? rankTxt.split(" ")[0].toLowerCase()
									: null;
							const total = p.wins + p.losses;
							const wr = total > 0 ? ((p.wins / total) * 100).toFixed(1) : 0;
							const winrateColor = getWinrateColor(wr);

							return (
								<tr
									key={`${p.puuid || p.summonerId || (p.gameName && p.tagLine ? `${p.gameName}#${p.tagLine}` : p.championId)}-${p.teamId}`}
									className={`${
										index % 2 === 0 ? "bg-gray-800/30" : "bg-gray-900"
									} hover:bg-gray-700/50`}
								>
									<td className="py-2 px-3">
										<div className="flex items-center">
											<div className={`relative ${isArenaQueue ? "w-8 h-8 rounded-full" : "w-12 h-12 rounded-md"} overflow-hidden border border-gray-700`}>
												<Image
													src={(!isArenaQueue && getLoadscreenUrl(p.championId)) || `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
													alt=""
													fill
													className="object-cover"
												/>
											</div>
										</div>
									</td>
									<td className="py-2 px-3">
										<Link
											href={`/league/profile?gameName=${encodeURIComponent(
												p.gameName
											)}&tagLine=${encodeURIComponent(
												p.tagLine
											)}&region=${encodeURIComponent(region)}`}
											className="hover:underline truncate max-w-[150px] block"
										>
											<span className="font-medium">
												{p.gameName}
												<span className="text-gray-400 text-xs ml-1">
													#{p.tagLine}
												</span>
											</span>
										</Link>
									</td>
									<td className="py-2 px-3">
										<div className="flex items-center">
											{shortRank && shortRank !== "unranked" && (
												<div className="relative w-4 h-4 mr-1.5">
													<Image
														src={`/images/league/rankedEmblems/${shortRank}.webp`}
														alt=""
														fill
														className="object-contain"
													/>
												</div>
											)}
											<span>
												{rankTxt !== "Unranked" ? rankTxt : "Unranked"}
											</span>
										</div>
									</td>
									<td className="py-2 px-3 text-right font-semibold text-[--primary]">
										{rankTxt !== "Unranked" ? p.lp : "-"}
									</td>
									<td className="py-2 px-3">
										<div className="flex items-center justify-center gap-1">
											{[p.spell1Id, p.spell2Id].map((spellId, idx) => (
												<div
													key={idx}
													className="w-6 h-6 rounded overflow-hidden"
												>
													<Image
														src={`/images/league/summonerSpells/${spellId}.png`}
														alt=""
														width={24}
														height={24}
														className="w-full h-full"
													/>
												</div>
											))}
										</div>
									</td>
									<td className="py-2 px-3 text-center">
										<HoverableRuneIcon perks={p.perks} getPerk={getPerkById} />
									</td>
									<td className="py-2 px-3 text-center">
										<span className="text-[--success]">{p.wins}W</span>
										<span className="text-gray-400 mx-1">/</span>
										<span className="text-[--error]">{p.losses}L</span>
									</td>
									<td
										className={`py-2 px-3 text-right font-semibold ${winrateColor}`}
									>
										{wr}%
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	};

	/* -------------------- ARENA LAYOUT (QueueID 1700) -------------------- */
	if (
		liveGameData.gameQueueConfigId === 1700 ||
		liveGameData.gameQueueConfigId === 1710
	) {
		// Arena typically has 8 or 16 participants. We just place them in a responsive grid.
		return (
			<div className="bg-[#13151b] text-white rounded-md shadow-lg w-full max-w-5xl mx-auto mt-4">
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
							className={`ml-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:ring-offset-1 focus:ring-offset-black ${liveGameData?.observers?.encryptionKey ? "bg-gradient-to-br from-amber-400/20 to-black/70 text-white hover:from-amber-400/25 hover:to-black/75 border border-amber-400/20" : "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"}`}
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
		<div className="bg-[#13151b] text-white rounded-md shadow-lg w-full max-w-5xl mx-auto mt-4">
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
						className={`ml-2 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:ring-offset-1 focus:ring-offset-black ${
							liveGameData?.observers?.encryptionKey
								? "bg-gradient-to-br from-amber-400/20 to-black/70 text-white hover:from-amber-400/25 hover:to-black/75 border border-amber-400/20"
								: "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
						}`}
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
