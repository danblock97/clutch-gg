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
					<div className="flex items-center space-x-2">
						<Image
							className="w-10 h-10 rounded-full"
							src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
							alt="Champion"
							width={40}
							height={40}
						/>
						<span className="font-semibold">
							{participant.summonerName || "Unknown Player"}
						</span>
					</div>
					<div className="flex items-center space-x-3">
						<span className="font-semibold">{`${participant.kills} / ${participant.deaths} / ${participant.assists}`}</span>
						<span className="font-semibold">{`${(
							(participant.kills + participant.assists) /
							Math.max(1, participant.deaths)
						).toFixed(2)} KDA`}</span>
						<span className="font-semibold">{`${participant.totalMinionsKilled} CS`}</span>
						<span className="font-semibold">{`${participant.totalDamageDealtToChampions.toLocaleString()} DMG`}</span>
					</div>
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
				</div>
			))}
		</div>
	);
};

export default MatchDetails;
