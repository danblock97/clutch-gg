import React from "react";
import Image from "next/image";
import Loading from "./Loading";

const ParticipantDetails = ({ participant }) => {
	return (
		<div className="flex justify-between items-center p-4 my-2 rounded-lg bg-gray-800">
			{/* Position Icon and Champion Name */}
			<div className="flex items-center space-x-2">
				<Image
					className="w-8 h-8"
					src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${participant.individualPosition.toLowerCase()}.svg`}
					alt={`${participant.individualPosition} Position Icon`}
					width={32}
					height={32}
				/>
				<Image
					className="w-8 h-8"
					src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
					alt="Champion"
					width={32}
					height={32}
				/>
				<span className="text-sm font-semibold">
					{participant.riotIdGameName}#{participant.riotIdTagline}
				</span>
			</div>
			{/* Rune Icon */}
			<Image
				className="w-8 h-8"
				src={`/images/runeIcons/${participant.perks.styles[0].selections[0].perk}.png`}
				alt="Champion"
				width={32}
				height={32}
			/>
			{/* Summoner Spells */}
			<div className="flex items-center space-x-2">
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
			{/* Items */}
			<div className="flex items-center space-x-2">
				{Array.from({ length: 7 }, (_, i) => participant[`item${i}`]).map(
					(itemId, idx) => (
						<div key={idx} className="flex items-center">
							{itemId > 0 ? (
								<Image
									className="w-8 h-8"
									src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${itemId}.png`}
									alt="Item"
									width={32}
									height={32}
								/>
							) : (
								<Image
									className="w-8 h-8"
									src="/images/placeholder.png"
									alt="No item"
									width={32}
									height={32}
								/>
							)}
						</div>
					)
				)}
			</div>
			{/* Stats */}
			<div className="flex flex-wrap items-center space-x-2">
				<span className="text-xs font-semibold">{`${participant.kills} / ${participant.deaths} / ${participant.assists}`}</span>
				<span className="text-xs font-semibold">{`${participant.totalMinionsKilled} CS`}</span>
				<span className="text-xs font-semibold">{`${participant.totalDamageDealtToChampions.toLocaleString()} DMG`}</span>
			</div>
		</div>
	);
};

const MatchDetails = ({ matchDetails, matchId, accountData }) => {
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

	const team1 = match.info.participants.filter(
		(participant) => participant.teamId === 100
	);
	const team2 = match.info.participants.filter(
		(participant) => participant.teamId === 200
	);

	return (
		<div className="bg-gray-900 min-h-screen flex items-center justify-center px-6">
			<div className="bg-gray-900 text-white max-w-screen-xl w-full">
				{/* Team 1 */}
				<div className="mb-4">
					<span className="text-xs font-semibold" style={{ color: "#3182CE" }}>
						Team 1
					</span>
					{team1.map((participant, index) => (
						<ParticipantDetails key={index} participant={participant} />
					))}
				</div>
				{/* Team 2 */}
				<div>
					<span className="text-xs font-semibold" style={{ color: "#C53030" }}>
						Team 2
					</span>
					{team2.map((participant, index) => (
						<ParticipantDetails key={index} participant={participant} />
					))}
				</div>
			</div>
		</div>
	);
};

export default MatchDetails;
