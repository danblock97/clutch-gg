import Image from "next/image";

const ChampionMastery = ({ championMasteryData }) => {
	if (!championMasteryData || championMasteryData.length === 0) {
		return (
			<div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg p-6">
				<h2 className="text-white text-lg font-semibold">Champion Mastery</h2>
				<p className="text-gray-400 mt-4">
					No champion mastery data available.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-[#13151b] rounded-lg overflow-hidden shadow-lg p-6">
			<h2 className="text-white text-lg font-semibold">Champion Mastery</h2>
			<div className="flex flex-col justify-start mt-4">
				{championMasteryData.map((mastery) => {
					const championIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${mastery.championId}.png`;
					const masteryIcon = `/images/masteryEmblems/lvl${mastery.championLevel}.png`;

					return (
						<div
							key={mastery.championId}
							className="flex flex-row items-center  rounded-lg p-2 mr-4"
						>
							<div className="relative">
								<Image
									src={championIcon}
									alt="Champion Icon"
									width={50}
									height={50}
									className="rounded-full"
								/>
								<Image
									src={masteryIcon}
									alt="Mastery Icon"
									width={16}
									height={16}
									className="absolute top-0 right-0"
								/>
							</div>
							<h3 className="text-white text-lg font-semibold mt-4">
								{mastery.championName}
							</h3>
							<p className="text-white text-sm font-bold ml-4">
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
