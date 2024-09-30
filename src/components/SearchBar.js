"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SearchBar = ({ onSearch }) => {
	const [combinedInput, setCombinedInput] = useState("");
	const router = useRouter();

	const handleSearch = () => {
		const [gameName, tagLine] = combinedInput.split("#");
		if (gameName && tagLine) {
			router.push(`/profile?gameName=${gameName}&tagLine=${tagLine}`);
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
		<div className="flex items-center justify-center w-full">
			<div className="relative w-full max-w-3xl">
				{/* Input Field */}
				<input
					className="w-full p-4 pl-6 pr-12 text-white bg-[#13151b] rounded-xl border border-[#33374a] shadow-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b3e51]"
					type="text"
					placeholder="Riot ID.. (e.g: Faker#SKT)"
					value={combinedInput}
					onChange={(e) => setCombinedInput(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				{/* Search Button Icon */}
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
			</div>
		</div>
	);
};

export default SearchBar;
