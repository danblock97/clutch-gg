"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaGlobeAmericas, FaChevronDown, FaChevronUp } from "react-icons/fa";

const regionMappings = {
	ALL: "All Regions",
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

export const RegionDropdown = ({ region, setRegion, disabled = false }) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectRef = useRef(null);
	const buttonRef = useRef(null);
	const [dropdownWidth, setDropdownWidth] = useState(0);

	// Parse current region(s) into an array
	const selectedRegions = region === "ALL" ? ["ALL"] : region.split(",").map(r => r.trim());

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
	}, [region]);

	const handleSelect = (optionValue) => {
		if (optionValue === "ALL") {
			setRegion("ALL");
		} else {
			const newSelectedRegions = selectedRegions.includes("ALL") 
				? [optionValue] // Replace "ALL" with specific region
				: selectedRegions.includes(optionValue)
					? selectedRegions.filter(r => r !== optionValue) // Remove if already selected
					: [...selectedRegions.filter(r => r !== "ALL"), optionValue]; // Add if not selected, remove "ALL"
			
			const newRegion = newSelectedRegions.length === 0 
				? "ALL" 
				: newSelectedRegions.join(",");
			setRegion(newRegion);
		}
		// Don't close dropdown for multiselect behavior
	};

	const getOptionDisplay = (optionKey) => {
		const optionName = regionMappings[optionKey];
		const isSelected = selectedRegions.includes(optionKey);

		return (
			<li
				key={optionKey}
				className={`px-3 py-2 cursor-pointer hover:bg-[--primary]/10 text-[--text-primary] flex items-center justify-between ${
					isSelected ? 'bg-[--primary]/20' : ''
				}`}
				onClick={() => handleSelect(optionKey)}
			>
				<span>{optionName}</span>
				{isSelected && <span className="text-[--primary] text-sm">✓</span>}
			</li>
		);
	};

	const displayValue = selectedRegions.length === 1 && selectedRegions[0] === "ALL"
		? "All Regions"
		: selectedRegions.length === 1
			? regionMappings[selectedRegions[0]]
			: `${selectedRegions.length} regions selected`;

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
					<FaGlobeAmericas className="text-[--text-secondary]" />
					<span className="font-medium">{displayValue}</span>
				</div>
				{isOpen ? <FaChevronUp /> : <FaChevronDown />}
			</button>
			{isOpen && !disabled && (
				<ul
					className="absolute z-20 mt-1 bg-[--card-bg-secondary] border border-[--card-border] rounded-md shadow-lg overflow-hidden custom-scrollbar max-h-60 overflow-y-auto"
					style={{ width: `${dropdownWidth}px` }}
				>
					{Object.keys(regionMappings).map(getOptionDisplay)}
				</ul>
			)}
		</div>
	);
};
