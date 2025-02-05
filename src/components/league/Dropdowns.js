import React from "react";

// Region mappings
const regionMappings = {
	BR1: "Brazil",
	EUN1: "Europe Nordic & East",
	EUW1: "Europe West",
	JP1: "Japan",
	KR: "Korea",
	LA1: "Latin America North",
	LA2: "Latin America South",
	ME1: "Middle East and North Africa",
	NA1: "North America",
	OC1: "Oceania",
	RU: "Russia",
	SG2: "Singapore",
	TR1: "Turkey",
	TW2: "Taiwan",
	VN2: "Vietnam",
};

// Tier mappings
const tierMappings = {
	CHALLENGER: "Challenger",
	GRANDMASTER: "Grandmaster",
	MASTER: "Master",
	DIAMOND: "Diamond",
	EMERALD: "Emerald",
	PLATINUM: "Platinum",
	GOLD: "Gold",
	SILVER: "Silver",
	BRONZE: "Bronze",
	IRON: "Iron",
};

// Division mappings
const divisionMappings = {
	I: "I",
	II: "II",
	III: "III",
	IV: "IV",
};

const Dropdowns = ({
	region,
	tier,
	division,
	setRegion,
	setTier,
	setDivision,
}) => {
	return (
		<div className="mt-4 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
			{/* Region dropdown */}
			<select
				value={region}
				onChange={(e) => setRegion(e.target.value)}
				className="bg-[#13151b] text-gray-200 p-2 rounded font-sans text-sm sm:text-base"
			>
				{Object.entries(regionMappings).map(([value, label]) => (
					<option key={value} value={value}>
						{label}
					</option>
				))}
			</select>

			{/* Tier dropdown */}
			<select
				value={tier}
				onChange={(e) => setTier(e.target.value)}
				className="bg-[#13151b] text-gray-200 p-2 rounded font-sans text-sm sm:text-base"
			>
				{Object.entries(tierMappings).map(([value, label]) => (
					<option key={value} value={value}>
						{label}
					</option>
				))}
			</select>

			{/* Division dropdown (disabled for top tiers) */}
			<select
				value={division}
				onChange={(e) => setDivision(e.target.value)}
				disabled={["CHALLENGER", "GRANDMASTER", "MASTER"].includes(tier)}
				className="bg-[#13151b] text-gray-200 p-2 rounded font-sans text-sm sm:text-base disabled:opacity-50"
			>
				{Object.entries(divisionMappings).map(([value, label]) => (
					<option key={value} value={value}>
						{label}
					</option>
				))}
			</select>
		</div>
	);
};

export default Dropdowns;
