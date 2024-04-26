"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SearchBar = () => {
	const [combinedInput, setCombinedInput] = useState("");
	const router = useRouter();

	const handleSearch = () => {
		const [gameName, tagLine] = combinedInput.split("#");
		router.push(`/profile?gameName=${gameName}&tagLine=${tagLine}`);
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			handleSearch();
		}
	};

	return (
		<div className="flex flex-col sm:flex-row items-center justify-center p-4 rounded-lg">
			<input
				className="flex-1 p-2 mb-4 sm:mb-0 sm:mr-2 border border-gray-300 rounded bg-[#13151b] text-[#979aa0] placeholder-gray-400"
				type="text"
				placeholder="gameName#tagLine"
				value={combinedInput}
				onChange={(e) => setCombinedInput(e.target.value)}
				onKeyDown={handleKeyDown}
			/>

			{/* Search button */}
			<button
				className="p-2 bg-blue-500 text-[#979aa0] rounded w-full sm:w-auto"
				onClick={handleSearch}
			>
				Search
			</button>
		</div>
	);
};

export default SearchBar;
