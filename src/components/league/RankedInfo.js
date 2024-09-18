import Image from "next/image";

const RankedInfo = ({ rankedData }) => {
	const soloRankedData = rankedData.find(
		(item) => item.queueType === "RANKED_SOLO_5x5"
	);
	const flexRankedData = rankedData.find(
		(item) => item.queueType === "RANKED_FLEX_SR"
	);

	const renderRankedItem = (data, queueType) => {
		if (data) {
			const rankedIcon = `/images/rankedEmblems/${data.tier.toLowerCase()}.webp`;
			const maxLeaguePoints = 100; // Define the maximum league points in a tier (you may need to adjust this)
			const progressBarWidth = (data.leaguePoints / maxLeaguePoints) * 100; // Calculate progress relative to max points
			const clampedProgressBarWidth = Math.min(progressBarWidth, 100); // Clamp the progress between 0 and 100

			const winrate = (data.wins / (data.wins + data.losses)) * 100;

			return (
				<div className="p-4 mb-6 rounded-lg shadow-md bg-[#13151b] border border-transparent relative overflow-hidden">
					{/* Added gold glow only around the border */}
					<div className="absolute inset-0 rounded-lg border border-transparent pointer-events-none shadow-[0_0_20px_rgba(255,215,0,0.8)]"></div>

					<h2 className="text-[#e5e7eb] text-xl font-bold mb-2 relative z-10">
						{getQueueName(queueType)}
					</h2>

					<div className="flex items-center mt-4 relative z-10">
						<Image src={rankedIcon} alt="Ranked Icon" width={75} height={75} />
						<div className="ml-4">
							<h3 className="text-[#e5e7eb] text-lg font-semibold">
								{data.tier} {data.rank}
							</h3>
							<p className="text-gray-400 text-sm">{data.leaguePoints} LP</p>
							<p className="text-gray-400 text-sm">
								{data.wins}W {data.losses}L | {winrate.toFixed(0)}% WR
							</p>
							<div className="bg-gray-600 h-2 mt-1 rounded">
								<div
									className="bg-green-400 h-2 rounded"
									style={{ width: `${clampedProgressBarWidth}%` }}
								></div>
							</div>
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="p-4 mb-6 rounded-lg shadow-md bg-[#13151b] border border-transparent relative overflow-hidden">
					{/* Added gold glow only around the border */}
					<div className="absolute inset-0 rounded-lg border border-transparent pointer-events-none shadow-[0_0_20px_rgba(255,215,0,0.8)]"></div>

					<h2 className="text-[#e5e7eb] text-xl font-bold mb-2 relative z-10">
						{getQueueName(queueType)}
					</h2>

					<p className="text-gray-400 text-sm relative z-10">Unranked</p>
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
		<div className="space-y-6">
			{/* Separate boxes for Ranked Solo/Duo and Ranked Flex */}
			{renderRankedItem(soloRankedData, "RANKED_SOLO_5x5")}
			{renderRankedItem(flexRankedData, "RANKED_FLEX_SR")}
		</div>
	);
};

export default RankedInfo;
