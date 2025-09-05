import Image from "next/image";
import Link from "next/link";
import { FaBan, FaDesktop } from "react-icons/fa";
import { useState, useEffect } from "react";
import { getQueueName } from "@/lib/league/utils";

const TeamDisplay = ({
	teamId,
	participants,
	bannedChampions,
	championData,
	summonerSpellData,
	ddragonVersion,
	region,
}) => {
	const teamParticipants = participants.filter((p) => p.teamId === teamId);
	const teamBans = bannedChampions.filter((b) => b.teamId === teamId);

	return (
		<div className="flex-1">
			<h3
				className={`text-xl font-bold mb-3 ${
					teamId === 100 ? "text-blue-400" : "text-red-400"
				}`}
			>
				{teamId === 100 ? "Blue Team" : "Red Team"}
			</h3>
			<div className="space-y-2">
				{teamParticipants.map((p) => (
					<Player
						participant={p}
						key={p.puuid}
						championData={championData}
						summonerSpellData={summonerSpellData}
						ddragonVersion={ddragonVersion}
						region={region}
					/>
				))}
			</div>
			<div className="mt-2 flex gap-1.5 flex-wrap">
				{teamBans.length > 0 ? (
					teamBans.map((ban, index) => (
						<BannedChampion
							key={index}
							championId={ban.championId}
							championData={championData}
							ddragonVersion={ddragonVersion}
						/>
					))
				) : (
					<p className="text-xs text-gray-500 h-5">No bans</p>
				)}
			</div>
		</div>
	);
};

const SummonerSpell = ({ spellId, summonerSpellData, ddragonVersion }) => {
	if (!summonerSpellData || !spellId) return null;
	const spell = summonerSpellData[spellId];
	if (!spell) return null;

	return (
		<Image
			src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/spell/${spell.image.full}`}
			alt={spell.name}
			width={18}
			height={18}
			className="rounded"
		/>
	);
};

const Player = ({
	participant,
	championData,
	summonerSpellData,
	ddragonVersion,
	region,
}) => {
	const displayName = participant.accountData
		? `${participant.accountData.gameName}#${participant.accountData.tagLine}`
		: participant.summonerName;

	const profileLink =
		participant.accountData.gameName && participant.accountData.tagLine
			? `/league/profile?gameName=${participant.accountData.gameName}&tagLine=${participant.accountData.tagLine}&region=${region}`
			: "#";

	const champ = championData ? championData[participant.championId] : null;
	const soloQueueData = participant.rankedData?.find(
		(q) => q.queueType === "RANKED_SOLO_5x5"
	);

	return (
		<div className="flex items-center gap-1.5">
			{champ && ddragonVersion ? (
				<Image
					src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${champ.image.full}`}
					alt={champ.name}
					width={28}
					height={28}
					className="rounded-md"
				/>
			) : (
				<div className="w-7 h-7 bg-gray-700 rounded-md flex-shrink-0"></div>
			)}
			<div className="flex flex-col justify-center items-center gap-0.5">
				<SummonerSpell
					spellId={participant.spell1Id}
					summonerSpellData={summonerSpellData}
					ddragonVersion={ddragonVersion}
				/>
				<SummonerSpell
					spellId={participant.spell2Id}
					summonerSpellData={summonerSpellData}
					ddragonVersion={ddragonVersion}
				/>
			</div>
			<div className="overflow-hidden flex-grow">
				<Link href={profileLink} className="hover:underline">
					<p className="font-medium truncate text-neutral-200 text-[11px]">
						{displayName}
					</p>
				</Link>
				{soloQueueData ? (
					<div className="flex items-center gap-1 text-[10px] text-neutral-400">
						<Image
							src={`/images/league/rankedEmblems/${soloQueueData.tier.toLowerCase()}.webp`}
							alt={soloQueueData.tier}
							width={14}
							height={14}
						/>
						<span className="font-medium">
							{soloQueueData.tier[0] +
								soloQueueData.tier.slice(1).toLowerCase()}{" "}
							{soloQueueData.rank}
						</span>
						<span>- {soloQueueData.leaguePoints} LP</span>
					</div>
				) : (
					<p className="text-[10px] text-neutral-500">Unranked</p>
				)}
			</div>
		</div>
	);
};

const BannedChampion = ({ championId, championData, ddragonVersion }) => {
	const champ = championData ? championData[championId] : null;

	return (
		<div className="flex items-center">
			{champ && ddragonVersion ? (
				<Image
					src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${champ.image.full}`}
					alt={champ.name}
					width={20}
					height={20}
					className="rounded-sm opacity-60"
				/>
			) : (
				<div className="w-5 h-5 bg-gray-800 rounded-sm flex items-center justify-center">
					<FaBan className="text-gray-500 text-xs" />
				</div>
			)}
		</div>
	);
};

const ArenaTeamDisplay = ({
	team,
	championData,
	summonerSpellData,
	ddragonVersion,
	region,
}) => {
	return (
		<div className="flex flex-col gap-2">
			{team.map((p) => (
				<Player
					participant={p}
					key={p.puuid}
					championData={championData}
					summonerSpellData={summonerSpellData}
					ddragonVersion={ddragonVersion}
					region={region}
				/>
			))}
		</div>
	);
};

export default function FeaturedGameCard({
	game,
	championData,
	summonerSpellData,
	ddragonVersion,
	region,
}) {
	const [gameTime, setGameTime] = useState("00:00");
	const [showSpectateInfo, setShowSpectateInfo] = useState(false);

	const handleSpectate = () => {
		try {
			const encryptionKey = game?.observers?.encryptionKey;
			const platformId = (region || "").toUpperCase();
			const gameId = game?.gameId;
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

	useEffect(() => {
		// Calculate a reliable start time based on the gameLength provided by the API
		const calculatedStartTime = Date.now() - (game.gameLength || 0) * 1000;

		const interval = setInterval(() => {
			const duration = Date.now() - calculatedStartTime;
			const secondsTotal = Math.floor(duration / 1000);
			const minutes = Math.floor(secondsTotal / 60);
			const seconds = secondsTotal % 60;
			setGameTime(
				`${minutes.toString().padStart(2, "0")}:${seconds
					.toString()
					.padStart(2, "0")}`
			);
		}, 1000);

		// Set initial time to avoid 1s delay
		const initialDuration = Date.now() - calculatedStartTime;
		const initialSecondsTotal = Math.floor(initialDuration / 1000);
		const initialMinutes = Math.floor(initialSecondsTotal / 60);
		const initialSeconds = initialSecondsTotal % 60;
		setGameTime(
			`${initialMinutes.toString().padStart(2, "0")}:${initialSeconds
				.toString()
				.padStart(2, "0")}`
		);

		return () => clearInterval(interval);
	}, [game.gameLength]); // Depend on gameLength to reset if the game object changes

	const gameMode = getQueueName(game.gameQueueConfigId);
	const isArena =
		game.gameQueueConfigId === 1700 || game.gameQueueConfigId === 1710;

	// Group players into teams of 2 for Arena
	const arenaTeams = [];
	if (isArena) {
		for (let i = 0; i < game.participants.length; i += 2) {
			arenaTeams.push(game.participants.slice(i, i + 2));
		}
	}

	// Pair up arena teams for row-based display
	const arenaTeamPairs = [];
	if (isArena) {
		for (let i = 0; i < arenaTeams.length; i += 2) {
			arenaTeamPairs.push(arenaTeams.slice(i, i + 2));
		}
	}

	return (
		<div className="border border-[--card-border] rounded-md p-2 bg-[--card-bg] h-full flex flex-col">
			<div className="flex justify-between items-start mb-1.5 pb-1.5 border-b border-neutral-800">
				<div className="flex flex-col gap-0.5">
					<div className="flex items-center gap-2">
						<h2 className="text-xs font-bold text-[--primary]">{gameMode}</h2>
						<span className="text-[10px] bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded font-medium">
							{region}
						</span>
					</div>
					<p className="text-[10px] text-neutral-500 font-mono">
						ID: {game.gameId}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<p className="text-xs text-neutral-400 font-mono">{gameTime}</p>
					<button
						onClick={handleSpectate}
						disabled={!game?.observers?.encryptionKey}
						className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:ring-offset-1 focus:ring-offset-black ${
							game?.observers?.encryptionKey
								? "bg-gradient-to-br from-amber-400/20 to-black/70 text-white hover:from-amber-400/25 hover:to-black/75 border border-amber-400/20"
								: "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
						}`}
					>
						<FaDesktop className="w-3.5 h-3.5" />
						Spectate
					</button>
				</div>
			</div>
			{isArena ? (
				<div className="flex flex-col gap-2">
					{arenaTeamPairs.map((pair, index) => (
						<div key={index} className="flex flex-row items-stretch">
							<div className="w-1/2">
								<ArenaTeamDisplay
									team={pair[0]}
									championData={championData}
									summonerSpellData={summonerSpellData}
									ddragonVersion={ddragonVersion}
									region={region}
								/>
							</div>
							{pair[1] && (
								<>
									<div className="border-l border-neutral-700 mx-1.5"></div>
									<div className="w-1/2">
										<ArenaTeamDisplay
											team={pair[1]}
											championData={championData}
											summonerSpellData={summonerSpellData}
											ddragonVersion={ddragonVersion}
											region={region}
										/>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-1 gap-2">
					{/* Blue Team */}
					<TeamDisplay
						teamId={100}
						participants={game.participants}
						bannedChampions={game.bannedChampions}
						championData={championData}
						summonerSpellData={summonerSpellData}
						ddragonVersion={ddragonVersion}
						region={region}
					/>
					<div className="border-l border-neutral-800"></div>
					{/* Red Team */}
					<TeamDisplay
						teamId={200}
						participants={game.participants}
						bannedChampions={game.bannedChampions}
						championData={championData}
						summonerSpellData={summonerSpellData}
						ddragonVersion={ddragonVersion}
						region={region}
					/>
				</div>
			)}
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
