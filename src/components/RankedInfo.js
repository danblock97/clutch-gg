import Image from "next/image";

const RankedInfo = ({ rankedData }) => {
	const soloRankedData = rankedData.find(
		(item) => item.queueType === "RANKED_SOLO_5x5"
	);
	const flexRankedData = rankedData.find(
		(item) => item.queueType === "RANKED_FLEX_SR"
	);

	const renderRankedItem = (data, queueType) => {
		const queueName = getQueueName(queueType);

		if (data) {
			const rankedIcon = `/images/rankedEmblems/${data.tier.toLowerCase()}.webp`;
			const maxLeaguePoints = 100;
			const progressBarWidth = Math.min(
				(data.leaguePoints / maxLeaguePoints) * 100,
				100
			);
			const winrate =
				data.wins + data.losses > 0
					? ((data.wins / (data.wins + data.losses)) * 100).toFixed(0)
					: "0";

			return (
				<div className="relative p-6 bg-[#1e1e2f] rounded-lg shadow-md border border-transparent hover:border-[#ffd700] overflow-hidden w-full">
					{/* Gold Glow */}
					<div className="absolute inset-0 rounded-lg border border-transparent shadow-lg pointer-events-none"></div>

					<h2 className="text-white text-lg font-semibold mb-3">{queueName}</h2>

					<div className="flex items-center">
						<Image
							src={rankedIcon}
							alt={`${data.tier} Emblem`}
							width={60}
							height={60}
							className="rounded-full"
						/>
						<div className="ml-4 flex-1">
							<h3 className="text-white text-md font-bold">
								{data.tier} {data.rank}
							</h3>
							<p className="text-gray-300 text-sm">{data.leaguePoints} LP</p>
							<p className="text-gray-300 text-sm">
								{data.wins}W {data.losses}L | {winrate}% WR
							</p>
							{/* Progress Bar */}
							<div className="mt-2 w-full bg-gray-700 rounded-full h-2">
								<div
									className="h-2 rounded-full bg-[#ffd700]"
									style={{ width: `${progressBarWidth}%` }}
								></div>
							</div>
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="relative p-6 bg-[#1e1e2f] rounded-lg shadow-md border border-transparent hover:border-[#ffd700] overflow-hidden w-full">
					{/* Gold Glow */}
					<div className="absolute inset-0 rounded-lg border border-transparent shadow-lg pointer-events-none"></div>

					<h2 className="text-white text-lg font-semibold mb-3">{queueName}</h2>

					<p className="text-gray-300 text-center">Unranked</p>
				</div>
			);
		}
	};

	const getQueueName = (queueType) => {
		switch (queueType) {
			case "RANKED_SOLO_5x5":
				return "Ranked Solo/Duo";
			case "RANKED_FLEX_SR":
				return "Ranked Flex";
			default:
				return "Unknown Queue";
		}
	};

	return (
		<div className="flex flex-col space-y-4">
			{/* Ranked Solo/Duo */}
			<div className="w-full">
				{renderRankedItem(soloRankedData, "RANKED_SOLO_5x5")}
			</div>

			{/* Ranked Flex */}
			<div className="w-full">
				{renderRankedItem(flexRankedData, "RANKED_FLEX_SR")}
			</div>
		</div>
	);
};

export default RankedInfo;
