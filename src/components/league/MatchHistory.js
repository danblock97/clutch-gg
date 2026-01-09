import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import Tag from "@/components/league/Tag";
import DonutGraph from "@/components/league/DonutGraph";
import MatchDetails from "@/components/league/MatchDetails";
import ErrorPage from "@/components/ErrorPage";
import {
	FaSkullCrossbones,
	FaBolt,
	FaShieldAlt,
	FaFire,
	FaStar,
	FaClock,
	FaTrophy,
	FaMedal,
	FaChevronDown,
	FaChevronUp,
	FaCrown,
} from "react-icons/fa";

// SWR fetcher function
const fetcher = (url) => fetch(url).then((res) => {
	if (!res.ok) throw new Error("Failed to fetch match");
	return res.json();
});

const PREFETCHED_IMAGES = new Set();
const PREFETCHED_TIMELINES = new Set();
const PREFETCHED_CHAMPION_ABILITIES = new Set();
let cachedDdragonVersion = null;
let ddragonVersionPromise = null;

const prefetchImages = (sources) => {
	if (typeof window === "undefined" || !Array.isArray(sources)) return;

	sources.forEach((src) => {
		if (!src || PREFETCHED_IMAGES.has(src)) return;
		const img = new window.Image();
		img.src = src;
		PREFETCHED_IMAGES.add(src);
	});
};

const getLatestDdragonVersion = async () => {
	if (cachedDdragonVersion) return cachedDdragonVersion;
	if (!ddragonVersionPromise) {
		ddragonVersionPromise = fetch(
			"https://ddragon.leagueoflegends.com/api/versions.json"
		)
			.then((res) => (res.ok ? res.json() : []))
			.then((versions) => {
				cachedDdragonVersion = versions?.[0] || "16.1.1";
				return cachedDdragonVersion;
			})
			.catch(() => "16.1.1");
	}
	return ddragonVersionPromise;
};

const prefetchChampionAbilityIcons = async (championId) => {
	if (!championId || PREFETCHED_CHAMPION_ABILITIES.has(championId)) return;
	PREFETCHED_CHAMPION_ABILITIES.add(championId);

	try {
		const latestVersion = await getLatestDdragonVersion();
		const championRes = await fetch(
			`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/${championId}.json`
		);
		if (!championRes.ok) return;
		const champion = await championRes.json();
		if (!champion?.alias) return;

		const ddRes = await fetch(
			`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion/${champion.alias}.json`
		);
		if (!ddRes.ok) return;
		const ddData = await ddRes.json();
		const championDdragon = ddData?.data?.[champion.alias];
		if (!championDdragon?.spells) return;

		prefetchImages(
			championDdragon.spells.map(
				(spell) =>
					`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/${spell.image.group}/${spell.image.full}`
			)
		);
	} catch (error) {
		console.warn(`Failed to prefetch abilities for ${championId}:`, error);
	}
};

const prefetchTimelineItemIcons = (timeline, participantId) => {
	if (!timeline?.info?.frames || !participantId) return;

	const itemIds = new Set();
	timeline.info.frames.forEach((frame) => {
		frame.events?.forEach((event) => {
			if (
				event.type === "ITEM_PURCHASED" &&
				event.participantId === participantId &&
				event.itemId
			) {
				itemIds.add(event.itemId);
			}
		});
	});

	if (!itemIds.size) return;

	prefetchImages(
		Array.from(itemIds).map(
			(itemId) =>
				`https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/${itemId}.png`
		)
	);
};

// Hook to fetch a single match detail
const useMatchDetail = (matchId) => {
	const { data, error, isLoading } = useSWR(
		matchId ? `/api/league/match/${matchId}` : null,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			dedupingInterval: 60000, // Cache for 60 seconds
			errorRetryCount: 2,
		}
	);

	return {
		matchDetail: data,
		isLoading,
		isError: error,
	};
};

// Skeleton component for loading state
const MatchSkeleton = () => (
	<div className="rounded-lg shadow-lg p-2 relative flex items-center mb-2 min-w-[768px] bg-[--card-bg] border border-[--card-border] animate-pulse">
		<div className="flex items-start gap-4 w-full">
			{/* Summary column skeleton */}
			<div className="flex flex-col items-start w-28">
				<div className="h-5 w-20 bg-gray-700 rounded mb-2"></div>
				<div className="h-4 w-16 bg-gray-700 rounded mb-1"></div>
				<div className="h-3 w-12 bg-gray-700 rounded"></div>
			</div>

			{/* Champion + spells skeleton */}
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<div className="w-14 h-14 bg-gray-700 rounded-md"></div>
					<div className="flex flex-col gap-1">
						<div className="w-6 h-6 bg-gray-700 rounded-md"></div>
						<div className="w-6 h-6 bg-gray-700 rounded-md"></div>
					</div>
					<div className="flex flex-col gap-1">
						<div className="h-5 w-16 bg-gray-700 rounded"></div>
						<div className="h-4 w-12 bg-gray-700 rounded"></div>
					</div>
				</div>
				{/* Items skeleton */}
				<div className="flex items-center gap-1 pt-1">
					{[...Array(7)].map((_, i) => (
						<div key={i} className="w-6 h-6 bg-gray-700 rounded-md"></div>
					))}
				</div>
			</div>

			{/* Score skeleton */}
			<div className="flex flex-col items-center justify-center ml-12 self-center">
				<div className="h-4 w-12 bg-gray-700 rounded mb-1"></div>
				<div className="w-10 h-10 bg-gray-700 rounded-full"></div>
			</div>
		</div>

		{/* Participants skeleton */}
		<div className="flex ml-auto">
			<div className="flex flex-col items-start mr-4">
				{[...Array(5)].map((_, i) => (
					<div key={i} className="flex items-center mb-1">
						<div className="w-5 h-5 bg-gray-700 rounded-md mr-1"></div>
						<div className="h-3 w-16 bg-gray-700 rounded"></div>
					</div>
				))}
			</div>
			<div className="flex flex-col items-start">
				{[...Array(5)].map((_, i) => (
					<div key={i} className="flex items-center mb-1">
						<div className="w-5 h-5 bg-gray-700 rounded-md mr-1"></div>
						<div className="h-3 w-16 bg-gray-700 rounded"></div>
					</div>
				))}
			</div>
		</div>

		<div className="flex items-center ml-2">
			<FaChevronDown className="text-gray-600" />
		</div>
	</div>
);

// Single match row component with lazy loading
const MatchRow = ({ 
	matchId, 
	selectedSummonerPUUID, 
	region, 
	isExpanded, 
	onToggleExpand,
	breakpoint,
	augments,
}) => {
	const { matchDetail: match, isLoading, isError } = useMatchDetail(matchId);
	const participants = match?.info?.participants;
	const currentPlayer = participants?.find(
		(p) => p.puuid === selectedSummonerPUUID
	);

	useEffect(() => {
		if (!match || !currentPlayer?.participantId) return;

		participants?.forEach((participant) => {
			prefetchImages([
				`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`,
				`/images/league/summonerSpells/${participant.summoner1Id}.png`,
				`/images/league/summonerSpells/${participant.summoner2Id}.png`,
			]);
			prefetchChampionAbilityIcons(participant.championId);
		});

		if (match.timeline) {
			prefetchTimelineItemIcons(match.timeline, currentPlayer.participantId);
			return;
		}

		if (PREFETCHED_TIMELINES.has(matchId)) return;
		PREFETCHED_TIMELINES.add(matchId);

		const controller = new AbortController();

		(async () => {
			try {
				const response = await fetch(
					`/api/league/timeline?matchId=${matchId}`,
					{ signal: controller.signal }
				);
				if (!response.ok) return;
				const timeline = await response.json();
				prefetchTimelineItemIcons(timeline, currentPlayer.participantId);
			} catch (error) {
				if (error.name !== "AbortError") {
					console.warn(`Failed to prefetch timeline for ${matchId}:`, error);
				}
			}
		})();

		return () => controller.abort();
	}, [match, matchId, currentPlayer?.participantId]);

	if (isLoading) {
		return <MatchSkeleton />;
	}

	if (isError || !match) {
		return (
			<div className="min-w-[768px]">
				<ErrorPage
					error={`Failed to load match ${matchId}`}
					fullPage={false}
					showHomeButton={false}
					showContactSupport={false}
					onRetry={() => window.location.reload()}
				/>
			</div>
		);
	}

	// Validate match data
	if (!match.info || !Array.isArray(match.info.participants) || match.info.participants.length === 0) {
		return null;
	}

	if (!currentPlayer) {
		return null;
	}

	let maxCsPerMin = 0;
	let maxCsPerMinParticipant = null;
	
	participants.forEach((participant) => {
		const csPerMin =
			((participant.totalMinionsKilled ?? 0) +
				(participant.neutralMinionsKilled ?? 0)) /
			((match.info.gameDuration ?? 1) / 60);
		participant.csPerMin = csPerMin;
		if (csPerMin > maxCsPerMin) {
			maxCsPerMin = csPerMin;
			maxCsPerMinParticipant = participant.puuid;
		}
	});

	const tags = [...getAdditionalTags(match, currentPlayer)];

	if (currentPlayer.firstBloodKill) {
		tags.push(
			<Tag
				key="first-blood"
				text="First Blood"
				hoverText="Congrats on First Blood!"
				color="bg-green-500 text-white"
				icon={<FaSkullCrossbones />}
			/>
		);
	}
	if ((currentPlayer.tripleKills ?? 0) > 0) {
		tags.push(
			<Tag
				key="triple-kill"
				text="Triple Kill"
				hoverText={`You got ${currentPlayer.tripleKills ?? 0} Triple Kills!`}
				color="bg-yellow-500 text-white"
				icon={<FaBolt />}
			/>
		);
	}
	if ((currentPlayer.deaths ?? 0) === 0) {
		tags.push(
			<Tag
				key="unkillable"
				text="Unkillable"
				hoverText={`A Whole 0 Deaths! Grats on not inting!`}
				color="bg-yellow-500 text-white"
				icon={<FaShieldAlt />}
			/>
		);
	}

	const damageThreshold =
		match.info.queueId === 450 || match.info.queueId === 1710
			? 1700
			: 900;
	if (match.info.gameMode !== "URF") {
		if (
			(currentPlayer.challenges?.damagePerMinute ?? 0) >
			damageThreshold
		) {
			tags.push(
				<Tag
					key="good-damage"
					text="Good Damage"
					hoverText={`Nice Damage Dealt: ${(
						currentPlayer.totalDamageDealtToChampions ?? 0
					).toLocaleString()}`}
					color="bg-yellow-500 text-white"
					icon={<FaFire />}
				/>
			);
		}
		if (currentPlayer.puuid === maxCsPerMinParticipant) {
			tags.push(
				<Tag
					key="cs-star"
					text="CS Star"
					hoverText={`Most CS/min in the game: ${(
						currentPlayer.csPerMin ?? 0
					).toFixed(1)}`}
					color="bg-blue-500 text-white"
					icon={<FaStar />}
				/>
			);
		}
	}

	// Calculate placement based on clutch score ranking
	const sortedByScore = [...participants]
		.map((p) => ({
			puuid: p.puuid,
			score: calculateClutchScore(match, p),
		}))
		.sort((a, b) => b.score - a.score);

	const placement =
		sortedByScore.findIndex(
			(o) => o.puuid === currentPlayer.puuid
		) + 1;

	const items = Array.from(
		{ length: 7 },
		(_, i) => currentPlayer[`item${i}`]
	);

	const gameCreationRaw =
		match.info.gameCreation ?? match.info.game_datetime ?? 0;
	const gameCreation = new Date(gameCreationRaw);
	const now = new Date();
	const timeDifference = Math.abs(now - gameCreation);
	const daysDifference = Math.floor(
		timeDifference / (1000 * 60 * 60 * 24)
	);
	const hoursDifference = Math.floor(
		timeDifference / (1000 * 60 * 60)
	);
	const minutesDifference = Math.floor(
		timeDifference / (1000 * 60)
	);
	const timeAgo = isNaN(gameCreation.getTime())
		? "Unknown"
		: daysDifference > 0
			? `${daysDifference}d ago`
			: hoursDifference > 0
				? `${hoursDifference}h ago`
				: `${minutesDifference}m ago`;

	const kda = (
		((currentPlayer.kills ?? 0) + (currentPlayer.assists ?? 0)) /
		Math.max(1, currentPlayer.deaths ?? 0)
	).toFixed(1);

	const winningTeam = match.info.participants.filter((p) => p.win);
	const losingTeam = match.info.participants.filter((p) => !p.win);

	const isRemake = match.info.gameDuration < 300;
	const isMVP = tags.some((tag) => tag.key === "mvp");

	const augmentsSelected = [
		currentPlayer.playerAugment1,
		currentPlayer.playerAugment2,
		currentPlayer.playerAugment3,
		currentPlayer.playerAugment4,
	];

	let outcomeText = "";
	if (match.info.queueId === 1700 || match.info.queueId === 1710) {
		// Arena placement logic
	} else {
		outcomeText = getQueueName(match.info.queueId, match.info.gameMode);
	}

	const getAugmentIcon = (id) => {
		const augment = augments.find((aug) => aug.id === id);
		return augment && augment.iconSmall
			? `https://raw.communitydragon.org/latest/game/${augment.iconSmall}`
			: "/images/placeholder.png";
	};

	return (
		<div className="overflow-x-auto">
			<div
				onClick={() => onToggleExpand(matchId)}
				className={`cursor-pointer rounded-lg shadow-lg p-2 relative flex items-center mb-2 min-w-[768px] text-xs sm:text-sm ${getGradientBackground(
					match,
					currentPlayer,
					isRemake,
					isMVP
				)}`}
			>
				<div className="flex items-start gap-4 w-full">
					{/* Summary column */}
					<div className="flex flex-col items-start w-28">
						<p
							className={`font-semibold text-md ${getOutcomeClass(
								currentPlayer.win,
								isRemake,
								isMVP
							)}`}
						>
							{outcomeText}
						</p>
						<span className="text-md text-gray-300">{timeAgo}</span>
						<p className="text-sm mr-2 flex items-center gap-1">
							<span
								className={`text-xs ${isRemake
									? "text-gray-400"
									: currentPlayer.win
										? "text-blue-400"
										: "text-red-400"
									}`}
							>
								{isRemake
									? "Remake"
									: currentPlayer.win
										? "Win"
										: "Lose"}
							</span>
							{`${Math.floor(
								match.info.gameDuration / 60
							)}:${String(match.info.gameDuration % 60).padStart(
								2,
								"0"
							)}`}
						</p>
					</div>

					{/* Champion + spells + stats + items */}
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							{/* Champion with role overlay */}
							<div
								className={`relative w-14 h-14 border-2 rounded-md ${getOutcomeClass(
									currentPlayer.win,
									isRemake,
									isMVP
								)}`}
							>
								<Image
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${currentPlayer.championId}.png`}
									alt="Champion Icon"
									fill
									className="object-cover"
								/>
								{currentPlayer.teamPosition && (
									<Image
										src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${currentPlayer.teamPosition.toLowerCase()}.svg`}
										alt="Role Icon"
										width={18}
										height={18}
										className="absolute -bottom-1 -right-1 bg-[--card-bg] rounded-sm p-0.5"
									/>
								)}
							</div>

							{/* Summoner spells */}
							<div className="flex flex-col gap-1">
								{[
									currentPlayer.summoner1Id,
									currentPlayer.summoner2Id,
								].map((spellId, idx) => (
									<Image
										key={idx}
										src={`/images/league/summonerSpells/${spellId}.png`}
										alt={`Spell ${idx + 1}`}
										width={24}
										height={24}
										className="rounded-md border border-gray-700"
									/>
								))}
							</div>

							{/* KDA stats */}
							<div className="flex flex-col">
								<p className="text-base font-semibold">
									{currentPlayer.kills}/{currentPlayer.deaths}/
									{currentPlayer.assists}
								</p>
								<p className="text-sm">{kda} KDA</p>
							</div>
						</div>

						{/* Items row */}
						<div className="flex items-center gap-1 pt-1">
							{items.slice(0, 6).map((itemId, idx) => (
								<Image
									key={idx}
									src={
										itemId > 0
											? `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/${itemId}.png`
											: "/images/placeholder.png"
									}
									alt="Item"
									width={24}
									height={24}
									className="rounded-md border border-gray-700"
								/>
							))}
							{/* Ward */}
							<Image
								src={
									items[6] > 0
										? `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/${items[6]}.png`
										: "/images/placeholder.png"
								}
								alt="Ward"
								width={24}
								height={24}
								className="rounded-md border border-gray-700"
							/>
						</div>
					</div>

					{/* Score box with label above */}
					<div className="flex flex-col items-center justify-center ml-12 self-center">
						<p className="text-md text-gray-300 mb-1">C-Score</p>
						<DonutGraph
							score={calculateClutchScore(match, currentPlayer)}
							result={currentPlayer.win ? "win" : "loss"}
							height={36}
							width={40}
						/>

						{/* Placement display */}
						<p className="text-xs text-gray-300 mt-1 flex items-center">
							{placement === 1 && (
								<FaCrown className="text-yellow-400 mr-1" />
							)}
							{getOrdinal(placement)}
						</p>
					</div>
				</div>
				{/* Display tags for all match types EXCEPT Arena mode and remakes */}
				{match.info.queueId !== 1700 &&
					match.info.queueId !== 1710 &&
					!isRemake && (
						<div className="absolute bottom-1 left-2 flex items-center">
							{tags.length > 0 && tags[0]}
						</div>
					)}
				{match.info.queueId === 1700 ||
					match.info.queueId === 1710 ? (
					<div className="flex ml-auto">
						<div className="flex flex-col items-start mr-4">
							<div className="text-xs text-[--text-secondary] mb-1">
								Arena Augments
							</div>
							<div className="flex flex-wrap gap-1 max-w-[120px]">
								{augmentsSelected
									.filter(Boolean)
									.slice(0, 4)
									.map((augmentId, idx) => (
										<div key={idx} className="flex-shrink-0">
											<Image
												src={getAugmentIcon(augmentId)}
												alt={`Augment ${idx + 1}`}
												className="w-6 h-6 rounded border border-gray-700"
												width={24}
												height={24}
											/>
										</div>
									))}
							</div>
						</div>
					</div>
				) : (
					<div className="flex ml-auto">
						<div className="flex flex-col items-start mr-4">
							{winningTeam.map((participant, idx) => (
								<div key={idx} className="flex items-center">
									<div
										className={`sm:w-5 sm:h-5 w-5 h-5 rounded-md border border-gray-700 mr-1 overflow-hidden`}
									>
										<Image
											src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
											alt="Participant Champion"
											width={20}
											height={20}
											className="object-cover transform scale-110"
										/>
									</div>
									<p
										className="text-xs truncate"
										style={{ width: "90px" }}
									>
										<span
											className={`${participant.puuid === selectedSummonerPUUID
												? "font-semibold text-gray-100"
												: ""
												}`}
										>
											{truncateName(cleanBotName(participant.riotIdGameName, match.info.gameMode), 7)}
										</span>
									</p>
								</div>
							))}
						</div>
						<div className="flex flex-col items-start">
							{losingTeam.map((participant, idx) => (
								<div key={idx} className="flex items-center">
									<div
										className={`sm:w-5 sm:h-5 w-5 h-5 rounded-md border border-gray-700 mr-1 overflow-hidden`}
									>
										<Image
											src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
											alt="Participant Champion"
											width={20}
											height={20}
											className="object-cover transform scale-110"
										/>
									</div>
									<p
										className="text-xs truncate"
										style={{ width: "90px" }}
									>
										<span
											className={`${participant.puuid === selectedSummonerPUUID
												? "font-semibold text-gray-100"
												: ""
												}`}
										>
											{truncateName(cleanBotName(participant.riotIdGameName, match.info.gameMode), 7)}
										</span>
									</p>
								</div>
							))}
						</div>
					</div>
				)}
						{/* Chevron icon */}
				<div className="flex items-center ml-2">
					{isExpanded ? (
						<FaChevronUp className="text-gray-400" />
					) : (
						<FaChevronDown className="text-gray-400" />
					)}
				</div>
			</div>
			{/* Expanded match details */}
			{isExpanded && match && (
				<div className="mt-0">
					<MatchDetails
						matchDetails={[match]}
						matchId={matchId}
						selectedSummonerPUUID={selectedSummonerPUUID}
						region={region}
					/>
				</div>
			)}
		</div>
	);
};

function useBreakpoint() {
	const [breakpoint, setBreakpoint] = useState("mobile");

	useEffect(() => {
		function handleResize() {
			const width = window.innerWidth;
			if (width < 768) {
				setBreakpoint("mobile");
			} else if (width < 1024) {
				setBreakpoint("md");
			} else {
				setBreakpoint("lg");
			}
		}

		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return breakpoint;
}

const calculateClutchScore = (match, currentPlayer) => {
	// Core metrics
	const kda =
		(currentPlayer.kills + currentPlayer.assists) /
		Math.max(1, currentPlayer.deaths);
	const kdaScore = Math.min(25, (kda / 5) * 25);

	const teamPlayers = match.info.participants.filter(
		(p) => p.teamId === currentPlayer.teamId
	);
	const teamKills = teamPlayers.reduce((sum, p) => sum + p.kills, 0);
	const killParticipation = teamKills
		? (currentPlayer.kills + currentPlayer.assists) / teamKills
		: 0;
	const kpScore = Math.min(20, killParticipation * 20);

	const damage = currentPlayer.totalDamageDealtToChampions || 0;
	const damageScore = Math.min(25, (damage / 25000) * 25);

	const visionScoreVal = currentPlayer.visionScore || 0;
	const visionScore = Math.min(15, (visionScoreVal / 40) * 15);

	const turretDamage = currentPlayer.damageDealtToTurrets || 0;
	const turretScore = Math.min(15, (turretDamage / 3000) * 15);

	// Support-specific metrics (only counted if player identified as Support)
	const isSupport =
		["UTILITY", "SUPPORT"].includes(currentPlayer.teamPosition) ||
		currentPlayer.role === "SUPPORT";
	let supportBonus = 0;
	if (isSupport) {
		const healing =
			(currentPlayer.totalHealsOnTeammates || 0) +
			(currentPlayer.totalDamageShieldedOnTeammates || 0);
		const healingScore = Math.min(15, (healing / 10000) * 15);

		// Damage mitigated can be spread across a few fields – use the largest available.
		const dmgMitigated =
			currentPlayer.damageSelfMitigated || currentPlayer.totalDamageTaken || 0;
		const mitigatedScore = Math.min(15, (dmgMitigated / 30000) * 15);

		supportBonus = healingScore + mitigatedScore;
	}

	const winBonus = currentPlayer.win ? 10 : 0;
	return Math.round(
		kdaScore +
		damageScore +
		kpScore +
		visionScore +
		turretScore +
		supportBonus +
		winBonus
	);
};

const fetchArenaAugments = async () => {
	const response = await fetch(
		"https://raw.communitydragon.org/latest/cdragon/arena/en_us.json"
	);
	const { augments } = await response.json();
	return augments;
};

const getQueueName = (queueId, gameMode) => {
	// Check for specific game modes first
	if (gameMode === "RUBY") {
		return "Doombots";
	}

	switch (queueId) {
		case 420:
			return "Ranked Solo";
		case 430:
			return "Normal (Blind)";
		case 400:
			return "Normal (Draft)";
		case 440:
			return "Ranked Flex";
		case 450:
			return "ARAM";
		case 480:
			return "Swiftplay";
		case 720:
			return "ARAM (Clash)";
		case 830:
			return "Co-op vs. AI Intro";
		case 840:
			return "Co-op vs. AI Beginner";
		case 850:
			return "Co-op vs. AI Intermediate";
		case 900:
			return "ARURF";
		case 1700:
		case 1710:
			return "Arena";
		default:
			return "Unknown Queue";
	}
};

const lanes = [
	{
		id: "TOP",
		icon: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-top.svg",
	},
	{
		id: "JUNGLE",
		icon: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-jungle.svg",
	},
	{
		id: "MID",
		icon: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-middle.svg",
	},
	{
		id: "BOTTOM",
		icon: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-bottom.svg",
	},
	{
		id: "SUPPORT",
		icon: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-utility.svg",
	},
];

const queues = [
	{ id: 420, name: "Ranked Solo" },
	{ id: 440, name: "Ranked Flex" },
	{ id: 450, name: "ARAM" },
	{ id: 480, name: "Swiftplay" },
	{ id: 400, name: "Normal (Draft)" },
	{ id: 900, name: "ARURF" },
	{ id: 1700, name: "Arena" },
];

const getPerformanceTags = (match, currentPlayer) => {
	const tags = [];
	const winningTeam = match.info.participants.filter((p) => p.win);
	const losingTeam = match.info.participants.filter((p) => !p.win);
	const currentTeam = currentPlayer.win ? winningTeam : losingTeam;

	const playerKDA =
		(currentPlayer.kills + currentPlayer.assists) /
		Math.max(1, currentPlayer.deaths);
	const damageScore = currentPlayer.totalDamageDealtToChampions;
	const visionScore = currentPlayer.visionScore || 0;
	const killParticipation =
		currentTeam.reduce((sum, p) => sum + p.kills, 0) > 0
			? (currentPlayer.kills + currentPlayer.assists) /
			currentTeam.reduce((sum, p) => sum + p.kills, 0)
			: 0;

	const teamAvgKDA =
		currentTeam.reduce(
			(sum, p) => sum + (p.kills + p.assists) / Math.max(1, p.deaths),
			0
		) / currentTeam.length;
	const teamAvgDamage =
		currentTeam.reduce((sum, p) => sum + p.totalDamageDealtToChampions, 0) /
		currentTeam.length;
	const teamAvgVision =
		currentTeam.reduce((sum, p) => sum + (p.visionScore || 0), 0) /
		currentTeam.length;

	const mvpScore =
		(playerKDA / teamAvgKDA) * 0.35 +
		(damageScore / teamAvgDamage) * 0.25 +
		(visionScore / Math.max(1, teamAvgVision)) * 0.15 +
		killParticipation * 0.25;

	const teamMVPScores = currentTeam.map((p) => {
		const pKDA = (p.kills + p.assists) / Math.max(1, p.deaths);
		const pDamage = p.totalDamageDealtToChampions;
		const pVision = p.visionScore || 0;
		const pKP =
			currentTeam.reduce((sum, teammate) => sum + teammate.kills, 0) > 0
				? (p.kills + p.assists) /
				currentTeam.reduce((sum, teammate) => sum + teammate.kills, 0)
				: 0;
		return {
			puuid: p.puuid,
			score:
				(pKDA / teamAvgKDA) * 0.35 +
				(pDamage / teamAvgDamage) * 0.25 +
				(pVision / Math.max(1, teamAvgVision)) * 0.15 +
				pKP * 0.25,
		};
	});

	teamMVPScores.sort((a, b) => b.score - a.score);

	if (
		currentPlayer.win &&
		teamMVPScores[0]?.puuid === currentPlayer.puuid &&
		mvpScore > 1.2
	) {
		tags.push(
			<Tag
				key="mvp"
				text="MVP"
				hoverText="Outstanding KDA, damage, vision and KP!"
				color="bg-yellow-500 text-white"
				icon={<FaTrophy />}
			/>
		);
	}

	if (
		!currentPlayer.win &&
		teamMVPScores[0]?.puuid === currentPlayer.puuid &&
		mvpScore > 1.3
	) {
		tags.push(
			<Tag
				key="ace"
				text="Team Ace"
				hoverText="Best performer on your team despite the loss!"
				color="bg-purple-500 text-white"
				icon={<FaStar />}
			/>
		);
	}

	return tags;
};

const getAdditionalTags = (match, currentPlayer) => {
	const tags = [];
	tags.push(...getPerformanceTags(match, currentPlayer));

	if (match.info.gameDuration < 1200 && currentPlayer.win) {
		tags.push(
			<Tag
				key="fast-win"
				text="Fast Win"
				hoverText="You won in less than 20 minutes!"
				color="bg-green-500 text-white"
				icon={<FaClock />}
			/>
		);
	}

	if (currentPlayer.kills >= 10) {
		tags.push(
			<Tag
				key="killing-spree"
				text="Killing Spree"
				hoverText={`You got ${currentPlayer.kills} kills!`}
				color="bg-red-500 text-white"
				icon={<FaSkullCrossbones />}
			/>
		);
	}

	const highestObjectiveDamage = match.info.participants.reduce(
		(max, participant) =>
			participant.damageDealtToObjectives > max
				? participant.damageDealtToObjectives
				: max,
		0
	);
	if (currentPlayer.damageDealtToObjectives === highestObjectiveDamage) {
		tags.push(
			<Tag
				key="objective-master"
				text="Objective Master"
				hoverText="You dealt the most damage to objectives!"
				color="bg-blue-500 text-white"
				icon={<FaMedal />}
			/>
		);
	}

	const highestGold = match.info.participants.reduce(
		(max, participant) =>
			participant.goldEarned > max ? participant.goldEarned : max,
		0
	);
	if (currentPlayer.goldEarned === highestGold) {
		tags.push(
			<Tag
				key="gold-leader"
				text="Gold Leader"
				hoverText="You earned the most gold in the game!"
				color="bg-yellow-400 text-black"
				icon={<FaStar />}
			/>
		);
	}

	return tags;
};

// Updated getGradientBackground to use predefined utility classes for a cleaner look
const getGradientBackground = (match, currentPlayer, isRemake, isMVP) => {
	// Keep colourful arena placement styling
	if (match.info.queueId === 1700 || match.info.queueId === 1710) {
		const placementGradientClasses = {
			1: "bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent border border-[--card-border]",
			2: "bg-gradient-to-r from-transparent via-pink-500/20 to-transparent border border-[--card-border]",
			3: "bg-gradient-to-r from-transparent via-orange-500/20 to-transparent border border-[--card-border]",
			4: "bg-gradient-to-r from-transparent via-blue-500/20 to-transparent border border-[--card-border]",
			5: "bg-gradient-to-r from-transparent via-red-500/20 to-transparent border border-[--card-border]",
			6: "bg-gradient-to-r from-transparent via-green-500/20 to-transparent border border-[--card-border]",
			7: "bg-gradient-to-r from-transparent via-purple-500/20 to-transparent border border-[--card-border]",
			8: "bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent border border-[--card-border]",
		};
		let sortedParticipants = [...match.info.participants].map((p) => ({
			...p,
			playerScore0: p.missions?.playerScore0 || 0,
		}));
		sortedParticipants.sort((a, b) => a.playerScore0 - b.playerScore0);
		const currentIndex = sortedParticipants.findIndex(
			(p) => p.puuid === currentPlayer.puuid
		);
		const placement = Math.floor(currentIndex / 2) + 1;
		return placementGradientClasses[placement] || "match-remake";
	}

	if (isRemake) return "match-remake";

	// Highlight MVP games subtly using the same win/loss background but with an outline
	if (isMVP) {
		return currentPlayer.win
			? "match-win border-yellow-400"
			: "match-loss border-yellow-400";
	}

	return currentPlayer.win ? "match-win" : "match-loss";
};

// Helper to normalize team position values
const normaliseTeamPosition = (position) => {
	if (!position) return "";
	switch (position.toUpperCase()) {
		case "TOP":
			return "TOP";
		case "JUNGLE":
			return "JUNGLE";
		case "MIDDLE":
		case "MID":
			return "MID";
		case "BOTTOM":
		case "ADC":
			return "BOTTOM";
		case "UTILITY":
		case "SUPPORT":
			return "SUPPORT";
		default:
			return position.toUpperCase();
	}
};

const getOrdinal = (n) => {
	const s = ["th", "st", "nd", "rd"],
		v = n % 100;
	return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const getOutcomeClass = (win, isRemake, isMVP) => {
	if (isMVP) return "text-yellow-500 border-yellow-500";
	if (isRemake) return "text-gray-400 border-gray-500";
	return win
		? "text-blue-400 border-blue-400"
		: "text-red-400 border-red-400";
};

const truncateName = (name, maxLength) => {
	if (!name) return "";
	return name.length > maxLength
		? name.substring(0, maxLength) + "..."
		: name;
};

const cleanBotName = (name, gameMode) => {
	if (gameMode === "RUBY" && name && name.startsWith("Ruby_")) {
		return name.substring(5); // Remove "Ruby_" prefix
	}
	return name;
};

const MatchHistory = ({
	matchIds = [], // Now receives matchIds instead of matchDetails
	matchDetails = [], // Keep for backward compatibility during transition
	selectedSummonerPUUID,
	gameName,
	tagLine,
	region,
	selectedChampionId,
}) => {
	const [augments, setAugments] = useState([]);
	const [selectedLane, setSelectedLane] = useState(null);
	const [selectedQueue, setSelectedQueue] = useState(null);
	const [expandedMatchId, setExpandedMatchId] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	
	const matchesPerPage = 10;
	const router = useRouter();
	const breakpoint = useBreakpoint();

	useEffect(() => {
		const getAugments = async () => {
			const data = await fetchArenaAugments();
			setAugments(data);
		};
		getAugments();
	}, []);

	useEffect(() => {
		setCurrentPage(1);
	}, [selectedLane, selectedQueue, selectedChampionId]);

	// Use matchIds if provided, otherwise fall back to extracting from matchDetails (backward compatibility)
	const effectiveMatchIds = useMemo(() => {
		if (matchIds && matchIds.length > 0) {
			return matchIds;
		}
		// Backward compatibility: extract matchIds from matchDetails
		if (matchDetails && matchDetails.length > 0) {
			return matchDetails.map(m => m?.metadata?.matchId).filter(Boolean);
		}
		return [];
	}, [matchIds, matchDetails]);

	if (!effectiveMatchIds || effectiveMatchIds.length === 0) {
		return (
			<div className="bg-gray-800 text-gray-400 p-4 rounded-lg shadow-lg">
				No match history available
			</div>
		);
	}

	// For filtering, we need the loaded match data
	// We'll show skeletons for unloaded matches and filter based on loaded data
	const totalPages = Math.ceil(effectiveMatchIds.length / matchesPerPage);
	const startIndex = (currentPage - 1) * matchesPerPage;
	const endIndex = startIndex + matchesPerPage;
	const paginatedMatchIds = effectiveMatchIds.slice(startIndex, endIndex);

	const handleLaneSelect = (lane) => {
		setSelectedLane(lane === selectedLane ? null : lane);
	};

	const handleQueueSelect = (e) => {
		const value = e.target.value;
		setSelectedQueue(value === "" ? null : Number(value));
	};

	const handlePageChange = (pageNumber) => {
		if (pageNumber < 1 || pageNumber > totalPages) return;
		setCurrentPage(pageNumber);
		setExpandedMatchId(null);
	};

	const toggleExpand = (matchId) => {
		setExpandedMatchId(expandedMatchId === matchId ? null : matchId);
	};

	return (
		<div className="text-gray-400 w-full max-w-screen-xl mx-auto px-4">
			{/* Filters */}
			<div className="flex flex-col md:flex-row justify-between items-center mt-2 space-y-4 md:space-y-0">
				{/* Lane Filter */}
				<div className="flex items-center space-x-2">
					{lanes.map((lane) => (
						<button
							key={lane.id}
							onClick={() => handleLaneSelect(lane.id)}
							className={`p-1.5 rounded-md border transition-colors duration-150 ${selectedLane === lane.id
								? "bg-[#0b3a64] border-[#3a86ff]"
								: "bg-[--card-bg] border-[--card-border] hover:border-[#3a86ff]"
								}`}
							title={lane.id}
						>
							<Image src={lane.icon} alt={lane.id} width={22} height={22} />
						</button>
					))}
				</div>
				<div className="flex items-center space-x-2">
					<select
						id="queue-filter"
						className="p-1.5 bg-[--card-bg] text-[--text-primary] border border-[--card-border] rounded-md focus:outline-none focus:ring-1 focus:ring-[#3a86ff] font-sans"
						value={selectedQueue || ""}
						onChange={handleQueueSelect}
					>
						<option value="">All</option>
						{queues.map((queue) => (
							<option key={queue.id} value={queue.id}>
								{queue.name}
							</option>
						))}
					</select>
				</div>
			</div>
			
			<div className="mt-2">
				{paginatedMatchIds.map((matchId) => (
					<MatchRow
						key={matchId}
						matchId={matchId}
						selectedSummonerPUUID={selectedSummonerPUUID}
						region={region}
						isExpanded={expandedMatchId === matchId}
						onToggleExpand={toggleExpand}
						breakpoint={breakpoint}
						augments={augments}
					/>
				))}
			</div>
			
			{totalPages > 1 && (
				<div className="flex justify-center items-center mt-6 space-x-1 text-sm">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className={`px-3 py-1 rounded ${currentPage === 1
							? "bg-gray-700 cursor-not-allowed text-gray-500"
							: "bg-gray-800 hover:bg-gray-700 text-gray-200"
							}`}
					>
						Previous
					</button>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
						<button
							key={page}
							onClick={() => handlePageChange(page)}
							className={`px-3 py-1 rounded ${currentPage === page
								? "bg-gray-700 text-white"
								: "bg-gray-800 hover:bg-gray-700 text-gray-200"
								}`}
						>
							{page}
						</button>
					))}
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className={`px-3 py-1 rounded ${currentPage === totalPages
							? "bg-gray-700 cursor-not-allowed text-gray-500"
							: "bg-gray-800 hover:bg-gray-700 text-gray-200"
							}`}
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
};

export default MatchHistory;
