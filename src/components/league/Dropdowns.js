import React from "react";
import { FaGlobeAmericas, FaTrophy, FaChevronDown } from "react-icons/fa";

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

// Tier mappings with colors
const tierMappings = {
	CHALLENGER: { name: "Challenger", color: "text-[--challenger]" },
	GRANDMASTER: { name: "Grandmaster", color: "text-[--grandmaster]" },
	MASTER: { name: "Master", color: "text-[--master]" },
	DIAMOND: { name: "Diamond", color: "text-[--diamond]" },
	EMERALD: { name: "Emerald", color: "text-[--emerald]" },
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

const Dropdowns = ({
					   region,
					   tier,
					   division,
					   setRegion,
					   setTier,
					   setDivision,
				   }) => {
	// Custom select component to have more styling control
	const CustomSelect = ({ label, icon, value, options, onChange, disabled = false }) => {
		return (
			<div className="relative">
				<label className="text-xs text-[--text-secondary] mb-1 block">{label}</label>
				<div className={`relative bg-[--card-bg] rounded-lg overflow-hidden border border-[--card-border] ${disabled ? 'opacity-60' : 'hover:border-[--primary]'} transition-colors`}>
					{/* Custom select header */}
					<div className="flex items-center gap-2 pr-10 pl-3 py-2">
						{icon}
						<select
							value={value}
							onChange={onChange}
							disabled={disabled}
							className="appearance-none bg-transparent w-full focus:outline-none text-sm cursor-pointer disabled:cursor-not-allowed"
						>
							{Object.entries(options).map(([key, option]) => {
								// Handle both simple and complex options
								const optionValue = key;
								const optionLabel = typeof option === 'object' ? option.name : option;
								const optionColor = typeof option === 'object' ? option.color : '';

								return (
									<option key={optionValue} value={optionValue} className={optionColor}>
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

	return (
		<div className="flex flex-col sm:flex-row gap-4">
			{/* Region Dropdown */}
			<CustomSelect
				label="Region"
				icon={<FaGlobeAmericas className="text-[--text-secondary]" />}
				value={region}
				options={regionMappings}
				onChange={(e) => setRegion(e.target.value)}
			/>

			{/* Tier Dropdown */}
			<CustomSelect
				label="Tier"
				icon={<FaTrophy className={tierMappings[tier]?.color || "text-[--text-secondary]"} />}
				value={tier}
				options={tierMappings}
				onChange={(e) => setTier(e.target.value)}
			/>

			{/* Division Dropdown */}
			<CustomSelect
				label="Division"
				icon={<span className="text-[--text-secondary] font-semibold text-xs w-4 text-center">{division}</span>}
				value={division}
				options={divisionMappings}
				onChange={(e) => setDivision(e.target.value)}
				disabled={["CHALLENGER", "GRANDMASTER", "MASTER"].includes(tier)}
			/>
		</div>
	);
};

export default Dropdowns;