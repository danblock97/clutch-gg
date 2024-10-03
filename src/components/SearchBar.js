"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import debounce from "lodash.debounce";

const SearchBar = ({ onSearch }) => {
	const [combinedInput, setCombinedInput] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const router = useRouter();
	const dropdownRef = useRef(null);

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
			.ilike("gamename", `${gameName || ""}%`) // Match gamenames starting with input
			.ilike("tagline", `%${tagLinePartial || ""}%`) // Optional tagline partial match
			.limit(10);

		if (error) {
			console.error("Error fetching suggestions:", error);
			setSuggestions([]);
		} else {
			console.log("Suggestions:", data); // Log suggestions to check data
			setSuggestions(data);
		}
	};

	// Debounced version of fetchSuggestions
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

	const handleSearch = (gameNameFromClick, tagLineFromClick) => {
		const [gameName, tagLine] =
			gameNameFromClick && tagLineFromClick
				? [gameNameFromClick, tagLineFromClick] // Use values from click
				: combinedInput.split("#"); // Fallback to manual input

		if (gameName && tagLine) {
			router.push(
				`/profile?gameName=${encodeURIComponent(
					gameName
				)}&tagLine=${encodeURIComponent(tagLine)}`
			);
		} else {
			alert("Please enter both game name and tagline.");
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

		// Set input field value for user feedback
		setCombinedInput(`${selectedGameName}#${selectedTagLine}`);

		// Hide dropdown and clear suggestions
		setIsDropdownVisible(false);
		setSuggestions([]);

		// Call handleSearch with the selected values directly
		handleSearch(selectedGameName, selectedTagLine);
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
		<div className="relative w-full">
			<input
				className="w-full p-4 pl-6 pr-12 text-white bg-[#13151b] rounded-lg border border-[#33374a] shadow-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b3e51]"
				type="text"
				placeholder="Riot ID.. (e.g: Faker#SKT)"
				value={combinedInput}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
			/>
			<button
				className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-transparent border-none outline-none cursor-pointer"
				onClick={handleSearch}
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

			{/* Suggestions Dropdown */}
			{isDropdownVisible && suggestions.length > 0 && (
				<ul
					className="absolute z-10 bg-[#1a1d26] border border-[#33374a] shadow-lg rounded-xl w-full"
					style={{ top: "100%" }} // Ensure it aligns right below the search bar
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

// Function to return badge color based on region
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
