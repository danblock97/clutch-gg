import Image from "next/image";

const ChampionMastery = ({ championMasteryData }) => {
	// If no data, render a simplified container
	if (!championMasteryData || championMasteryData.length === 0) {
		return (
			<div
				className="
          p-6
          rounded-xl
          text-white
          border border-[#2f2f46]
          bg-gradient-to-br from-[#232337] to-[#1b1b2d]
          shadow-[0_4px_15px_rgba(0,0,0,0.6)]
          relative
        "
			>
				<h2 className="text-base font-semibold">Champion Mastery</h2>
				<p className="text-gray-400 mt-3 text-sm">
					No champion mastery data available.
				</p>
			</div>
		);
	}

	return (
		<div
			className="
        p-6
        rounded-xl
        text-white
        border border-[#2f2f46]
        bg-gradient-to-br from-[#232337] to-[#1b1b2d]
        shadow-[0_4px_15px_rgba(0,0,0,0.6)]
        relative
      "
		>
			<h2 className="text-base font-semibold">Champion Mastery</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
				{championMasteryData.map((mastery) => {
					const championIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${mastery.championId}.png`;
					const masteryLevel =
						mastery.championLevel > 10 ? 10 : mastery.championLevel;
					const masteryIcon = `https://raw.communitydragon.org/pbe/game/assets/ux/mastery/legendarychampionmastery/masterycrest_level_${masteryLevel}_art.png`;

					return (
						<div
							key={mastery.championId}
							className="
                flex flex-col items-center
                bg-[#2a2a3a]
                rounded-md
                p-4
                shadow-[0_2px_10px_rgba(0,0,0,0.6)]
                border border-gray-700
                hover:bg-[#35354d]
                transition-colors
                duration-200
              "
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

							{/* Mastery Icon & Level Badge */}
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
									className="
                    absolute
                    -bottom-3
                    left-1/2
                    transform -translate-x-1/2
                    bg-black
                    bg-opacity-80
                    text-white
                    text-xs
                    font-bold
                    px-1
                    py-0.5
                    rounded-full
                  "
								>
									{mastery.championLevel}
								</span>
							</div>

							{/* Champion Name & Points */}
							<div className="mt-3 text-center">
								<h3 className="text-sm font-medium">{mastery.championName}</h3>
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
