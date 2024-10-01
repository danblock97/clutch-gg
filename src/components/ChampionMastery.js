import Image from "next/image";

const ChampionMastery = ({ championMasteryData }) => {
	if (!championMasteryData || championMasteryData.length === 0) {
		return (
			<div
				className="relative bg-[#1e1e2f] p-6 rounded-md shadow-lg border border-gray-800 
                            before:absolute before:top-0 before:left-0 before:w-full before:h-full 
                            before:rounded-md before:border before:border-gray-700 
                            before:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6),inset_-2px_-2px_5px_rgba(255,255,255,0.1)]"
			>
				<h2 className="text-white text-base font-semibold">Champion Mastery</h2>
				<p className="text-gray-400 mt-3 text-sm">
					No champion mastery data available.
				</p>
			</div>
		);
	}

	return (
		<div
			className="relative bg-[#1e1e2f] p-6 rounded-md shadow-lg border border-gray-800 
                        before:absolute before:top-0 before:left-0 before:w-full before:h-full 
                        before:rounded-md before:border before:border-gray-700 
                        before:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6),inset_-2px_-2px_5px_rgba(255,255,255,0.1)]"
		>
			<h2 className="text-white text-base font-semibold">Champion Mastery</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
				{championMasteryData.map((mastery) => {
					const championIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${mastery.championId}.png`;
					const masteryLevel =
						mastery.championLevel > 10 ? 10 : mastery.championLevel;
					const masteryIcon = `https://raw.communitydragon.org/pbe/game/assets/ux/mastery/legendarychampionmastery/masterycrest_level_${masteryLevel}_art.png`;

					return (
						<div
							key={mastery.championId}
							className="flex flex-col items-center bg-[#2a2a3a] rounded-md p-4 shadow-inner border border-gray-700 
                                       hover:bg-[#35354d] transition-colors duration-200"
							title={`Champion: ${mastery.championName}, Mastery Level: ${mastery.championLevel}`}
						>
							{/* Champion Icon */}
							<div className="relative">
								<Image
									src={championIcon}
									alt={`${mastery.championName} Icon`}
									width={60}
									height={60}
									className="rounded-full"
									loading="lazy"
								/>
							</div>

							{/* Mastery Icon with Level Badge */}
							<div className="relative mt-2">
								<Image
									src={masteryIcon}
									alt={`Mastery Level ${masteryLevel} Icon`}
									width={70}
									height={70}
									className="rounded-md"
									loading="lazy"
								/>
								<span
									className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 
                                                bg-black bg-opacity-80 text-white text-xs font-bold px-1 py-0.5 rounded-full"
								>
									{mastery.championLevel}
								</span>
							</div>

							{/* Champion Name and Points */}
							<div className="mt-3 text-center">
								<h3 className="text-white text-sm font-medium">
									{mastery.championName}
								</h3>
								<p className="text-gray-400 text-xs font-semibold">
									{mastery.championPoints.toLocaleString()} pts
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default ChampionMastery;
