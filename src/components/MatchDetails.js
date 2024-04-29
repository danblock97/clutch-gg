const MatchDetails = ({ matchDetails, matchId }) => {
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
		<div className="bg-gray-800 text-white p-4">
			{match.info.participants.map((participant, index) => (
				<div
					key={index}
					className={`flex items-center justify-between p-2 my-1 rounded ${
						participant.win ? "bg-green-500" : "bg-red-500"
					}`}
				>
					<div className="flex items-center">
						<img
							className="w-10 h-10 rounded-full mr-2"
							src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
							alt="Champion"
						/>
						<span className="font-bold">{participant.summonerName}</span>
					</div>
					<div className="flex items-center">
						<div className="text-center mx-2">
							<span className="font-bold">{participant.kills}</span> /{" "}
							<span className="text-red-300">{participant.deaths}</span> /{" "}
							<span className="font-bold">{participant.assists}</span>
						</div>
						<div className="text-center mx-2">
							<span className="font-bold">
								{(participant.kills + participant.assists) /
									Math.max(1, participant.deaths).toFixed(1)}{" "}
								KDA
							</span>
						</div>
						<div className="text-center mx-2">
							<span className="font-bold">
								{participant.totalMinionsKilled}
							</span>{" "}
							CS
						</div>
						<div className="text-center mx-2">
							<span className="font-bold">
								{participant.totalDamageDealtToChampions.toLocaleString()}
							</span>{" "}
							DMG
						</div>
					</div>
					<div className="flex">
						{Array.isArray(participant.items) &&
							participant.items.map(
								(itemId, idx) =>
									itemId && (
										<img
											key={idx}
											className="w-6 h-6 rounded mr-1"
											src={`/path/to/items/${itemId}.png`}
											alt="Item"
										/>
									)
							)}
					</div>
				</div>
			))}
		</div>
	);
};

export default MatchDetails;
