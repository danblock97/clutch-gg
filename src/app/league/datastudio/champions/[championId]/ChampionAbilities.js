"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

const AbilityButton = ({ ability, version, selected, onClick, type }) => {
	const keyMap = {
		passive: "P",
		spell1: "Q",
		spell2: "W",
		spell3: "E",
		spell4: "R",
	};
	const abilityKey = keyMap[type];

	return (
		<button
			onClick={onClick}
			className={`relative p-2 rounded-md transition-all duration-200 border-2 ${
				selected ? "border-yellow-500" : "border-transparent"
			}`}
		>
			<Image
				src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/${ability.image.group}/${ability.image.full}`}
				alt={ability.name}
				width={56}
				height={56}
				className="rounded-md"
			/>
			<span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-xs font-bold px-1 py-0.5 rounded-sm">
				{abilityKey}
			</span>
		</button>
	);
};

const processPlaceholders = (text) => {
	if (!text) return "";
	const regex = /{{\s*([^{}\s]+)\s*}}/g;
	const tooltipText =
		"Any missing data is hidden and only available on the League Client.";
	const replacement = `<span class="tooltip-wrapper"><span class="tooltip-icon">?</span><span class="tooltip-content">${tooltipText}</span></span>`;
	return text.replace(regex, replacement);
};

export default function ChampionAbilities({ passive, spells, version }) {
	const allAbilities = useMemo(
		() => ({
			passive,
			spell1: spells[0],
			spell2: spells[1],
			spell3: spells[2],
			spell4: spells[3],
		}),
		[passive, spells]
	);

	const [selectedAbility, setSelectedAbility] = useState(allAbilities.passive);
	const [selectedType, setSelectedType] = useState("passive");

	const handleSelectAbility = (type) => {
		setSelectedAbility(allAbilities[type]);
		setSelectedType(type);
	};

	const processedDescription = useMemo(() => {
		return processPlaceholders(selectedAbility.description);
	}, [selectedAbility]);

	const processedCost = useMemo(() => {
		if (!selectedAbility.costBurn || selectedAbility.costBurn === "0") {
			return null;
		}
		const costString = `${selectedAbility.costBurn} ${selectedAbility.costType}`;
		return processPlaceholders(costString);
	}, [selectedAbility]);

	if (!passive || !spells || spells.length < 4) {
		return null;
	}

	return (
		<div className="bg-gray-800/50 p-6 rounded-lg">
			<h3 className="text-2xl font-bold mb-4">Abilities</h3>
			<div className="flex justify-center space-x-2 md:space-x-4 mb-4">
				<AbilityButton
					ability={allAbilities.passive}
					version={version}
					selected={selectedType === "passive"}
					onClick={() => handleSelectAbility("passive")}
					type="passive"
				/>
				<AbilityButton
					ability={allAbilities.spell1}
					version={version}
					selected={selectedType === "spell1"}
					onClick={() => handleSelectAbility("spell1")}
					type="spell1"
				/>
				<AbilityButton
					ability={allAbilities.spell2}
					version={version}
					selected={selectedType === "spell2"}
					onClick={() => handleSelectAbility("spell2")}
					type="spell2"
				/>
				<AbilityButton
					ability={allAbilities.spell3}
					version={version}
					selected={selectedType === "spell3"}
					onClick={() => handleSelectAbility("spell3")}
					type="spell3"
				/>
				<AbilityButton
					ability={allAbilities.spell4}
					version={version}
					selected={selectedType === "spell4"}
					onClick={() => handleSelectAbility("spell4")}
					type="spell4"
				/>
			</div>
			<div className="text-center">
				<h4 className="text-xl font-bold mb-1">{selectedAbility.name}</h4>
				<p
					className="text-sm text-gray-300 max-w-2xl mx-auto"
					dangerouslySetInnerHTML={{ __html: processedDescription }}
				></p>

				<div className="mt-4 border-t border-gray-700/50 pt-4 text-sm">
					{selectedAbility.cooldownBurn &&
						selectedAbility.cooldownBurn.includes("/") && (
							<p>
								<span className="font-semibold text-gray-400">Cooldown: </span>{" "}
								{selectedAbility.cooldownBurn}
							</p>
						)}
					{processedCost && (
						<p>
							<span className="font-semibold text-gray-400">Cost: </span>
							<span dangerouslySetInnerHTML={{ __html: processedCost }}></span>
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
