"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SearchBar = () => {
	const [gameName, setGameName] = useState("");
	const [tagLine, setTagLine] = useState("");
	const router = useRouter();

	const handleSearch = () => {
		router.push(`/profile?gameName=${gameName}&tagLine=${tagLine}`);
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			handleSearch();
		}
	};

	return (
		<div className="flex flex-col sm:flex-row items-center justify-center p-4 bg-gray-800 rounded-lg">
			<div className="flex justify-center sm:justify-start mb-4 sm:mb-0 sm:mr-2">
				<input
					className="flex-1 p-2 mb-4 sm:mb-0 sm:mr-2 border border-gray-300 rounded bg-gray-700 text-white placeholder-gray-400"
					type="text"
					placeholder="gameName"
					value={gameName}
					onChange={(e) => setGameName(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
			</div>

			<input
				className="flex-1 p-2 mb-4 sm:mb-0 sm:mr-2 border border-gray-300 rounded bg-gray-700 text-white placeholder-gray-400"
				type="text"
				placeholder="tagLine"
				value={tagLine}
				onChange={(e) => setTagLine(e.target.value)}
				onKeyDown={handleKeyDown}
			/>

			{/* Search button */}
			<button
				className="p-2 bg-blue-500 text-white rounded w-full sm:w-auto"
				onClick={handleSearch}
			>
				Search
			</button>
		</div>
	);
};

export default SearchBar;
