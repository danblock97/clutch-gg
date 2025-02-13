import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";
import Link from "next/link";

/* -------------------- GAME MODE & RANK HELPER -------------------- */
function getModeAndRankStatus(gameMode, queueId) {
	let modeName = "";
	let isRanked = false;

	switch (gameMode) {
		case "CLASSIC":
			modeName = "Summoner's Rift";
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
		case "DOOMBOTSTEEMO":
			modeName = "Doom Bots";
			break;
		case "PRACTICETOOL":
			modeName = "Practice Tool";
			break;
		case "TUTORIAL":
			modeName = "Tutorial";
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
	if (typeof document === "undefined") return null; // SSR guard

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

/* -------------------- MAIN COMPONENT -------------------- */
export default function LiveGame({ liveGameData, region }) {
	const [perkList, setPerkList] = useState([]);
	const [time, setTime] = useState("");

	// Load perks & set game timer
	useEffect(() => {
		(async () => setPerkList(await fetchPerks()))();
		const upd = () => {
			const now = Date.now();
			const dur = now - liveGameData.gameStartTime;
			const s = Math.floor((dur / 1000) % 60);
			const m = Math.floor((dur / 60000) % 60);
			const h = Math.floor(dur / 3600000);
			setTime(`${h > 0 ? h + "h " : ""}${m}m ${s}s`);
		};
		upd();
		const interval = setInterval(upd, 1000);
		return () => clearInterval(interval);
	}, [liveGameData]);

	const getPerkById = (id) => perkList.find((x) => x.id === id) || null;
	const fmtRank = (r) => {
		if (!r || typeof r !== "string") return "Unranked";
		return r;
	};

	const { modeName, isRanked } = getModeAndRankStatus(
		liveGameData.gameMode,
		liveGameData.gameQueueConfigId
	);

	const renderParticipantCard = (p) => {
		const rankTxt = fmtRank(p.rank);
		const total = p.wins + p.losses;
		const wr = total > 0 ? ((p.wins / total) * 100).toFixed(0) : 0;
		const shortRank =
			rankTxt !== "Unranked" ? rankTxt.split(" ")[0].toLowerCase() : null;

		return (
			<div
				key={p.summonerId}
				className="
          bg-[#1A1D21] 
          border border-gray-700 
          rounded-md 
          flex-shrink-0 w-40 sm:w-44 md:w-48 lg:w-52 
          p-3 
          shadow-md 
          text-center 
          transition duration-200
        "
			>
				{/* Champion Icon */}
				<div className="relative w-14 h-14 mx-auto mb-2">
					<Image
						src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
						alt=""
						fill
						className="rounded-full object-cover"
					/>
				</div>

				{/* Summoner Name / Level */}
				<div className="mb-1 text-center text-xs">
					<Link
						href={`/league/profile?gameName=${p.gameName}&tagLine=${p.tagLine}&region=${region}`}
						className="font-bold hover:underline block truncate max-w-[90px] mx-auto"
					>
						{p.gameName}#{p.tagLine}
					</Link>
					<div className="text-gray-400">Lvl {p.summonerLevel}</div>
				</div>

				{/* Spells */}
				<div className="flex justify-center space-x-1 mb-2">
					<div className="relative w-6 h-6">
						<Image
							src={`/images/league/summonerSpells/${p.spell1Id}.png`}
							alt=""
							fill
							className="rounded"
						/>
					</div>
					<div className="relative w-6 h-6">
						<Image
							src={`/images/league/summonerSpells/${p.spell2Id}.png`}
							alt=""
							fill
							className="rounded"
						/>
					</div>
				</div>

				{/* Keystone Rune Centered */}
				<div className="flex justify-center mb-2">
					<HoverableRuneIcon perks={p.perks} getPerk={getPerkById} />
				</div>

				{/* Ranked Icon / Rank Text Centered */}
				<div className="flex items-center justify-center text-[11px] my-1">
					{shortRank && shortRank !== "unranked" && (
						<div className="relative w-5 h-5 mr-1">
							<Image
								src={`/images/league/rankedEmblems/${shortRank}.webp`}
								alt=""
								fill
								className="object-contain"
							/>
						</div>
					)}
					<span className="font-semibold">
						{rankTxt !== "Unranked" ? `${rankTxt} (${p.lp} LP)` : "Unranked"}
					</span>
				</div>

				{/* Wins / Losses / Winrate */}
				<div className="text-[11px]">
					<div className="font-bold">
						{p.wins}W / {p.losses}L
					</div>
					<div className="text-gray-400">{wr}% WR</div>
				</div>
			</div>
		);
	};

	const renderTeam = (players, teamName, color, teamId) => (
		<div className="bg-[#13151b] mb-3 rounded-md px-2 pt-3 pb-4 md:px-[90px]">
			<div className="flex justify-between items-center mb-3 px-1">
				<span className={`font-bold ${color} text-base`}>{teamName}</span>
				<div className="flex space-x-1">
					{liveGameData.bannedChampions
						?.filter((b) => b.teamId === teamId)
						.map((ban, i) => (
							<div key={i} className="relative w-6 h-6">
								<Image
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ban.championId}.png`}
									alt=""
									fill
									className="rounded-full object-cover"
								/>
							</div>
						))}
				</div>
			</div>
			<div className="flex overflow-x-auto lg:overflow-x-visible md:justify-center space-x-3 px-1">
				{players.map((p) => renderParticipantCard(p))}
			</div>
		</div>
	);

	return (
		<div className="bg-[#13151b] text-white rounded-md shadow w-full max-w-7xl mx-auto mt-4">
			<div className="py-3 px-4 text-sm font-bold bg-gray-900 rounded-t-md flex justify-between items-center">
				<span>
					{modeName}
					{isRanked ? " (Ranked)" : ""}
				</span>
				<span>{time}</span>
			</div>

			{/* Team 1 on top, Team 2 below */}
			{renderTeam(
				liveGameData.participants.filter((x) => x.teamId === 100),
				"Blue Team",
				"text-blue-400",
				100
			)}
			{renderTeam(
				liveGameData.participants.filter((x) => x.teamId === 200),
				"Red Team",
				"text-red-400",
				200
			)}
		</div>
	);
}
