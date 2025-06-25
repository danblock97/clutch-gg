"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaGlobeAmericas, FaChevronDown, FaChevronUp } from "react-icons/fa";

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

export const RegionDropdown = ({ region, setRegion, disabled = false }) => {
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
	}, [region]);

	const handleSelect = (optionValue) => {
		setRegion(optionValue);
		setIsOpen(false);
	};

	const getOptionDisplay = (optionKey) => {
		const optionName = regionMappings[optionKey];

		return (
			<li
				key={optionKey}
				className="px-3 py-2 cursor-pointer hover:bg-[--primary]/10 text-[--text-primary]"
				onClick={() => handleSelect(optionKey)}
			>
				<span>{optionName}</span>
			</li>
		);
	};

	const displayValue = regionMappings[region];

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
