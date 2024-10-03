import React, { useEffect, useState } from "react";
import Image from "next/image";
import Loading from "./Loading";
import Link from "next/link";
import Tag from "@/components/Tag";

const fetchArenaAugments = async () => {
	const response = await fetch(
		"https://raw.communitydragon.org/latest/cdragon/arena/en_us.json"
	);
	const data = await response.json();
	return data.augments;
};

const MatchDetails = ({ matchDetails, matchId, selectedSummonerPUUID }) => {
	const [augments, setAugments] = useState([]);

	useEffect(() => {
		const getAugments = async () => {
			const data = await fetchArenaAugments();
			setAugments(data);
		};
		getAugments();
	}, []);

	const getAugmentIcon = (id) => {
		const augment = augments.find((aug) => aug.id === id);
		return augment
			? `https://raw.communitydragon.org/latest/game/${augment.iconSmall}`
			: null;
	};

	if (!matchDetails) {
		return (
			<div className="text-center text-white">
				<Loading />
			</div>
		);
	}

	const match = matchDetails.find((m) => m.metadata.matchId === matchId);
	if (!match) {
		return (
			<div className="text-center text-white">Match details not found.</div>
		);
	}

	const participants = match.info.participants;

	// Calculate CS/Min for each participant and find the one with the highest CS/Min
	let maxCsPerMin = 0;
	let maxCsPerMinParticipant = null;

	participants.forEach((participant) => {
		const csPerMin =
			(participant.totalMinionsKilled + participant.neutralMinionsKilled) /
			(match.info.gameDuration / 60);
		participant.csPerMin = csPerMin;

		if (csPerMin > maxCsPerMin) {
			maxCsPerMin = csPerMin;
			maxCsPerMinParticipant = participant.puuid;
		}
	});

	const participant = participants.find(
		(p) => p.puuid === selectedSummonerPUUID
	);

	const tags = [];

	if (participant) {
		if (participant.firstBloodKill) {
			tags.push(
				<Tag
					key="first-blood"
					text="FB"
					hoverText="First Blood"
					color="bg-green-500 text-white text-sm px-2 py-1"
				/>
			);
		}

		if (participant.tripleKills > 0) {
			tags.push(
				<Tag
					key="triple-kill"
					text="Triple"
					hoverText={`Triple Kill x${participant.tripleKills}`}
					color="bg-yellow-500 text-white text-sm px-2 py-1"
				/>
			);
		}

		if (participant.deaths === 0) {
			tags.push(
				<Tag
					key="unkillable"
					text="Unkillable"
					hoverText="0 Deaths"
					color="bg-yellow-500 text-white text-sm px-2 py-1"
				/>
			);
		}

		if (participant.challenges.damagePerMinute > 800) {
			tags.push(
				<Tag
					key="good-damage"
					text="Good DMG"
					hoverText={`Damage Dealt: ${participant.totalDamageDealtToChampions.toLocaleString()}`}
					color="bg-yellow-500 text-white text-sm px-2 py-1"
				/>
			);
		}

		if (participant.puuid === maxCsPerMinParticipant) {
			tags.push(
				<Tag
					key="cs-star"
					text="CS Star"
					hoverText={`Highest CS/Min: ${participant.csPerMin.toFixed(1)}`}
					color="bg-blue-500 text-white text-sm px-2 py-1"
				/>
			);
		}
	} else {
		console.error("Participant not found for PUUID:", selectedSummonerPUUID);
	}

	const isArena = match.info.queueId === 1700;
	const isARAM = match.info.queueId === 450;

	if (isArena) {
		let arenaParticipants = match.info.participants;
		let teams = {};

		// Extract playerScore0 and sort
		arenaParticipants = arenaParticipants.map((participant) => ({
			...participant,
			playerScore0: participant.missions.playerScore0,
		}));

		// Sort participants by playerScore0
		arenaParticipants.sort((a, b) => a.playerScore0 - b.playerScore0);

		// Group participants into pairs
		arenaParticipants.forEach((participant, index) => {
			const teamId = Math.floor(index / 2); // Creates 8 teams of 2 participants each
			if (!teams[teamId]) {
				teams[teamId] = [];
			}
			teams[teamId].push(participant);
		});

		// Function to convert number to ordinal
		function getOrdinal(n) {
			const s = ["th", "st", "nd", "rd"];
			const v = n % 100;
			return n + (s[(v - 20) % 10] || s[v] || s[0]);
		}

		const getPlacementColor = (placement) => {
			switch (placement) {
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

		// Render sorted teams
		const teamComponents = Object.values(teams).map((team, index) => {
			const placement = team[0].playerScore0; // Assuming playerScore0 starts from 0
			const colorClass = getPlacementColor(placement);

			return (
				<div
					key={index}
					className="bg-[#13151b] text-white p-2 mb-2 rounded-lg"
				>
					<h3 className={`text-sm font-bold ${colorClass}`}>
						{getOrdinal(team[0].playerScore0)} Place
					</h3>
					{team.map((participant) => (
						<ParticipantDetails
							key={participant.participantId}
							participant={participant}
							isArena={true}
							getAugmentIcon={getAugmentIcon}
						/>
					))}
				</div>
			);
		});

		return (
			<div className="bg-[#13151b] min-h-screen flex flex-col items-center justify-center px-2 py-1">
				<div className="max-w-6xl w-full">
					<div className="tags flex space-x-1 mb-2">{tags}</div>
					{teamComponents}
				</div>
			</div>
		);
	}

	// Regular match logic
	const calculateTeamStats = (participants) => {
		return participants.reduce(
			(acc, participant) => {
				acc.kills += participant.kills;
				acc.deaths += participant.deaths;
				acc.assists += participant.assists;
				return acc;
			},
			{
				kills: 0,
				deaths: 0,
				assists: 0,
			}
		);
	};
	const team1 = match.info.participants.filter((p) => p.teamId === 100);
	const team2 = match.info.participants.filter((p) => p.teamId === 200);
	const team1Stats = calculateTeamStats(team1);
	const team2Stats = calculateTeamStats(team2);
	const bans = {
		team1: match.info.teams.find((t) => t.teamId === 100).bans,
		team2: match.info.teams.find((t) => t.teamId === 200).bans,
	};

	return (
		<div className="bg-[#13151b] min-h-auto flex items-center justify-center px-2 py-1">
			<div className="bg-[#13151b] text-white max-w-6xl w-full p-2">
				<div className="tags flex space-x-1 mb-1 overflow-x-auto">
					{/* Render tags here */}
				</div>

				{/* Team 1 */}
				<div className="flex justify-between items-center mb-1">
					<span className="text-sm font-semibold text-[#3182CE]">Team 1</span>
					<div className="text-sm font-semibold text-[#3182CE]">{`${team1Stats.kills} / ${team1Stats.deaths} / ${team1Stats.assists}`}</div>
					<div className="flex justify-end items-center">
						<span className="text-sm font-semibold text-[#3182CE] mr-1">
							Bans:
						</span>
						{bans.team1.map((ban, idx) => (
							<Image
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

				{/* Team 1 Participants */}
				<div className="flex flex-col space-y-1">
					{team1.map((participant, index) => (
						<ParticipantDetails
							key={index}
							participant={participant}
							selectedSummonerPUUID={selectedSummonerPUUID}
							getAugmentIcon={getAugmentIcon}
						/>
					))}
				</div>

				{/* Team 2 */}
				<div className="flex justify-between items-center mt-1 mb-1">
					<span className="text-sm font-semibold text-[#C53030]">Team 2</span>
					<div className="text-sm font-semibold text-[#C53030]">{`${team2Stats.kills} / ${team2Stats.deaths} / ${team2Stats.assists}`}</div>
					<div className="flex justify-end items-center">
						<span className="text-sm font-semibold text-[#C53030] mr-1">
							Bans:
						</span>
						{bans.team2.map((ban, idx) => (
							<Image
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

				{/* Team 2 Participants */}
				<div className="flex flex-col space-y-1">
					{team2.map((participant, index) => (
						<ParticipantDetails
							key={index}
							participant={participant}
							selectedSummonerPUUID={selectedSummonerPUUID}
							getAugmentIcon={getAugmentIcon}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

const ParticipantDetails = ({
	participant,
	selectedSummonerPUUID,
	getAugmentIcon,
}) => {
	const kda =
		participant.deaths === 0
			? (participant.kills + participant.assists).toFixed(1)
			: (
					(participant.kills + participant.assists) /
					participant.deaths
			  ).toFixed(1);

	return (
		<Link
			href={`/profile?gameName=${participant.riotIdGameName}&tagLine=${participant.riotIdTagline}`}
		>
			<div className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded-lg hover:bg-[#2e2e2e] transition duration-150">
				{/* Champion Icon & Player Name */}
				<div className="flex items-center space-x-2 flex-shrink-0 w-1/4">
					<Image
						src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
						alt="Champion"
						width={32}
						height={32}
						className="w-8 h-8"
					/>
					<span
						className="text-sm font-semibold truncate"
						title={`${participant.riotIdGameName}#${participant.riotIdTagline}`}
					>
						{participant.riotIdGameName}#{participant.riotIdTagline}
					</span>
				</div>

				{/* Summoner Spells */}
				<div className="flex items-center space-x-1 flex-shrink-0 w-1/6 justify-center">
					{[participant.summoner1Id, participant.summoner2Id].map(
						(spellId, idx) => (
							<Image
								key={idx}
								src={`/images/summonerSpells/${spellId}.png`}
								alt={`Summoner Spell ${idx + 1}`}
								width={24}
								height={24}
								className="w-6 h-6"
							/>
						)
					)}
				</div>

				{/* Items */}
				<div className="flex items-center space-x-1 flex-shrink-0 w-1/4 justify-center">
					{Array.from({ length: 6 }, (_, i) => participant[`item${i}`]).map(
						(itemId, idx) => (
							<div key={idx} className="flex items-center">
								{itemId > 0 ? (
									<Image
										src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${itemId}.png`}
										alt="Item"
										width={24}
										height={24}
										className="w-6 h-6"
									/>
								) : (
									<Image
										src="/images/placeholder.png"
										alt="No item"
										width={24}
										height={24}
										className="w-6 h-6"
									/>
								)}
							</div>
						)
					)}
				</div>

				{/* KDA */}
				<div className="flex flex-col items-center flex-shrink-0 w-1/6">
					<span className="text-sm font-semibold">{`${participant.kills} / ${participant.deaths} / ${participant.assists}`}</span>
					<span className="text-xs text-gray-400">{`${kda} KDA`}</span>
				</div>

				{/* CS & DMG */}
				<div className="flex flex-col items-center flex-shrink-0 w-1/6">
					<span className="text-sm font-semibold">{`${
						participant.totalMinionsKilled + participant.neutralMinionsKilled
					} CS`}</span>
					<span className="text-xs text-gray-400">{`${participant.totalDamageDealtToChampions.toLocaleString()} DMG`}</span>
				</div>
			</div>
		</Link>
	);
};

export default MatchDetails;
