import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
	FaGlobeAmericas,
	FaTrophy,
	FaChevronDown,
	FaChevronUp,
} from "react-icons/fa";

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
		}, [value]); // Recalculate width if value changes (might affect button size)

		const handleSelect = (optionValue) => {
			onChange({ target: { value: optionValue } });
			setIsOpen(false);
		};

		const getOptionDisplay = (optionKey) => {
			const option = options[optionKey];
			const isTier = label === "Tier";
			const tierName = typeof option === "object" ? option.name : option;
			const tierKeyLower = optionKey.toLowerCase();
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
							alt={`${tierName} Emblem`}
							width={20}
							height={20}
							className="w-5 h-5" // Fixed size for consistency
						/>
					)}
					{/* Add region flag logic here if images become available */}
					<span>{tierName}</span>
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
				icon={
					<FaTrophy
						className={tierMappings[tier]?.color || "text-[--text-secondary]"}
					/>
				}
				value={tier}
				options={tierMappings}
				onChange={(e) => setTier(e.target.value)}
			/>

			{/* Division Dropdown */}
			<CustomSelect
				label="Division"
				icon={
					<span className="text-[--text-secondary] font-semibold text-xs w-4 text-center">
						{division}
					</span>
				}
				value={division}
				options={divisionMappings}
				onChange={(e) => setDivision(e.target.value)}
				disabled={["CHALLENGER", "GRANDMASTER", "MASTER"].includes(tier)}
			/>
		</div>
	);
};

export default Dropdowns;
