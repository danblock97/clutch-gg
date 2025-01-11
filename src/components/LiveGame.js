import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const LiveGame = ({ liveGameData, region }) => {
	const [isArena, setIsArena] = useState(false);
	const [elapsedTime, setElapsedTime] = useState("");

	useEffect(() => {
		setIsArena(liveGameData.queueId === 1700);

		const updateElapsedTime = () => {
			const now = Date.now();
			const gameStartTime = liveGameData.gameStartTime;
			const duration = now - gameStartTime;

			const seconds = Math.floor((duration / 1000) % 60);
			const minutes = Math.floor((duration / (1000 * 60)) % 60);
			const hours = Math.floor(duration / (1000 * 60 * 60));

			setElapsedTime(`${hours > 0 ? `${hours}h ` : ""}${minutes}m ${seconds}s`);
		};

		updateElapsedTime();
		const interval = setInterval(updateElapsedTime, 1000);
		return () => clearInterval(interval);
	}, [liveGameData]);

	const formatRankImageName = (rank) => {
		if (!rank || typeof rank !== "string") {
			return "unranked";
		}
		const [tier] = rank.split(" ");
		return tier.toLowerCase();
	};

	const renderParticipant = (participant) => {
		const rankImageName =
			participant.rank !== "Unranked"
				? formatRankImageName(participant.rank)
				: null;

		// Calculate winrate
		const totalGames = participant.wins + participant.losses;
		const winrate =
			totalGames > 0 ? ((participant.wins / totalGames) * 100).toFixed(0) : 0; // Show 0% if no games played

		return (
			<div
				key={participant.summonerId}
				className="flex items-center py-2 border-b border-gray-700 text-xs sm:text-sm min-w-[520px]"
				/* 
          min-w ensures columns don't squash too much on very narrow screens. 
          Use a width that fits your layout. 
        */
			>
				{/* Summoner Info (w-5/12) */}
				<div className="flex items-center w-5/12 space-x-1">
					<Image
						src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
						alt="Champion Icon"
						width={24}
						height={24}
						className="rounded-full"
					/>
					<div className="flex flex-col items-center space-y-0.5">
						<Image
							src={`/images/summonerSpells/${participant.spell1Id}.png`}
							alt="Summoner Spell 1"
							width={16}
							height={16}
							className="rounded-full"
						/>
						<Image
							src={`/images/summonerSpells/${participant.spell2Id}.png`}
							alt="Summoner Spell 2"
							width={16}
							height={16}
							className="rounded-full"
						/>
					</div>
					<div className="flex flex-col">
						<Link
							href={`/profile?gameName=${participant.gameName}&tagLine=${participant.tagLine}&region=${region}`}
							className="font-bold hover:underline break-all"
						>
							{participant.gameName}#{participant.tagLine}
						</Link>
						<div className="text-gray-400">Lvl {participant.summonerLevel}</div>
					</div>
				</div>

				{/* Rank (w-4/12) */}
				<div className="flex items-center w-4/12 justify-start pl-2">
					{rankImageName && (
						<Image
							src={`/images/rankedEmblems/${rankImageName}.webp`}
							alt={`${participant.rank} Icon`}
							width={20}
							height={20}
							className="rounded-full mr-1"
						/>
					)}
					<div className="font-semibold">
						{participant.rank !== "Unranked" &&
							`${participant.rank} (${participant.lp} LP)`}
					</div>
				</div>

				{/* Stats (w-3/12) */}
				<div className="w-3/12 flex flex-col items-center">
					<span className="font-bold">
						{participant.wins}W / {participant.losses}L
					</span>
					<span className="text-gray-400">{winrate}% WR</span>
				</div>
			</div>
		);
	};

	const renderTeam = (team, teamName, teamColor, teamId) => (
		<div className="py-2 border-b border-gray-700">
			{/* Team header + Bans */}
			<div className="flex justify-between items-center mb-2">
				<span className={`font-bold ${teamColor} text-sm sm:text-base`}>
					{teamName}
				</span>
				<div className="flex space-x-1">
					{liveGameData.bannedChampions
						.filter((b) => b.teamId === teamId)
						.map((ban, index) => (
							<Image
								key={index}
								src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ban.championId}.png`}
								alt="Ban Icon"
								width={24}
								height={24}
								className="rounded-full"
							/>
						))}
				</div>
			</div>
			{/* Horizontal scroll container for participant rows */}
			<div className="overflow-x-auto">
				{team.map((participant) => renderParticipant(participant))}
			</div>
		</div>
	);

	return (
		<div className="bg-[#13151b] text-white rounded-lg p-2 sm:p-4 shadow-md w-full max-w-7xl">
			{/* Header */}
			<div className="py-2 px-4 text-sm sm:text-lg font-bold bg-gray-900 rounded-t-lg flex justify-between items-center">
				<span>{isArena ? "Arena" : "Ranked Solo | SR"}</span>
				<span>{elapsedTime}</span>
			</div>

			{/* Teams */}
			{renderTeam(
				liveGameData.participants.filter((p) => p.teamId === 100),
				"Blue Team",
				"text-blue-500",
				100
			)}
			{renderTeam(
				liveGameData.participants.filter((p) => p.teamId === 200),
				"Red Team",
				"text-red-500",
				200
			)}
		</div>
	);
};

export default LiveGame;
