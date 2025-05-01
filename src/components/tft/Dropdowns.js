import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
	FaGlobeAmericas,
	FaTrophy,
	FaChevronDown,
	FaChevronUp,
} from "react-icons/fa";

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

// Re-use the CustomSelect component logic from League Dropdowns
const CustomSelect = ({
	label,
	icon,
	value,
	options,
	onChange,
	disabled = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectRef = useRef(null);
	const buttonRef = useRef(null);
	const [dropdownWidth, setDropdownWidth] = useState(0);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (selectRef.current && !selectRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (buttonRef.current) {
			setDropdownWidth(buttonRef.current.offsetWidth);
		}
	}, [value]); // Recalculate width if value changes

	const handleSelect = (optionValue) => {
		onChange({ target: { value: optionValue } });
		setIsOpen(false);
	};

	const getOptionDisplay = (optionKey) => {
		const option = options[optionKey];
		const isTier = label === "Tier";
		const optionName = typeof option === "object" ? option.name : option;
		const tierKeyLower = optionKey.toLowerCase();
		// Assuming TFT emblems follow the same naming convention
		const emblemPath = isTier
			? `/images/league/rankedEmblems/${tierKeyLower}.webp`
			: null;

		return (
			<li
				key={optionKey}
				className={`px-3 py-2 cursor-pointer hover:bg-[--primary]/10 flex items-center gap-2 ${
					isTier ? "text-white" : "text-[--text-primary]" // White text for tiers
				}`}
				onClick={() => handleSelect(optionKey)}
			>
				{isTier && emblemPath && (
					<Image
						src={emblemPath}
						alt={`${optionName} Emblem`}
						width={20}
						height={20}
						className="w-5 h-5"
					/>
				)}
				{/* Add region flag logic here if needed */}
				<span>{optionName}</span>
			</li>
		);
	};

	const displayValue =
		typeof options[value] === "object" ? options[value].name : options[value];

	return (
		<div className="relative w-full sm:w-48" ref={selectRef}>
			<button
				ref={buttonRef}
				onClick={() => setIsOpen(!isOpen)}
				disabled={disabled}
				className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md border border-[--card-border] bg-[--card-bg] hover:bg-[--card-bg-secondary] focus:outline-none focus:ring-1 focus:ring-[--primary] transition-colors duration-150 ${
					disabled ? "opacity-50 cursor-not-allowed" : ""
				}`}
			>
				<div className="flex items-center gap-2">
					{icon}
					<span className="font-medium">{displayValue}</span>
				</div>
				{isOpen ? <FaChevronUp /> : <FaChevronDown />}
			</button>
			{isOpen && !disabled && (
				<ul
					className="absolute z-20 mt-1 bg-[--card-bg-secondary] border border-[--card-border] rounded-md shadow-lg overflow-hidden custom-scrollbar max-h-60 overflow-y-auto"
					style={{ width: `${dropdownWidth}px` }} // Set width dynamically
				>
					{Object.keys(options).map(getOptionDisplay)}
				</ul>
			)}
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
