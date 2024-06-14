"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SearchBar = ({ onSearch }) => {
	const [combinedInput, setCombinedInput] = useState("");
	const router = useRouter();

	const handleSearch = () => {
		const [gameName, tagLine] = combinedInput.split("#");
		console.log("Search initiated"); // Add this line to verify the function call
		router.push(`/profile?gameName=${gameName}&tagLine=${tagLine}`);
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
		<div className="flex items-center justify-center p-4">
			<div className="relative w-full max-w-lg">
				<input
					className="w-full p-4 pl-8 text-white bg-[#13151b] rounded-full border-none shadow-lg placeholder-gray-400 focus:outline-none focus:ring-2"
					type="text"
					placeholder="GameName#tagLine"
					value={combinedInput}
					onChange={(e) => setCombinedInput(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
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
