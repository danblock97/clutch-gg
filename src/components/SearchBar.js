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
	{ code: "OC1", name: "OCE" },
	{ code: "TR1", name: "TR" },
	{ code: "RU", name: "RU" },
];

const SearchBar = ({ onSearch }) => {
	const [combinedInput, setCombinedInput] = useState("");
	const [selectedRegion, setSelectedRegion] = useState("NA1");
	const [suggestions, setSuggestions] = useState([]);
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const router = useRouter();
	const dropdownRef = useRef(null);

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

	const debouncedFetchSuggestions = useRef(
		debounce((input) => {
			fetchSuggestions(input);
		}, 300)
	).current;

	const handleInputChange = (e) => {
		const value = e.target.value;
		setCombinedInput(value);
		debouncedFetchSuggestions(value);
		setIsDropdownVisible(true);
	};

	const handleRegionChange = (e) => {
		setSelectedRegion(e.target.value);
	};

	const handleSearch = (gameNameFromClick, tagLineFromClick, regionFromClick) => {
		const [gameName, tagLine] =
			gameNameFromClick && tagLineFromClick
				? [gameNameFromClick, tagLineFromClick]
				: combinedInput.split("#");

		const region = regionFromClick || selectedRegion;

		if (gameName && tagLine && region) {
			router.push(
				`/profile?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`
			);
		} else {
			alert("Please enter both game name, tagline, and select a region.");
		}

		setCombinedInput("");
		setSuggestions([]);
		setIsDropdownVisible(false);

		if (onSearch) {
			onSearch();
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			handleSearch();
		}
	};

	const handleSuggestionClick = (suggestion) => {
		const selectedGameName = suggestion.gamename;
		const selectedTagLine = suggestion.tagline;
		const region = suggestion.region;

		setCombinedInput(`${selectedGameName}#${selectedTagLine}`);
		setIsDropdownVisible(false);
		setSuggestions([]);
		handleSearch(selectedGameName, selectedTagLine, region);
	};

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
		<div className="relative w-full flex items-center">
			<div className="flex w-full h-12 bg-[#13151b] rounded-md overflow-hidden border border-[#33374a] shadow-md">
				<select
					value={selectedRegion}
					onChange={handleRegionChange}
					className="bg-[#13151b] text-white px-3 focus:outline-none text-sm"
					style={{ height: "100%" }}
				>
					{regions.map((region) => (
						<option key={region.code} value={region.code}>
							{region.name}
						</option>
					))}
				</select>
				<input
					className="flex-grow p-4 pl-3 text-white bg-[#13151b] focus:outline-none placeholder-gray-500 text-sm"
					type="text"
					placeholder="Riot ID.. (e.g: Faker#SKT)"
					value={combinedInput}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
				/>
				<button
					className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-transparent border-none outline-none cursor-pointer"
					onClick={() => handleSearch()}
				>
					<svg
						className="w-6 h-6 text-gray-500 hover:text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
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

			{isDropdownVisible && suggestions.length > 0 && (
				<ul
					className="absolute z-10 bg-[#1a1d26] border border-[#33374a] shadow-lg rounded-xl w-full mt-1"
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
