import Image from "next/image";

const ChampionMastery = ({ championMasteryData }) => {
	if (!championMasteryData || championMasteryData.length === 0) {
		return (
			<div className="bg-[#1e1e2f] rounded-lg overflow-hidden shadow-lg p-6">
				<h2 className="text-white text-lg font-semibold">Champion Mastery</h2>
				<p className="text-gray-400 mt-4">
					No champion mastery data available.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-[#1e1e2f] rounded-lg overflow-hidden shadow-lg p-6">
			<h2 className="text-white text-lg font-semibold">Champion Mastery</h2>
			<div className="flex flex-col justify-start mt-4">
				{championMasteryData.map((mastery) => {
					const championIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${mastery.championId}.png`;
					const masteryLevel =
						mastery.championLevel > 10 ? 10 : mastery.championLevel;
					const masteryIcon = `https://raw.communitydragon.org/pbe/game/assets/ux/mastery/legendarychampionmastery/masterycrest_level_${masteryLevel}_art.png`;

					return (
						<div
							key={mastery.championId}
							className="flex flex-row items-center rounded-lg p-2 mr-4"
						>
							<Image
								src={championIcon}
								alt="Champion Icon"
								width={50}
								height={50}
								className="rounded-full"
							/>
							<div className="relative">
								<Image
									src={masteryIcon}
									alt="Mastery Icon"
									width={80}
									height={80}
									className="mx-2"
								/>
								<span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white font-bold text-xs  px-1 py-0.5 rounded">
									{mastery.championLevel}
								</span>
							</div>
							<h3 className="text-white text-lg font-semibold ml-4">
								{mastery.championName}
							</h3>
							<p className="text-white text-sm font-bold ml-2">
								{mastery.championPoints.toLocaleString()}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default ChampionMastery;
