import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import OutageBanner from "@/components/OutageBanner";

const LiveGame = ({ liveGameData }) => {
	const [isArena, setIsArena] = useState(false);

	useEffect(() => {
		setIsArena(liveGameData.queueId === 1700);
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

		return (
			<div
				key={participant.summonerId}
				className="flex flex-col md:flex-row items-center py-1 border-b border-gray-700"
			>
				<div className="flex items-center w-full md:w-2/12 mb-2 md:mb-0">
					<Image
						src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
						alt="Champion Icon"
						width={36}
						height={36}
						className="rounded-full"
					/>
					<div className="flex flex-col items-center ml-1">
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
							className="rounded-full mt-1"
						/>
					</div>
					<div className="ml-2">
						<div className="font-bold text-xs">
							<Link
								href={`/profile?gameName=${participant.gameName}&tagLine=${participant.tagLine}`}
							>
								{participant.gameName}#{participant.tagLine}
							</Link>
						</div>
						<div className="text-gray-400 text-xs">
							Level {participant.summonerLevel}
						</div>
					</div>
				</div>
				<div className="w-full md:w-1/12 flex flex-col items-center mb-2 md:mb-0">
					{participant.perks &&
						participant.perks.styles &&
						participant.perks.styles[0] &&
						participant.perks.styles[0].selections[0] && (
							<Image
								src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/runes/icons/${participant.perks.styles[0].selections[0].perk}.png`}
								alt="Primary Rune"
								width={16}
								height={16}
								className="rounded-full"
							/>
						)}
					{participant.perks &&
						participant.perks.styles &&
						participant.perks.styles[1] && (
							<Image
								src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/runes/icons/${participant.perks.styles[1].style}.png`}
								alt="Secondary Rune"
								width={16}
								height={16}
								className="rounded-full mt-1"
							/>
						)}
				</div>
				<div className="w-full md:w-2/12 flex items-center justify-start text-center mb-2 md:mb-0">
					{rankImageName && (
						<Image
							src={`/images/rankedEmblems/${rankImageName}.webp`}
							alt={`${participant.rank} Icon`}
							width={20}
							height={20}
							className="rounded-full mr-1"
						/>
					)}
					<div>
						<div className="font-semibold text-xs">
							{participant.rank !== "Unranked" &&
								`${participant.rank} (${participant.lp} LP)`}
						</div>
					</div>
				</div>
				<div className="w-full md:w-2/12 text-center">
					<div className="font-bold text-xs">
						{participant.wins}W / {participant.losses}L
					</div>
					<div className="text-gray-400 text-xs">
						{(
							(participant.wins / (participant.wins + participant.losses)) *
							100
						).toFixed(0)}
						% WR
					</div>
				</div>
			</div>
		);
	};

	const renderTeam = (team, teamName, teamColor, teamId) => (
		<div className="p-2 border-b border-gray-700">
			<div className="flex justify-between items-center mb-2">
				<div className={`text-lg font-bold ${teamColor}`}>{teamName}</div>
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
			{team.map((participant) => renderParticipant(participant))}
		</div>
	);

	const renderArena = () => {
		let participants = liveGameData.participants;
		let teams = {};

		participants.forEach((participant, index) => {
			const teamId = Math.floor(index / 2);
			if (!teams[teamId]) {
				teams[teamId] = [];
			}
			teams[teamId].push(participant);
		});

		return Object.values(teams).map((team, index) => (
			<div key={index} className="bg-[#13151b] text-white p-4 mb-4 rounded-lg">
				<h3 className="text-lg font-bold text-center">Team {index + 1}</h3>
				{team.map((participant) => renderParticipant(participant))}
			</div>
		));
	};

	const outageMessage = process.env.NEXT_PUBLIC_OUTAGE_MESSAGE; // Access the environment variable

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#0e1015]">
			<OutageBanner message={outageMessage} /> {/* Render the OutageBanner */}
			<div className="bg-[#13151b] text-white rounded-lg p-4 shadow-md max-w-7xl w-full">
				<div className="py-2 px-4 text-lg font-bold bg-gray-900 rounded-t-lg flex justify-between items-center">
					<div>
						Ranked Solo <span className="text-gray-400">| Summoner's Rift</span>
					</div>
				</div>
				{isArena ? (
					<div className="flex flex-wrap justify-center">{renderArena()}</div>
				) : (
					<>
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
					</>
				)}
			</div>
		</div>
	);
};

export default LiveGame;
