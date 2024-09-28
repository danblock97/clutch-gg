"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SearchBar = ({ onSearch }) => {
	const [combinedInput, setCombinedInput] = useState("");
	const [selectedRegion, setSelectedRegion] = useState("NA1"); // Default region
	const router = useRouter();
	const gamePath = "/league";

	const handleSearch = () => {
		const [gameName, tagLine] = combinedInput.split("#");
		if (gameName && tagLine) {
			router.push(
				`${gamePath}/profile?gameName=${encodeURIComponent(
					gameName
				)}&tagLine=${encodeURIComponent(tagLine)}&region=${selectedRegion}`
			);
		} else {
			alert("Please enter both game name and tagline.");
			return;
		}
		setCombinedInput("");
		if (onSearch) {
			onSearch();
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			handleSearch();
		}
	};

	return (
		<div className="flex items-center justify-center p-4 w-full">
			<div className="relative w-full max-w-3xl">
				<input
					className="w-full p-4 pl-8 text-white bg-[#13151b] rounded-full border-none shadow-lg placeholder-gray-400 focus:outline-none focus:ring-2"
					type="text"
					placeholder="Enter Your RiotID..."
					value={combinedInput}
					onChange={(e) => setCombinedInput(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				<select
					value={selectedRegion}
					onChange={(e) => setSelectedRegion(e.target.value)}
					className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-[#13151b] text-white p-2 rounded"
				>
					<option value="NA1">North America</option>
					<option value="ME1">Middle East</option>
					<option value="EUW1">Europe West</option>
					<option value="EUN1">Europe Nordic & East</option>
					<option value="OC1">Oceania</option>
					<option value="KR">Korea</option>
					<option value="JP1">Japan</option>
					<option value="BR1">Brazil</option>
					<option value="LA1">LAS</option>
					<option value="LA2">LAN</option>
					<option value="RU">Russia</option>
					<option value="TR1">Türkiye</option>
					<option value="SG2">Singapore</option>
					<option value="PH2">Phillippines</option>
					<option value="TW2">Taiwan</option>
					<option value="VN2">Vietnam</option>
					<option value="TH2">Thailand</option>
				</select>
				<button
					className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-transparent border-none outline-none cursor-pointer"
					onClick={handleSearch}
				>
					<svg
						className="w-6 h-6 text-gray-400 hover:text-white"
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
		</div>
	);
};

export default SearchBar;
