import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { FaChartLine, FaSkull, FaShieldAlt } from "react-icons/fa";

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
		case "DOOMBOTSTEEMO":
			modeName = "Doom Bots";
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
	const [time, setTime] = useState("");

	// Load perks & set game timer
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

		const updateTimer = () => {
			const now = Date.now();
			const dur = now - liveGameData.gameStartTime; // Make sure gameStartTime is in ms
			const s = Math.floor((dur / 1000) % 60);
			const m = Math.floor((dur / 60000) % 60);
			const h = Math.floor(dur / 3600000);
			setTime(`${h > 0 ? h + "h " : ""}${m}m ${s}s`);
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);
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

	// Order participants by teams and roles
	const sortedParticipants = [...liveGameData.participants].sort((a, b) => {
		// First by team
		if (a.teamId !== b.teamId) {
			return a.teamId - b.teamId;
		}

		// Prioritize common lane ordering within team: TOP, JUNGLE, MID, ADC, SUPPORT
		const roleOrder = {
			TOP: 1,
			JUNGLE: 2,
			MIDDLE: 3,
			BOTTOM: 4,
			UTILITY: 5,
		};

		const aPosition = a.individualPosition || a.teamPosition || "";
		const bPosition = a.individualPosition || a.teamPosition || "";

		return (roleOrder[aPosition] || 99) - (roleOrder[bPosition] || 99);
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
									key={p.summonerId}
									className={`${
										index % 2 === 0 ? "bg-gray-800/30" : "bg-gray-900"
									} hover:bg-gray-700/50`}
								>
									<td className="py-2 px-3">
										<div className="flex items-center">
											<div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-700">
												<Image
													src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
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
									key={p.summonerId}
									className={`${
										index % 2 === 0 ? "bg-gray-800/30" : "bg-gray-900"
									} hover:bg-gray-700/50`}
								>
									<td className="py-2 px-3">
										<div className="flex items-center">
											<div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-700">
												<Image
													src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
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
			<div className="bg-[#13151b] text-white rounded-md shadow-lg w-full max-w-7xl mx-auto mt-4">
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
							<span className="font-mono">{time}</span>
						</div>

						{/* Time Counter */}
						<div className="flex items-center">
							<div className="flex h-2 w-2 relative mr-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
							</div>
							<span className="font-mono">{time}</span>
						</div>
					</div>
				</div>

				{/* Content based on view mode */}
				{renderTableView()}

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
		<div className="bg-[#13151b] text-white rounded-md shadow-lg w-full max-w-7xl mx-auto mt-4">
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
						<span className="font-mono">{time}</span>
					</div>

					{/* Time Counter */}
					<div className="flex items-center">
						<div className="flex h-2 w-2 relative mr-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
						</div>
						<span className="font-mono">{time}</span>
					</div>
				</div>
			</div>

			{/* Content based on view mode */}
			{renderTableView()}

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
		</div>
	);
}
