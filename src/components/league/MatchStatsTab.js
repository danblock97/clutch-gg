import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import NextImage from "next/image";
import Loading from "../Loading";
import Link from "next/link";

function mapCDragonAssetPath(jsonPath) {
	if (!jsonPath) return null;
	const lower = jsonPath.toLowerCase().replace("/lol-game-data/assets", "");
	return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${lower}`;
}

const fetchArenaAugments = async () => {
	const res = await fetch(
		"https://raw.communitydragon.org/latest/cdragon/arena/en_us.json"
	);
	return res.json();
};

const fetchPerks = async () => {
	const res = await fetch(
		"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perks.json"
	);
	return res.json();
};

export default function MatchStatsTab({
	matchDetails,
	matchId,
	selectedSummonerPUUID,
	region,
}) {
	const [augments, setAugments] = useState([]);
	const [perks, setPerks] = useState([]);

	useEffect(() => {
		(async () => {
			setAugments(await fetchArenaAugments());
			setPerks(await fetchPerks());
		})();
	}, []);

	useEffect(() => {
		if (!matchDetails || !augments.length) return;
		const toPrefetch = [];
		matchDetails.forEach((m) => {
			m.info.participants.forEach((p) => {
				// Prefetch champion icons
				toPrefetch.push(
					`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`
				);
				// Prefetch summoner spells
				[p.summoner1Id, p.summoner2Id].forEach((spellId) => {
					toPrefetch.push(`/images/league/summonerSpells/${spellId}.png`);
				});
				// Prefetch items
				for (let i = 0; i < 7; i++) {
					const itemId = p[`item${i}`];
					if (itemId && itemId > 0) {
						toPrefetch.push(
							`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/item/${itemId}.png`
						);
					}
				}
			});

			// Prefetch ARAM/Arena augments if any
			if (m.info.queueId === 1700 && augments.length) {
				m.info.participants.forEach((p) => {
					p.missions?.playerAugments?.forEach((aId) => {
						const found = augments.find((a) => a.id === aId);
						if (found) {
							toPrefetch.push(
								`https://raw.communitydragon.org/latest/game/${found.iconSmall}`
							);
						}
					});
				});
			}

			// Prefetch bans
			m.info.teams.forEach((t) => {
				t.bans.forEach((b) => {
					toPrefetch.push(
						`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${b.championId}.png`
					);
				});
			});
		});
		// Trigger prefetch
		toPrefetch.forEach((src) => {
			const img = new Image();
			img.src = src;
		});
	}, [matchDetails, augments]);

	const match = matchDetails?.find((m) => m.metadata.matchId === matchId);

	if (!matchDetails) {
		return (
			<div className="text-center text-white">
				<Loading />
			</div>
		);
	}
	if (!match) {
		return (
			<div className="text-center text-white">Match details not found.</div>
		);
	}

	const getAugmentIcon = (id) => {
		const aug = augments.find((a) => a.id === id);
		return aug
			? `https://raw.communitydragon.org/latest/game/${aug.iconSmall}`
			: null;
	};

	const getPerkById = (id) => {
		if (!perks || !perks.length) return null;
		return perks.find((p) => p.id === id);
	};

	const parts = match.info.participants;
	parts.forEach((p) => {
		p.csPerMin =
			(p.totalMinionsKilled + p.neutralMinionsKilled) /
			(match.info.gameDuration / 60);
	});

	// ----------------- Arena Check --------------------
	if (match.info.queueId === 1700) {
		let grouped = {};
		let sorted = [...parts].map((p) => ({
			...p,
			playerScore0: p.missions?.playerScore0,
		}));
		sorted.sort((a, b) => a.playerScore0 - b.playerScore0);

		sorted.forEach((p, i) => {
			const tId = Math.floor(i / 2);
			if (!grouped[tId]) grouped[tId] = [];
			grouped[tId].push(p);
		});

		const getOrdinal = (n) => {
			const s = ["th", "st", "nd", "rd"];
			const v = n % 100;
			return n + (s[(v - 20) % 10] || s[v] || s[0]);
		};

		const getPlacementColor = (plc) => {
			switch (plc) {
				case 1:
					return "text-yellow-500";
				case 2:
					return "text-pink-500";
				case 3:
					return "text-orange-500";
				case 4:
					return "text-blue-500";
				case 5:
					return "text-red-500";
				case 6:
					return "text-green-500";
				case 7:
					return "text-purple-500";
				case 8:
					return "text-indigo-500";
				default:
					return "text-white";
			}
		};

		const comps = Object.values(grouped).map((teamArr, i) => {
			const place = teamArr[0].playerScore0;
			return (
				<div key={i} className="bg-[#13151b] text-white p-2 mb-2 rounded-lg">
					<h3 className={`text-sm font-bold ${getPlacementColor(place)}`}>
						{getOrdinal(place)} Place
					</h3>
					{teamArr.map((p) => (
						<Participant
							key={p.participantId}
							p={p}
							r={region}
							getA={getAugmentIcon}
							getPerk={getPerkById}
							arena
						/>
					))}
				</div>
			);
		});

		return (
			<div className="bg-[#13151b] min-h-screen flex flex-col items-center justify-center px-2 py-1">
				<div className="max-w-6xl w-full">{comps}</div>
			</div>
		);
	}

	// ----------------- Summoner's Rift (and others) --------------------
	const calcTeamStats = (ps) => {
		return ps.reduce(
			(a, c) => {
				a.kills += c.kills;
				a.deaths += c.deaths;
				a.assists += c.assists;
				return a;
			},
			{ kills: 0, deaths: 0, assists: 0 }
		);
	};

	const t1 = parts.filter((p) => p.teamId === 100);
	const t2 = parts.filter((p) => p.teamId === 200);
	const t1Stats = calcTeamStats(t1);
	const t2Stats = calcTeamStats(t2);
	const bans = {
		team1: match.info.teams.find((t) => t.teamId === 100).bans,
		team2: match.info.teams.find((t) => t.teamId === 200).bans,
	};

	return (
		<div className="min-h-auto flex items-center justify-center px-2 py-1">
			<div className="overflow-auto w-full">
				<div className="text-white min-w-[800px] md:min-w-0 md:max-w-6xl w-full mx-auto">
					{/* Team 1 */}
					<div className="flex justify-between items-center mb-1">
						<span className="text-sm font-semibold text-[#3182CE]">Team 1</span>
						<div className="text-sm font-semibold text-[#3182CE]">
							{`${t1Stats.kills} / ${t1Stats.deaths} / ${t1Stats.assists}`}
						</div>
						<div className="flex justify-end items-center">
							<span className="text-sm font-semibold text-[#3182CE] mr-1">
								Bans:
							</span>
							{bans.team1.map((ban, idx) => (
								<NextImage
									key={idx}
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ban.championId}.png`}
									alt="Champion Ban"
									width={16}
									height={16}
									className="w-4 h-4"
								/>
							))}
						</div>
					</div>

					<div className="space-y-2 overflow-x-visible overflow-y-visible">
						{t1.map((p, i) => (
							<Participant
								key={i}
								p={p}
								puuid={selectedSummonerPUUID}
								r={region}
								getA={getAugmentIcon}
								getPerk={getPerkById}
							/>
						))}
					</div>

					{/* Team 2 */}
					<div className="flex justify-between items-center mt-1 mb-1">
						<span className="text-sm font-semibold text-[#C53030]">Team 2</span>
						<div className="text-sm font-semibold text-[#C53030]">
							{`${t2Stats.kills} / ${t2Stats.deaths} / ${t2Stats.assists}`}
						</div>
						<div className="flex justify-end items-center">
							<span className="text-sm font-semibold text-[#C53030] mr-1">
								Bans:
							</span>
							{bans.team2.map((ban, idx) => (
								<NextImage
									key={idx}
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ban.championId}.png`}
									alt="Champion Ban"
									width={16}
									height={16}
									className="w-4 h-4"
								/>
							))}
						</div>
					</div>

					<div className="space-y-2 overflow-x-visible overflow-y-visible">
						{t2.map((p, i) => (
							<Participant
								key={i}
								p={p}
								puuid={selectedSummonerPUUID}
								r={region}
								getA={getAugmentIcon}
								getPerk={getPerkById}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function Participant({ p, puuid, r, getA, getPerk, arena }) {
	const kda =
		p.deaths === 0
			? (p.kills + p.assists).toFixed(1)
			: ((p.kills + p.assists) / p.deaths).toFixed(1);
	const { perks } = p || {};
	let keyPerk = null;
	let subStyle = null;

	if (perks?.styles) {
		const prim = perks.styles.find((s) => s.description === "primaryStyle");
		const sub = perks.styles.find((s) => s.description === "subStyle");
		if (prim?.selections?.length) {
			keyPerk = getPerk(prim.selections[0].perk);
		}
		if (sub?.style) {
			subStyle = getPerk(sub.style);
		}
	}

	return (
		<Link
			href={`/league/profile?gameName=${p.riotIdGameName}&tagLine=${p.riotIdTagline}&region=${r}`}
		>
			<div className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded-lg hover:bg-[#2e2e2e] transition duration-150 mt-2 relative">
				<div className="flex items-center space-x-2 flex-shrink-0 w-1/4">
					<NextImage
						src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
						alt=""
						width={32}
						height={32}
						className="w-8 h-8 rounded-full"
					/>
					<span className="text-sm font-semibold truncate">
						{p.riotIdGameName}#{p.riotIdTagline}
					</span>
				</div>

				<div className="flex items-center space-x-2 flex-shrink-0 w-1/6 justify-center">
					{[p.summoner1Id, p.summoner2Id].map((s, i) => (
						<NextImage
							key={i}
							src={`/images/league/summonerSpells/${s}.png`}
							alt=""
							width={24}
							height={24}
							className="w-6 h-6"
						/>
					))}
					<div className="flex items-center space-x-1">
						{keyPerk && keyPerk.iconPath && (
							<HoverableRuneIcon
								perk={keyPerk}
								allPerks={perks}
								getPerk={getPerk}
							/>
						)}
						{subStyle && subStyle.iconPath && (
							<HoverableRuneIcon
								perk={subStyle}
								allPerks={perks}
								getPerk={getPerk}
							/>
						)}
					</div>
				</div>

				<div className="flex items-center space-x-1 flex-shrink-0 w-1/4 justify-center">
					{Array.from({ length: 6 }, (_, i) => p[`item${i}`]).map(
						(itemId, idx) => (
							<div key={idx}>
								{itemId > 0 ? (
									<NextImage
										src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/item/${itemId}.png`}
										alt=""
										width={24}
										height={24}
										className="w-6 h-6"
									/>
								) : (
									<NextImage
										src="/images/placeholder.png"
										alt=""
										width={24}
										height={24}
										className="w-6 h-6"
									/>
								)}
							</div>
						)
					)}
				</div>

				<div className="flex flex-col items-center flex-shrink-0 w-1/6">
					<span className="text-sm font-semibold">
						{p.kills} / {p.deaths} / {p.assists}
					</span>
					<span className="text-xs text-gray-400">{kda} KDA</span>
				</div>
				<div className="flex flex-col items-center flex-shrink-0 w-1/6">
					<span className="text-sm font-semibold">
						{p.totalMinionsKilled + p.neutralMinionsKilled} CS
					</span>
					<span className="text-xs text-gray-400">
						{p.totalDamageDealtToChampions?.toLocaleString()} DMG
					</span>
				</div>
			</div>
		</Link>
	);
}

function PortalTooltip({ top, left, flipAbove, children }) {
	if (typeof document === "undefined") return null;

	const tooltipPosition = {
		top: `${top}px`,
		left: `${left}px`,
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

function HoverableRuneIcon({ perk, allPerks, getPerk }) {
	const iconRef = useRef(null);
	const [hovered, setHovered] = useState(false);
	const [coords, setCoords] = useState({ top: 0, left: 0 });
	const [flipAbove, setFlipAbove] = useState(false);

	const onMouseEnter = () => {
		if (!iconRef.current) return;
		const rect = iconRef.current.getBoundingClientRect();
		const scrollY = window.scrollY || document.documentElement.scrollTop;
		const scrollX = window.scrollX || document.documentElement.scrollLeft;

		const tooltipHeight = 220;
		const spaceBelow = window.innerHeight - rect.bottom;

		const flip = spaceBelow < tooltipHeight;
		setFlipAbove(flip);

		const topVal = flip
			? rect.top + scrollY - tooltipHeight - 8
			: rect.bottom + scrollY + 8;

		setCoords({
			top: topVal,
			left: rect.left + scrollX + rect.width / 2,
		});
		setHovered(true);
	};

	const onMouseLeave = () => setHovered(false);

	return (
		<div ref={iconRef} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
			<NextImage
				src={mapCDragonAssetPath(perk.iconPath)}
				alt={perk.name}
				width={24}
				height={24}
				className="w-6 h-6"
			/>
			{hovered && (
				<PortalTooltip
					top={coords.top}
					left={coords.left}
					flipAbove={flipAbove}
				>
					<FullRuneTooltip perks={allPerks} getPerkById={getPerk} />
				</PortalTooltip>
			)}
		</div>
	);
}

function FullRuneTooltip({ perks, getPerkById }) {
	if (!perks?.styles) return null;
	const primary = perks.styles.find((s) => s.description === "primaryStyle");
	const sub = perks.styles.find((s) => s.description === "subStyle");
	const statPerks = perks.statPerks || {};

	const primarySelections = primary?.selections || [];
	const subSelections = sub?.selections || [];
	const statPerksData = Object.values(statPerks).map((id) => getPerkById(id));

	return (
		<div className="space-y-3">
			{primary && (
				<div>
					<div className="font-bold mb-1 text-[0.65rem] sm:text-xs uppercase">
						Primary: {getPerkById(primary.style)?.name}
					</div>
					<div className="flex flex-wrap">
						{primarySelections.map((sel, idx) => {
							const pd = getPerkById(sel.perk);
							if (!pd) return null;
							return (
								<div
									key={idx}
									className="mr-2 mb-2 flex items-center text-[0.65rem] sm:text-xs"
								>
									<NextImage
										src={mapCDragonAssetPath(pd.iconPath)}
										alt={pd.name}
										width={16}
										height={16}
										className="mr-1"
									/>
									{pd.name}
								</div>
							);
						})}
					</div>
				</div>
			)}

			{sub && (
				<div>
					<div className="font-bold mb-1 text-[0.65rem] sm:text-xs uppercase">
						Secondary: {getPerkById(sub.style)?.name}
					</div>
					<div className="flex flex-wrap">
						{subSelections.map((sel, idx) => {
							const pd = getPerkById(sel.perk);
							if (!pd) return null;
							return (
								<div
									key={idx}
									className="mr-2 mb-2 flex items-center text-[0.65rem] sm:text-xs"
								>
									<NextImage
										src={mapCDragonAssetPath(pd.iconPath)}
										alt={pd.name}
										width={16}
										height={16}
										className="mr-1"
									/>
									{pd.name}
								</div>
							);
						})}
					</div>
				</div>
			)}

			{statPerksData?.length > 0 && (
				<div>
					<div className="font-bold mb-1 text-[0.65rem] sm:text-xs uppercase">
						Stat Shards
					</div>
					<div className="flex flex-wrap">
						{statPerksData.map((pd, idx) => {
							if (!pd) return null;
							return (
								<div
									key={idx}
									className="mr-2 mb-2 flex items-center text-[0.65rem] sm:text-xs"
								>
									<NextImage
										src={mapCDragonAssetPath(pd.iconPath)}
										alt={pd.name}
										width={16}
										height={16}
										className="mr-1"
									/>
									{pd.name}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
