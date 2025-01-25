"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import debounce from "lodash.debounce";

const regions = [
	{ code: "BR1", name: "BR" },
	{ code: "EUN1", name: "EUNE" },
	{ code: "EUW1", name: "EUW" },
	{ code: "JP1", name: "JP" },
	{ code: "KR", name: "KR" },
	{ code: "LA1", name: "LAN" },
	{ code: "LA2", name: "LAS" },
	{ code: "NA1", name: "NA" },
	{ code: "ME1", name: "ME" },
	{ code: "OC1", name: "OCE" },
	{ code: "TR1", name: "TR" },
	{ code: "RU", name: "RU" },
	{ code: "SG2", name: "SG" },
	{ code: "TW2", name: "TW" },
	{ code: "VN2", name: "VN" },
];

const SearchBar = ({ onSearch, initialRegion }) => {
	const [combinedInput, setCombinedInput] = useState("");
	const [selectedRegion, setSelectedRegion] = useState(initialRegion || "EUW1");
	const [suggestions, setSuggestions] = useState([]);
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const router = useRouter();
	const dropdownRef = useRef(null);

	// Sync region if initialRegion prop changes
	useEffect(() => {
		if (initialRegion) {
			setSelectedRegion(initialRegion);
		}
	}, [initialRegion]);

	// Fetch suggestions from Supabase
	const fetchSuggestions = async (input) => {
		if (!input) {
			setSuggestions([]);
			return;
		}

		const [gameName, tagLinePartial] = input.split("#");
		const { data, error } = await supabase
			.from("profiles")
			.select("gamename, tagline, region")
			.ilike("gamename", `${gameName || ""}%`)
			.ilike("tagline", `%${tagLinePartial || ""}%`)
			.limit(10);

		if (error) {
			console.error("Error fetching suggestions:", error);
			setSuggestions([]);
		} else {
			setSuggestions(data);
		}
	};

	// Debounce suggestions for better performance
	const debouncedFetchSuggestions = useRef(
		debounce((input) => {
			fetchSuggestions(input);
		}, 300)
	).current;

	// Input change handler
	const handleInputChange = (e) => {
		const value = e.target.value;
		setCombinedInput(value);
		debouncedFetchSuggestions(value);
		setIsDropdownVisible(true);
	};

	// Region change handler
	const handleRegionChange = (e) => {
		setSelectedRegion(e.target.value);
	};

	// Primary search logic
	const handleSearch = (
		gameNameFromClick,
		tagLineFromClick,
		regionFromClick
	) => {
		const [gameName, tagLine] =
			gameNameFromClick && tagLineFromClick
				? [gameNameFromClick, tagLineFromClick]
				: combinedInput.split("#");

		const region = regionFromClick || selectedRegion;

		if (gameName && tagLine && region) {
			router.push(
				`/profile?gameName=${encodeURIComponent(
					gameName
				)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`
			);
		} else {
			alert("Please enter both game name, tagline, and select a region.");
		}

		// Reset
		setCombinedInput("");
		setSuggestions([]);
		setIsDropdownVisible(false);

		// Optional callback
		if (onSearch) {
			onSearch();
		}
	};

	// Handle Enter key
	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			handleSearch();
		}
	};

	// Handle suggestion selection
	const handleSuggestionClick = (suggestion) => {
		const selectedGameName = suggestion.gamename;
		const selectedTagLine = suggestion.tagline;
		const region = suggestion.region;

		setCombinedInput(`${selectedGameName}#${selectedTagLine}`);
		setIsDropdownVisible(false);
		setSuggestions([]);
		handleSearch(selectedGameName, selectedTagLine, region);
	};

	// Close dropdown if user clicks outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsDropdownVisible(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div
			className="relative mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md"
			ref={dropdownRef}
		>
			{/* Container for select + input + icon */}
			<div className="flex w-full h-12 bg-[#13151b] rounded-md overflow-hidden border border-[#33374a] shadow-md">
				{/* Region Dropdown */}
				<select
					value={selectedRegion}
					onChange={handleRegionChange}
					className="bg-[#13151b] text-white px-2 sm:px-3 text-xs sm:text-sm focus:outline-none font-sans"
				>
					{regions.map((region) => (
						<option key={region.code} value={region.code}>
							{region.name}
						</option>
					))}
				</select>

				{/* Text Input */}
				<input
					className="flex-grow p-3 sm:p-4 text-xs sm:text-sm text-white bg-[#13151b] focus:outline-none placeholder-gray-500"
					type="text"
					placeholder="Riot ID.. (e.g: Faker#SKT)"
					value={combinedInput}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
				/>

				{/* Search Icon/Button */}
				<button
					className="flex items-center justify-center px-2 sm:px-3 text-gray-500 hover:text-white focus:outline-none"
					onClick={() => handleSearch()}
				>
					<svg
						className="w-5 h-5 sm:w-6 sm:h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
				</button>
			</div>

			{/* Suggestions Dropdown */}
			{isDropdownVisible && suggestions.length > 0 && (
				<ul
					className="absolute z-10 bg-[#1a1d26] border border-[#33374a] shadow-lg rounded-xl w-full mt-1 max-h-48 overflow-y-auto"
					style={{ top: "100%" }}
				>
					{suggestions.map((suggestion, index) => (
						<li
							key={index}
							className="flex justify-between items-center p-3 hover:bg-[#2f3242] cursor-pointer"
							onClick={() => handleSuggestionClick(suggestion)}
						>
							<div className="text-white">
								{suggestion.gamename}#{suggestion.tagline}
							</div>
							<span
								className={`px-3 py-1 text-xs rounded-lg font-medium ${getBadgeColor(
									suggestion.region
								)}`}
							>
								{suggestion.region.toUpperCase()}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

// Badge color logic
const getBadgeColor = (region) => {
	switch (region.toUpperCase()) {
		case "EUW":
			return "bg-blue-600 text-white";
		case "EUNE":
			return "bg-green-600 text-white";
		case "NA":
			return "bg-purple-600 text-white";
		case "BR":
			return "bg-green-500 text-white";
		case "TR":
			return "bg-red-600 text-white";
		default:
			return "bg-gray-600 text-white";
	}
};

export default SearchBar;
