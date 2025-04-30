import React from "react";
import { FaGlobeAmericas, FaTrophy, FaChevronDown } from "react-icons/fa";

// Region mappings (TFT specific, ensure these are correct)
const regionMappings = {
	BR1: "Brazil",
	EUN1: "Europe Nordic & East",
	EUW1: "Europe West",
	JP1: "Japan",
	KR: "Korea",
	LA1: "Latin America North",
	LA2: "Latin America South",
	NA1: "North America",
	OC1: "Oceania",
	TR1: "Turkey",
	RU: "Russia",
	// Add other TFT regions if needed (e.g., PH2, SG2, TH2, TW2, VN2)
};

// Tier mappings with colors (TFT specific)
const tierMappings = {
	CHALLENGER: { name: "Challenger", color: "text-[--challenger]" },
	GRANDMASTER: { name: "Grandmaster", color: "text-[--grandmaster]" },
	MASTER: { name: "Master", color: "text-[--master]" },
	DIAMOND: { name: "Diamond", color: "text-[--diamond]" },
	EMERALD: { name: "Emerald", color: "text-[--emerald]" }, // Emerald exists in TFT?
	PLATINUM: { name: "Platinum", color: "text-[--platinum]" },
	GOLD: { name: "Gold", color: "text-[--gold]" },
	SILVER: { name: "Silver", color: "text-[--silver]" },
	BRONZE: { name: "Bronze", color: "text-[--bronze]" },
	IRON: { name: "Iron", color: "text-[--iron]" },
};

// Division mappings
const divisionMappings = {
	I: "I",
	II: "II",
	III: "III",
	IV: "IV",
};

// Re-use the CustomSelect component from League Dropdowns
const CustomSelect = ({
	label,
	icon,
	value,
	options,
	onChange,
	disabled = false,
}) => {
	return (
		<div className="relative">
			<label className="text-xs text-[--text-secondary] mb-1 block">
				{label}
			</label>
			<div
				className={`relative bg-[--card-bg] rounded-lg overflow-hidden border border-[--card-border] ${
					disabled ? "opacity-60" : "hover:border-[--primary]"
				} transition-colors`}
			>
				{/* Custom select header */}
				<div className="flex items-center gap-2 pr-10 pl-3 py-2">
					{icon}
					<select
						value={value}
						onChange={onChange}
						disabled={disabled}
						className="appearance-none bg-transparent w-full focus:outline-none text-sm cursor-pointer disabled:cursor-not-allowed"
						style={{
							colorScheme: "dark",
							backgroundColor: "var(--card-bg)",
							color: "var(--text-primary)",
						}}
					>
						{Object.entries(options).map(([key, option]) => {
							// Handle both simple and complex options
							const optionValue = key;
							const optionLabel =
								typeof option === "object" ? option.name : option;
							const optionColor =
								typeof option === "object" ? option.color : "";

							return (
								<option
									key={optionValue}
									value={optionValue}
									className={optionColor} // Apply color class if available
								>
									{optionLabel}
								</option>
							);
						})}
					</select>

					{/* Dropdown arrow */}
					<div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
						<FaChevronDown className="text-[--text-secondary]" />
					</div>
				</div>
			</div>
		</div>
	);
};

const TFTDropdowns = ({
	region,
	tier,
	division,
	setRegion,
	setTier,
	setDivision,
}) => {
	const handleRegionChange = (e) => setRegion(e.target.value);
	const handleTierChange = (e) => {
		const newTier = e.target.value;
		setTier(newTier);
		// Reset division to 'I' if the new tier is Master or above (no divisions)
		if (
			["MASTER", "GRANDMASTER", "CHALLENGER"].includes(newTier.toUpperCase())
		) {
			setDivision("I");
		}
	};
	const handleDivisionChange = (e) => setDivision(e.target.value);

	// Determine if division dropdown should be enabled (disabled for Master+)
	const isDivisionEnabled = !["MASTER", "GRANDMASTER", "CHALLENGER"].includes(
		tier.toUpperCase()
	);

	return (
		<div className="flex flex-col sm:flex-row gap-4">
			{/* Region Dropdown */}
			<CustomSelect
				label="Region"
				icon={<FaGlobeAmericas className="text-[--text-secondary]" />}
				value={region}
				options={regionMappings}
				onChange={handleRegionChange}
			/>

			{/* Tier Dropdown */}
			<CustomSelect
				label="Tier"
				icon={
					<FaTrophy
						className={tierMappings[tier]?.color || "text-[--text-secondary]"}
					/>
				}
				value={tier}
				options={tierMappings}
				onChange={handleTierChange}
			/>

			{/* Division Dropdown (Conditional) */}
			<CustomSelect
				label="Division"
				icon={
					<span className="text-[--text-secondary] font-semibold text-xs w-4 text-center">
						{division}
					</span>
				}
				value={division}
				options={divisionMappings}
				onChange={handleDivisionChange}
				disabled={!isDivisionEnabled}
			/>
		</div>
	);
};

export default TFTDropdowns;
