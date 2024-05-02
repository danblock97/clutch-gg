import React from "react";
import Image from "next/image";
import Loading from "./Loading";
import Link from "next/link";

const ParticipantDetails = ({ participant }) => {
	const kda =
		participant.deaths === 0
			? (participant.kills + participant.assists).toFixed(1)
			: (
					(participant.kills + participant.assists) /
					participant.deaths
			  ).toFixed(1);

	const totalCS =
		participant.totalMinionsKilled +
		participant.totalAllyJungleMinionsKilled +
		participant.totalEnemyJungleMinionsKilled;

	return (
		<Link
			href={`/profile?gameName=${participant.riotIdGameName}&tagLine=${participant.riotIdTagline}`}
		>
			<div className="grid grid-cols-8 gap-x-4 p-2 my-2 rounded-lg bg-[#13151b]">
				<div className="col-span-2 flex items-center space-x-2">
					<Image
						src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${participant.individualPosition.toLowerCase()}.svg`}
						alt={`${participant.individualPosition} Position Icon`}
						width={32}
						height={32}
						className="w-8 h-8"
					/>
					<Image
						src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
						alt="Champion"
						width={32}
						height={32}
						className="w-8 h-8"
					/>
					<span className="text-sm font-semibold">
						{participant.riotIdGameName}#{participant.riotIdTagline}
					</span>
				</div>
				<div className="col-span-1 flex items-center space-x-4">
					<Image
						src={`/images/runeIcons/${participant.perks.styles[0].selections[0].perk}.png`}
						alt="Rune Icon"
						width={32}
						height={32}
						className="w-8 h-8"
					/>
				</div>
				<div className="col-span-1 flex items-center space-x-2">
					{[participant.summoner1Id, participant.summoner2Id].map(
						(spellId, idx) => (
							<div key={idx} className="flex items-center">
								<Image
									src={`/images/summonerSpells/${spellId}.png`}
									alt={`Summoner Spell ${idx + 1}`}
									width={32}
									height={32}
								/>
							</div>
						)
					)}
				</div>
				<div className="col-span-2 flex items-center space-x-2">
					{Array.from({ length: 7 }, (_, i) => participant[`item${i}`]).map(
						(itemId, idx) => (
							<div key={idx} className="flex items-center">
								{itemId > 0 ? (
									<Image
										src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${itemId}.png`}
										alt="Item"
										width={32}
										height={32}
										className="w-8 h-8"
									/>
								) : (
									<Image
										src="/images/placeholder.png"
										alt="No item"
										width={32}
										height={32}
										className="w-8 h-8"
									/>
								)}
							</div>
						)
					)}
				</div>
				<div className="col-span-2 flex items-center space-x-11">
					<div>
						<span className="text-sm font-semibold">{`${participant.kills} / ${participant.deaths} / ${participant.assists}`}</span>
						<br />
						<span className="text-xs text-gray-400">{`${kda} KDA`}</span>
					</div>
					<div>
						<span className="text-sm font-semibold">{`${totalCS} CS`}</span>
						<br />
						<span className="text-xs text-gray-400">
							{(participant.challenges.killParticipation * 100).toFixed(0)}% KP
						</span>
					</div>
					<div>
						<span className="text-sm font-semibold">{`${participant.totalDamageDealtToChampions.toLocaleString()} DMG`}</span>
						<br />
						<span className="text-xs text-gray-400">{`${participant.goldEarned.toLocaleString()} Gold`}</span>
					</div>
				</div>
			</div>
		</Link>
	);
};

const MatchDetails = ({ matchDetails, matchId }) => {
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

	// Calculate team stats
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
		<div className="bg-[#13151b] min-h-screen flex items-center justify-center px-4 py-2">
			<div className="bg-[#13151b] text-white max-w-screen-xl w-full">
				<div className="flex justify-between items-center mb-4">
					<div className="flex-1">
						<span className="text-xs font-semibold text-[#3182CE]">Team 1</span>
					</div>
					<div className="flex-1 flex justify-center">
						<span className="text-xs font-semibold text-[#3182CE]">
							{`${team1Stats.kills} / ${team1Stats.deaths} / ${team1Stats.assists}`}
						</span>
					</div>
					<div className="flex-1 flex justify-end">
						<span className="text-xs font-semibold text-[#3182CE] mr-2">
							Bans:
						</span>
						{bans.team1.map((ban) => (
							<Image
								key={ban.championId}
								src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ban.championId}.png`}
								alt="Champion Ban"
								width={20}
								height={20}
							/>
						))}
					</div>
				</div>
				{team1.map((participant, index) => (
					<ParticipantDetails key={index} participant={participant} />
				))}
				<div className="flex justify-between items-center">
					<div className="flex-1">
						<span className="text-xs font-semibold text-[#C53030]">Team 2</span>
					</div>
					<div className="flex-1 flex justify-center">
						<span className="text-xs font-semibold text-[#C53030]">
							{`${team2Stats.kills} / ${team2Stats.deaths} / ${team2Stats.assists}`}
						</span>
					</div>
					<div className="flex-1 flex justify-end">
						<span className="text-xs font-semibold text-[#C53030] mr-2">
							Bans:
						</span>
						{bans.team2.map((ban) => (
							<Image
								key={ban.championId}
								src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ban.championId}.png`}
								alt="Champion Ban"
								width={20}
								height={20}
							/>
						))}
					</div>
				</div>

				{team2.map((participant, index) => (
					<ParticipantDetails key={index} participant={participant} />
				))}
			</div>
		</div>
	);
};

export default MatchDetails;
