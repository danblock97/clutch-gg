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

const SearchBar = ({ onSearch, initialRegion, isModal, onModalClose }) => {
	const [combinedInput, setCombinedInput] = useState("");
	const [selectedRegion, setSelectedRegion] = useState(initialRegion || "EUW1");
	const [suggestions, setSuggestions] = useState([]);
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const [recentlySearched, setRecentlySearched] = useState([]);
	const router = useRouter();
	const dropdownRef = useRef(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const stored = sessionStorage.getItem("recentlySearched");
			if (stored) {
				setRecentlySearched(JSON.parse(stored));
			}
		}
	}, []);

	useEffect(() => {
		if (initialRegion) {
			setSelectedRegion(initialRegion);
		}
	}, [initialRegion]);

	const fetchSuggestions = async (input) => {
		if (!input) {
			setSuggestions([]);
			return;
		}
		const [gameName, tagLinePartial] = input.split("#");
		const { data, error } = await supabase
			.from("riot_accounts")
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
			try {
				const newEntry = { gameName, tagLine, region };
				const stored = sessionStorage.getItem("recentlySearched");
				let recent = stored ? JSON.parse(stored) : [];
				recent.unshift(newEntry);
				recent = recent.filter(
					(item, index, self) =>
						index ===
						self.findIndex(
							(i) =>
								i.gameName === item.gameName &&
								i.tagLine === item.tagLine &&
								i.region === item.region
						)
				);
				if (recent.length > 5) recent = recent.slice(0, 5);
				sessionStorage.setItem("recentlySearched", JSON.stringify(recent));
				setRecentlySearched(recent);
			} catch (e) {
				console.error(e);
			}

			router.push(
				`/league/profile?gameName=${encodeURIComponent(
					gameName
				)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`
			);
			if (isModal && onModalClose) onModalClose();
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

	const searchBarContent = (
		<div
			className="relative mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md"
			ref={dropdownRef}
		>
			<div className="flex w-full h-12 bg-[#13151b] rounded-md overflow-hidden border border-[#33374a] shadow-md">
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

				<input
					className="flex-grow p-3 sm:p-4 text-xs sm:text-sm text-white bg-[#13151b] focus:outline-none placeholder-gray-500"
					type="text"
					placeholder="Riot ID.. (e.g: Faker#SKT)"
					value={combinedInput}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
				/>

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
								className={
									"px-3 py-1 text-xs rounded-lg font-medium bg-gray-600 text-white"
								}
							>
								{suggestion.region.toUpperCase()}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);

	if (isModal) {
		return (
			<div className="fixed inset-0 flex items-center justify-center z-50">
				<div
					className="absolute inset-0 backdrop-blur-md"
					onClick={onModalClose}
				></div>
				<div className="relative p-4 w-full">
					<h1 className="text-center text-white text-6xl font-bold mb-4">
						Find Players
					</h1>
					{searchBarContent}
					<div className="mt-4 mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md">
						<div className="flex items-center my-4">
							<hr className="flex-grow border-gray-400" />
							<span className="mx-2 text-gray-400 text-xs">
								Recently Searched
							</span>
							<hr className="flex-grow border-gray-400" />
						</div>
						<ul>
							{recentlySearched.map((entry, index) => (
								<li
									key={index}
									onClick={() => {
										router.push(
											`/league/profile?gameName=${encodeURIComponent(
												entry.gameName
											)}&tagLine=${encodeURIComponent(entry.tagLine)}&region=${
												entry.region
											}`
										);
										if (onModalClose) onModalClose();
									}}
									className="text-white text-center text-md cursor-pointer hover:underline my-1"
								>
									{entry.gameName}#{entry.tagLine} ({entry.region})
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		);
	}

	return searchBarContent;
};

export default SearchBar;
