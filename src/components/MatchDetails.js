import Image from "next/image";

const MatchDetails = ({ matchDetails, matchId, accountData }) => {
	if (!matchDetails) {
		return (
			<div className="text-center text-white">Loading match details...</div>
		);
	}

	const match = matchDetails.find((m) => m.metadata.matchId === matchId);

	if (!match) {
		return (
			<div className="text-center text-white">Match details not found.</div>
		);
	}

	return (
		<div className="bg-gray-900 p-4 text-white">
			{match.info.participants.map((participant, index) => (
				<div
					key={index}
					className={`flex justify-between items-center p-3 my-1 rounded-lg ${
						participant.win ? "bg-blue-900" : "bg-red-900"
					}`}
				>
					{/* Position Icon */}
					<div className="flex items-center space-x-2">
						<Image
							className="w-6 h-6"
							src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${participant.individualPosition.toLowerCase()}.svg`}
							alt={`${participant.individualPosition} Position Icon`}
							width={24}
							height={24}
						/>
					</div>
					{/* Champion Icon */}
					<div>
						<Image
							className="w-10 h-10 rounded-full"
							src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
							alt="Champion"
							width={40}
							height={40}
						/>
					</div>
					{/* Riot ID */}
					<span className="font-semibold">{`${participant.riotIdGameName}#${participant.riotIdTagline}`}</span>
					{/* Summoner Spells */}
					<div className="flex space-x-1">
						{[participant.summoner1Id, participant.summoner2Id].map(
							(spellId, idx) => (
								<Image
									key={idx}
									src={`/images/summonerSpells/${spellId}.png`}
									alt={`Summoner Spell ${idx + 1}`}
									width={24}
									height={24}
								/>
							)
						)}
					</div>
					{/* Items */}
					<div className="flex space-x-1">
						{Array.from({ length: 7 }, (_, i) => participant[`item${i}`])
							.filter((itemId) => itemId > 0)
							.map((itemId, idx) => (
								<Image
									key={idx}
									className="w-8 h-8"
									src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${itemId}.png`}
									alt="Item"
									width={32}
									height={32}
								/>
							))}
					</div>
					{/* K/D/A */}
					<span className="font-semibold">{`${participant.kills} / ${participant.deaths} / ${participant.assists}`}</span>
					{/* Total CS */}
					<span className="font-semibold">{`${participant.totalMinionsKilled} CS`}</span>
					{/* Total Damage */}
					<span className="font-semibold">{`${participant.totalDamageDealtToChampions.toLocaleString()} DMG`}</span>
				</div>
			))}
		</div>
	);
};

export default MatchDetails;
